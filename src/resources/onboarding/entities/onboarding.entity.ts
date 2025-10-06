import { AbstractEntity } from 'src/database/abstract-entity';
import { Company } from 'src/resources/company/entities/company.entity';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('onboardings')
//step should be between 1 and 6
@Check(`"step" >= 1 AND "step" <= 6`)
export class Onboarding extends AbstractEntity<Onboarding> {
  // Define onboarding-specific columns here
  @PrimaryGeneratedColumn('uuid')
  onboardingId: string;
  @Column({ default: false })
  status!: boolean;
  @Column({ default: 1 })
  step!: number;
  @OneToOne(() => Company, (company) => company.onboarding, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  get contactFullName(): string {
    return `${this.company.contactFirstName} ${this.company.contactLastName}`;
  }

  get contactEmail(): string {
    return this.company.contactEmail;
  }

  get contactPhone(): string {
    return this.company.contactPhone;
  }

  get companyName(): string {
    return this.company.companyName || this.company.businessName || '';
  }
}
