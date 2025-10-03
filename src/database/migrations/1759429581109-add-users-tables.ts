import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsersTables1759429581109 implements MigrationInterface {
  name = 'AddUsersTables1759429581109';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "villeto"."user" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid NOT NULL DEFAULT uuid_generate_v4(),
                CONSTRAINT "PK_d72ea127f30e21753c9e229891e" PRIMARY KEY ("userId")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "villeto"."user"
        `);
  }
}
