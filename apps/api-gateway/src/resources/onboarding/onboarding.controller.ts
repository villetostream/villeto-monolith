import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import {
  CreateOnboardingDto,
  OnboardingStartDto,
  OnGoingOnboardingAccountConfirmationDto,
} from './dtos/create-onboarding.dto';
import { UpdateOnboardingDto } from './dtos/update-onboarding.dto';
import { ApiOperation } from '@nestjs/swagger';
import { Onboarding } from './entities/onboarding.entity';
import { AllOnboardingsDto } from './dtos/response.dto';
import { ValidationException } from '@app/common/exceptions/validation.exception';

@Controller('onboardings')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('account-confirmation')
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.NOT_FOUND)
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
  @ApiOperation({ summary: 'Fetch all onboardings' })
  async findAll(): Promise<AllOnboardingsDto[]> {
    return this.onboardingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch an onboarding using its ID' })
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: (_errors) =>
          new ValidationException('Invalid onboarding id'),
      }),
    )
    id: string,
  ) {
    return this.onboardingService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: (_errors) =>
          new ValidationException('Invalid onboarding id'),
      }),
    )
    id: string,
    @Body() updateOnboardingDto: UpdateOnboardingDto,
  ) {
    return this.onboardingService.update(+id, updateOnboardingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an onboarding' })
  remove(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: (_errors) =>
          new ValidationException('Invalid onboarding id'),
      }),
    )
    id: string,
  ) {
    return this.onboardingService.remove(id);
  }
}
