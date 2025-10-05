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

@Injectable()
export class OnboardingService {
  constructor(
    private readonly onboardingRepository: OnboardingRepository,
    private readonly mailService: MailService,
  ) {}
  async createNewOnboarding(dto: OnboardingStartDto) {
    const newOnboarding = await this.onboardingRepository.startOnboarding(dto);
    const token = generateRandomToken(32)
    await this.mailService.sendUserConfirmation(
      { name: dto.companyName, email:  dto.contactEmail},
      token,
    );
    return newOnboarding;
  }

  async confirmOnboardingExists(dto: OnGoingOnboardingAccountConfirmationDto) {
    const onboarding = await this.onboardingRepository.findOnboardingBy({
      contactEmail: dto.email,
    });

    if (!onboarding)
      throw new NotFoundException(
        `Onboarding does not exist: ${OnboardingCategory.NEW}`,
      );
    return onboarding;
  }

  findAll() {
    return `This action returns all onboarding`;
  }

  findOne(id: number) {
    return `This action returns a #${id} onboarding`;
  }

  update(id: number, updateOnboardingDto: UpdateOnboardingDto) {
    return `This action updates a #${id} onboarding`;
  }

  remove(id: number) {
    return `This action removes a #${id} onboarding`;
  }
}
