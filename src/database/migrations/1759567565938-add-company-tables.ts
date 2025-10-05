import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyTables1759567565938 implements MigrationInterface {
  name = 'AddCompanyTables1759567565938';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "villeto_test"."companies" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "companyId" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "contactEmail" character varying NOT NULL,
                "contactPhone" character varying NOT NULL,
                "contactFirstName" character varying NOT NULL,
                "contactLastName" character varying NOT NULL,
                "companyName" character varying NOT NULL,
                "businessName" character varying,
                "taxId" character varying,
                "registrationId" character varying,
                "websiteUrl" character varying,
                "address" character varying,
                "accountType" "villeto_test"."companies_accounttype_enum" NOT NULL DEFAULT 'demo',
                "description" character varying,
                CONSTRAINT "UQ_COMPANY" UNIQUE (
                    "businessName",
                    "taxId",
                    "registrationId",
                    "websiteUrl",
                    "contactEmail",
                    "contactPhone"
                ),
                CONSTRAINT "PK_9de34f59e8578db786054269261" PRIMARY KEY ("companyId")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "villeto_test"."onboardings" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "onboardingId" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "status" boolean NOT NULL DEFAULT false,
                "step" integer NOT NULL DEFAULT '1',
                "companyId" uuid,
                CONSTRAINT "REL_f7ad7522188e9608a49bdf4ba2" UNIQUE ("companyId"),
                CONSTRAINT "CHK_28e95cbcc06f2dd3bd90bfe0a6" CHECK (
                    "step" >= 1
                    AND "step" <= 6
                ),
                CONSTRAINT "PK_2d110908d0b3a6bd05e704dfbd2" PRIMARY KEY ("onboardingId")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."onboardings"
            ADD CONSTRAINT "FK_f7ad7522188e9608a49bdf4ba23" FOREIGN KEY ("companyId") REFERENCES "villeto_test"."companies"("companyId") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."onboardings" DROP CONSTRAINT "FK_f7ad7522188e9608a49bdf4ba23"
        `);
    await queryRunner.query(`
            DROP TABLE "villeto_test"."onboardings"
        `);
    await queryRunner.query(`
            DROP TABLE "villeto_test"."companies"
        `);
  }
}
