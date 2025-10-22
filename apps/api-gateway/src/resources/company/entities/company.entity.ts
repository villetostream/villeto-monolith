import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AccountType } from '../enums/account.enum';
import { IsEmail, IsUrl } from 'class-validator';
import { Onboarding } from '../../onboarding/entities/onboarding.entity';
import { AbstractEntity } from '@app/common/database/abstract-entity';

@Entity('companies')
@Unique('UQ_COMPANY', [
  'businessName',
  'taxId',
  'registrationId',
  'websiteUrl',
  'contactEmail',
  'contactPhone',
])
export class Company extends AbstractEntity<Company> {
  @PrimaryGeneratedColumn('uuid')
  companyId: string;
  @Column()
  @IsEmail()
  contactEmail!: string;
  @Column()
  contactPhone!: string;
  @Column()
  contactFirstName!: string;
  @Column()
  contactLastName!: string;
  @Column()
  companyName!: string;
  @Column({ type: 'varchar', nullable: true })
  businessName!: string | null;
  @Column({ type: 'varchar', nullable: true })
  taxId!: string | null;
  @Column({ type: 'varchar', nullable: true })
  registrationId!: string | null;
  @Column({ type: 'varchar', nullable: true })
  @IsUrl()
  websiteUrl!: string | null;
  @Column({ type: 'varchar', nullable: true })
  address!: string | null;
  @Column({ type: 'enum', enum: AccountType, default: AccountType.DEMO })
  accountType!: AccountType;
  @Column({ type: 'varchar', nullable: true })
  description!: string | null;
  @OneToOne(() => Onboarding, { nullable: true })
  onboarding!: Onboarding | null;
}
