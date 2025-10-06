import {
  EntityManager,
  FindManyOptions,
  FindOneAndDeleteOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { Onboarding } from '../entities/onboarding.entity';
import { OnboardingStartDto } from '../dtos/create-onboarding.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Company } from 'src/resources/company/entities/company.entity';
import { NotFoundException } from '@nestjs/common';

export class OnboardingRepository {
  private readonly onboardingRepository: Repository<Onboarding>;
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {
    this.onboardingRepository = this.entityManager.getRepository(Onboarding);
  }

  async startOnboarding(dto: OnboardingStartDto) {
    const companyRepository = await this.entityManager.getRepository(Company);
    const newCompany = await companyRepository.save({
      companyName: dto.companyName,
      contactFirstName: dto.contactFirstName,
      contactLastName: dto.contactLastName,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
    });
    const newOnboarding = new Onboarding({});
    newOnboarding.company = newCompany;
    await this.onboardingRepository.save(newOnboarding);
    return newOnboarding;
  }

  async findOneOnboardingBy(options: FindOneOptions<Onboarding>) {
    return this.onboardingRepository.findOne(options);
  }

  async findAllOnboardings(options?: FindManyOptions<Onboarding>) {
    return this.onboardingRepository.find(options);
  }
  async findAndDeleteOnboarding(options: FindOptionsWhere<Onboarding>) {
    const result = await this.onboardingRepository.softDelete(options);
    if (!result.affected)
      throw new NotFoundException('Error deleting onboarding');
    return result.affected;
  }
}
