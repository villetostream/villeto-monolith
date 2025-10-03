import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyTables1759506058739 implements MigrationInterface {
  name = 'AddCompanyTables1759506058739';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."user"
                RENAME COLUMN "email" TO "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."user"
                RENAME CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" TO "UQ_92f09bd6964a57bb87891a2acf4"
        `);
    await queryRunner.query(`
            CREATE TABLE "villeto_test"."onboardings" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "onboardingId" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "status" character varying NOT NULL,
                "step" integer NOT NULL,
                "companyId" uuid,
                CONSTRAINT "REL_f7ad7522188e9608a49bdf4ba2" UNIQUE ("companyId"),
                CONSTRAINT "PK_2d110908d0b3a6bd05e704dfbd2" PRIMARY KEY ("onboardingId")
            )
        `);
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
                "websiteUrl" character varying NOT NULL,
                "address" character varying NOT NULL,
                CONSTRAINT "UQ_fdc88bd0b5a28aed22dc5626dcb" UNIQUE ("websiteUrl"),
                CONSTRAINT "PK_9de34f59e8578db786054269261" PRIMARY KEY ("companyId")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."user" DROP CONSTRAINT "UQ_92f09bd6964a57bb87891a2acf4"
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."user" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."user"
            ADD "deletedAt" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."onboardings"
            ADD CONSTRAINT "FK_f7ad7522188e9608a49bdf4ba23" FOREIGN KEY ("companyId") REFERENCES "villeto_test"."companies"("companyId") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."onboardings" DROP CONSTRAINT "FK_f7ad7522188e9608a49bdf4ba23"
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."user" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."user"
            ADD "deletedAt" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."user"
            ADD CONSTRAINT "UQ_92f09bd6964a57bb87891a2acf4" UNIQUE ("deletedAt")
        `);
    await queryRunner.query(`
            DROP TABLE "villeto_test"."companies"
        `);
    await queryRunner.query(`
            DROP TABLE "villeto_test"."onboardings"
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."user"
                RENAME CONSTRAINT "UQ_92f09bd6964a57bb87891a2acf4" TO "UQ_e12875dfb3b1d92d7d7c5377e22"
        `);
    await queryRunner.query(`
            ALTER TABLE "villeto_test"."user"
                RENAME COLUMN "deletedAt" TO "email"
        `);
  }
}
