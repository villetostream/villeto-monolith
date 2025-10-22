import {
  CreateDateColumn,
  DeleteDateColumn,
  ObjectLiteral,
  UpdateDateColumn,
} from 'typeorm';

export class AbstractEntity<T extends ObjectLiteral> {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  constructor(partial: Partial<T>) {
    Object.assign(this, partial);
  }
}
