import { OmitType } from '@nestjs/swagger';
import { Onboarding } from '../entities/onboarding.entity';

export class AllOnboardingsDto extends OmitType(Onboarding, [
  'company',
] as const) {}
