import { AbstractEntity } from "src/database/abstract-entity";
import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User extends AbstractEntity<User> {
    @PrimaryGeneratedColumn("uuid")
    userId: string
}
