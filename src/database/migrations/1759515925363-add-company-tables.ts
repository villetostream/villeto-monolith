import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompanyTables1759515925363 implements MigrationInterface {
    name = 'AddCompanyTables1759515925363'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "villeto_test"."onboardings" DROP CONSTRAINT "CHK_83de79987e56f22e67db00ad75"
        `);
        await queryRunner.query(`
            ALTER TABLE "villeto_test"."companies"
            ADD "description" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "villeto_test"."onboardings"
            ADD CONSTRAINT "CHK_28e95cbcc06f2dd3bd90bfe0a6" CHECK (
                    "step" >= 1
                    AND "step" <= 6
                )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "villeto_test"."onboardings" DROP CONSTRAINT "CHK_28e95cbcc06f2dd3bd90bfe0a6"
        `);
        await queryRunner.query(`
            ALTER TABLE "villeto_test"."companies" DROP COLUMN "description"
        `);
        await queryRunner.query(`
            ALTER TABLE "villeto_test"."onboardings"
            ADD CONSTRAINT "CHK_83de79987e56f22e67db00ad75" CHECK ((step > 6))
        `);
    }

}
