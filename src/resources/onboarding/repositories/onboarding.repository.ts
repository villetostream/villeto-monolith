import { EntityManager, Repository } from 'typeorm';
import { Onboarding } from '../entities/onboarding.entity';
import { OnboardingStartDto } from '../dto/create-onboarding.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Company } from 'src/resources/company/entities/company.entity';

export class OnboardingRepository {
  private readonly onboardingRepository: Repository<Onboarding>;
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {
    this.onboardingRepository = this.entityManager.getRepository(Onboarding);
  }

  async startOnboarding(dto: OnboardingStartDto) {
    const companyRepository = await this.entityManager.getRepository(Company)
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
}
