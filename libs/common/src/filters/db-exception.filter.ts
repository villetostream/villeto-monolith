// src/common/filters/postgres-error.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { QueryFailedError, DataSource } from 'typeorm';
import { Response } from 'express';

/**
 * Postgres SQLSTATE codes this filter knows about.
 * See: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_NOT_NULL_VIOLATION = '23502';
const PG_CHECK_VIOLATION = '23514';
const PG_STRING_TRUNCATION = '22001';
const PG_SERIALIZATION_FAILURE = '40001';
const PG_DEADLOCK_DETECTED = '40P01';

type PostgresDriverError = {
  // driver-dependent shape — these are the common fields we use
  code?: string; // SQLSTATE (e.g. '23505')
  constraint?: string; // constraint name (Postgres)
  detail?: string; // human-readable detail (contains column info)
  message?: string;
  // ... other driver-specific properties exist but we don't rely on them
};

@Injectable()
@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  constructor(private readonly dataSource: DataSource) {}

  public async catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const driverError = this.toDriverError(exception);

    const sqlState = driverError?.code;

    // handle by sqlstate
    switch (sqlState) {
      case PG_UNIQUE_VIOLATION:
        return this.handleUniqueViolation(driverError, res);

      case PG_FOREIGN_KEY_VIOLATION:
        return this.handleForeignKeyViolation(driverError, res);

      case PG_NOT_NULL_VIOLATION:
        return this.handleNotNullViolation(driverError, res);

      case PG_CHECK_VIOLATION:
        return this.handleCheckViolation(driverError, res);

      case PG_STRING_TRUNCATION:
        return this.handleStringTruncation(driverError, res);

      case PG_SERIALIZATION_FAILURE:
      case PG_DEADLOCK_DETECTED:
        return this.handleTransientFailure(sqlState!, driverError, res);

      default:
        // Not a Postgres error we map — rethrow so other handlers or Nest's default handle it.
        // But log first for observability.
        this.logger.error('Unhandled database error', {
          code: driverError?.code,
          message: driverError?.message,
          detail: driverError?.detail,
        });
        throw exception;
    }
  }

  // -------------------- handlers --------------------

  private async handleUniqueViolation(
    driverError: PostgresDriverError,
    res: Response,
  ) {
    // Try to resolve table + columns from constraint name via information_schema
    const constraintName = driverError.constraint;
    let tableName = 'record';
    let columnNames: string[] = [];

    if (constraintName) {
      try {
        const rows = (await this.dataSource.query(
          `
          SELECT tc.table_name, kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
           AND tc.constraint_schema = kcu.constraint_schema
          WHERE tc.constraint_name = $1
          ORDER BY kcu.ordinal_position;
          `,
          [constraintName],
        )) as Array<{ table_name: string; column_name: string }>;

        if (rows.length > 0) {
          tableName = rows[0].table_name;
          columnNames = rows.map((r) => r.column_name);
        }
      } catch (err) {
        // Non-fatal — fallback to parsing detail
        this.logger.warn(
          `Failed to query information_schema for constraint ${constraintName}: ${(err as Error).message}`,
        );
      }
    }

    // fallback to parsing detail like: "Key (col1, col2)=(x,y) already exists."
    if (columnNames.length === 0 && typeof driverError.detail === 'string') {
      columnNames = this.parseColumnsFromDetail(driverError.detail);
    }

    const fieldsText =
      columnNames.length > 0 ? columnNames.join(', ') : 'specified field';
    const plural = columnNames.length > 1 ? 'fields' : 'field';
    const message = `A ${tableName} with the ${plural} ${fieldsText} already exists`;

    return res.status(HttpStatus.CONFLICT).json({
      statusCode: HttpStatus.CONFLICT,
      code: PG_UNIQUE_VIOLATION,
      message,
      table: tableName,
      fields: columnNames,
    });
  }

  private handleForeignKeyViolation(
    driverError: PostgresDriverError,
    res: Response,
  ) {
    // common detail: "Key (companyId)=(...) is not present in table "companies"."
    const parsed = this.parseFkDetail(driverError.detail ?? '');
    const message = parsed
      ? `Foreign key constraint fails: ${parsed.childColumn} references missing ${parsed.parentTable}`
      : 'Foreign key constraint violation';
    return res.status(HttpStatus.CONFLICT).json({
      statusCode: HttpStatus.CONFLICT,
      code: PG_FOREIGN_KEY_VIOLATION,
      message,
      ...(parsed
        ? { childColumn: parsed.childColumn, parentTable: parsed.parentTable }
        : {}),
    });
  }

  private handleNotNullViolation(
    driverError: PostgresDriverError,
    res: Response,
  ) {
    const detailText = driverError.detail ?? '';
    const missingColumns = this.parseNotNullColumns(detailText);

    const message =
      missingColumns.length > 0
        ? `Missing required field${missingColumns.length > 1 ? 's' : ''}: ${missingColumns.join(', ')}`
        : 'Null value violates not-null constraint';

    return res.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      code: PG_NOT_NULL_VIOLATION,
      message,
      // include fields array for clients that want machine-readable info
      fields: missingColumns.length ? missingColumns : undefined,
    });
  }

  private handleCheckViolation(
    driverError: PostgresDriverError,
    res: Response,
  ) {
    // check violation detail often contains constraint name only; keep message generic
    const message = `A database check constraint was violated: ${driverError.constraint}`;
    return res.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      code: PG_CHECK_VIOLATION,
      message,
    });
  }

  private handleStringTruncation(
    driverError: PostgresDriverError,
    res: Response,
  ) {
    const message = 'A supplied value is too long for its column';
    return res.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      code: PG_STRING_TRUNCATION,
      message,
    });
  }

  private handleTransientFailure(
    sqlState: string,
    driverError: PostgresDriverError,
    res: Response,
  ) {
    const message =
      sqlState === PG_SERIALIZATION_FAILURE
        ? 'Transaction failed due to concurrent update / serialization error. Retry the operation.'
        : 'Deadlock detected. Retry the operation.';
    const status = HttpStatus.SERVICE_UNAVAILABLE;
    return res.status(status).json({
      status: status,
      code: sqlState,
      message,
      data: null,
    });
  }

  // -------------------- parsing helpers --------------------

  private toDriverError(exception: QueryFailedError): PostgresDriverError {
    // TypeORM keeps the DB error on .driverError (driver-dependent structure)
    return (exception as any).driverError as PostgresDriverError;
  }

  private parseColumnsFromDetail(detail: string): string[] {
    const match = /Key \((.+?)\)=\(.+?\) already exists/.exec(detail);
    if (!match || !match[1]) return [];
    return match[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private parseFkDetail(
    detail: string,
  ): { childColumn: string; parentTable?: string } | null {
    // Attempt to parse detail like:
    // "Key (companyId)=(1) is not present in table \"companies\"."
    const regularExpression =
      /Key \((.+?)\)=\(.+?\) is not present in table "(.+?)"/i;
    const match = regularExpression.exec(detail);
    if (match && match[1]) {
      return { childColumn: match[1].trim(), parentTable: match[2]?.trim() };
    }

    // Another possible pattern: "insert or update on table \"child\" violates foreign key constraint \"fk_name\""
    const regularExpression2 = /violates foreign key constraint "(.+?)"/i;
    if (regularExpression2.test(detail)) {
      // We can't reliably extract columns here — return generic
      return { childColumn: 'unknown' };
    }

    return null;
  }

  private parseNotNullDetail(detail: string): string | null {
    // Example: 'null value in column "foo" violates not-null constraint'
    const regex = /null value in column "(?<column>.+?)"/i;
    const match = regex.exec(detail);
    return match?.groups?.column ?? null;
  }

  /**
   * Parse Postgres not-null detail text like:
   *   'null value in column "contactEmail" violates not-null constraint'
   *
   * Returns an array of column names (usually a single item) or empty array if parsing fails.
   */
  private parseNotNullColumns(detail: string): string[] {
    const regex = /null value in column "(?<columns>.+?)"/i;
    const match = regex.exec(detail);

    if (!match || !match.groups?.columns) return [];

    // Support the unlikely case where Postgres returned a comma-separated list:
    return match.groups.columns
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}
