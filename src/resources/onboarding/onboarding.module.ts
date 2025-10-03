import { Module } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { DatabaseModule } from 'src/database/database.module';
import { Onboarding } from './entities/onboarding.entity';
import { OnboardingRepository } from './repositories/onboarding.repository';

@Module({
  imports: [DatabaseModule.forFeature([Onboarding])],
  controllers: [OnboardingController],
  providers: [OnboardingService, OnboardingRepository],
})
export class OnboardingModule {}
