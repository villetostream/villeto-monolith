import { Injectable } from '@nestjs/common';
import {
  CreateOnboardingDto,
  OnboardingStartDto,
} from './dto/create-onboarding.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { OnboardingRepository } from './repositories/onboarding.repository';

@Injectable()
export class OnboardingService {
  constructor(private readonly onboardingRepository: OnboardingRepository) {}
  create(createOnboardingDto: OnboardingStartDto) {
    return this.onboardingRepository.startOnboarding(createOnboardingDto);
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
