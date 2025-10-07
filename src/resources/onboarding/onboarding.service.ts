import { Injectable, NotFoundException } from '@nestjs/common';
import {
  OnboardingStartDto,
  OnGoingOnboardingAccountConfirmationDto,
} from './dtos/create-onboarding.dto';
import { UpdateOnboardingDto } from './dtos/update-onboarding.dto';
import { OnboardingRepository } from './repositories/onboarding.repository';
import { MailService } from '../notifications/services/mail.service';
import { OnboardingCategory } from './enums/onboarding.category.enum';
import { generateRandomToken } from 'src/helpers';
import { ONBOARDING_EXISTS, ONBOARDING_NOT_FOUND } from './constants';
import { FindOptionsOrder, FindOptionsOrderValue } from 'typeorm';
import { Onboarding } from './entities/onboarding.entity';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly onboardingRepository: OnboardingRepository,
    private readonly mailService: MailService,
  ) {}
  async createNewOnboarding(dto: OnboardingStartDto) {
    const newOnboarding = await this.onboardingRepository.startOnboarding(dto);

    return newOnboarding;
  }

  async confirmOnboardingExists(dto: OnGoingOnboardingAccountConfirmationDto) {
    const onboarding = await this.onboardingRepository.findOneOnboardingBy({
      where: { company: { contactEmail: dto.email } },
    });

    console.log(dto.email, onboarding)

    if (!onboarding)
      throw new NotFoundException(
        `Onboarding does not exist: ${OnboardingCategory.NEW}`,
      );
    const token = onboarding.onboardingId;
    const result = await this.mailService.sendUserConfirmation(
      { name: onboarding.companyName, email: onboarding.contactEmail },
      token,
    );
    console.log(result)
    return ONBOARDING_EXISTS;
  }

  async findAll() {
    return this.onboardingRepository.findAllOnboardings({
      loadEagerRelations: false,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const onboarding = await this.onboardingRepository.findOneOnboardingBy({
      where: { onboardingId: id },
    });
    if (!onboarding) throw new NotFoundException(ONBOARDING_NOT_FOUND);
    return onboarding;
  }

  update(id: number, updateOnboardingDto: UpdateOnboardingDto) {
    return `This action updates a #${id} onboarding`;
  }

  remove(id: string) {
    return this.onboardingRepository.findAndDeleteOnboarding({
      onboardingId: id,
    });
  }
}
