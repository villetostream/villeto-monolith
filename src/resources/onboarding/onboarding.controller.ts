import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import {
  CreateOnboardingDto,
  OnboardingStartDto,
  OnGoingOnboardingAccountConfirmationDto,
} from './dtos/create-onboarding.dto';
import { UpdateOnboardingDto } from './dtos/update-onboarding.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('onboardings')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('account-confirmation')
  @ApiOperation({
    summary: 'Confirm if an oboarding is ongoing or a new onboarding',
  })
  confirmExistingOnboarding(
    @Body() dto: OnGoingOnboardingAccountConfirmationDto,
  ) {
    return this.onboardingService.confirmOnboardingExists(dto);
  }

  @Post('start')
  @ApiOperation({ summary: 'Start a new onboarding process as a first-timer' })
  create(@Body() createOnboardingDto: OnboardingStartDto) {
    return this.onboardingService.createNewOnboarding(createOnboardingDto);
  }

  @Get()
  findAll() {
    return this.onboardingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.onboardingService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOnboardingDto: UpdateOnboardingDto,
  ) {
    return this.onboardingService.update(+id, updateOnboardingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.onboardingService.remove(+id);
  }
}
