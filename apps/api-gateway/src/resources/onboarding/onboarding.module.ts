import { Module } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { Onboarding } from './entities/onboarding.entity';
import { OnboardingRepository } from './repositories/onboarding.repository';
import { DatabaseModule } from '@app/common/database/database.module';

@Module({
  imports: [DatabaseModule.forFeature([Onboarding])],
  controllers: [OnboardingController],
  providers: [OnboardingService, OnboardingRepository],
})
export class OnboardingModule {}
