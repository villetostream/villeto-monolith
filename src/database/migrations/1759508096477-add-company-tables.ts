import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyTables1759508096477 implements MigrationInterface {
  name = 'AddCompanyTables1759508096477';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."companies"
            ADD "businessName" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."companies"
            ADD "taxId" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."companies"
            ADD "registrationId" character varying
        `);
    await queryRunner.query(`
            CREATE TYPE "villeto_test"."companies_accounttype_enum" AS ENUM('personal', 'business', 'enterprise', 'demo')
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."companies"
            ADD "accountType" "villeto_test"."companies_accounttype_enum" NOT NULL DEFAULT 'demo'
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."companies"
            ALTER COLUMN "websiteUrl" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."companies" DROP CONSTRAINT "UQ_fdc88bd0b5a28aed22dc5626dcb"
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."companies"
            ALTER COLUMN "address" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."onboardings" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."onboardings"
            ADD "status" boolean NOT NULL DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."onboardings"
            ALTER COLUMN "step"
            SET DEFAULT '1'
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."onboardings"
            ADD CONSTRAINT "CHK_83de79987e56f22e67db00ad75" CHECK ("step" > 6)
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."companies"
            ADD CONSTRAINT "UQ_COMPANY" UNIQUE (
                    "businessName",
                    "taxId",
                    "registrationId",
                    "websiteUrl"
                )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."companies" DROP CONSTRAINT "UQ_COMPANY"
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."onboardings" DROP CONSTRAINT "CHK_83de79987e56f22e67db00ad75"
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."onboardings"
            ALTER COLUMN "step" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."onboardings" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."onboardings"
            ADD "status" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."companies"
            ALTER COLUMN "address"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."companies"
            ADD CONSTRAINT "UQ_fdc88bd0b5a28aed22dc5626dcb" UNIQUE ("websiteUrl")
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."companies"
            ALTER COLUMN "websiteUrl"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."companies" DROP COLUMN "accountType"
        `);
    await queryRunner.query(`
            DROP TYPE "villeto_test"."companies_accounttype_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."companies" DROP COLUMN "registrationId"
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."companies" DROP COLUMN "taxId"
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."companies" DROP COLUMN "businessName"
        `);
  }
}
