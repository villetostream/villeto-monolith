import { ApiProperty } from '@nestjs/swagger';
import {
  Allow,
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsPhoneNumber,
} from 'class-validator';
import { AccountType } from 'src/resources/company/enums/account.enum';

export class OnboardingStartDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  contactFirstName: string;
  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  contactLastName: string;
  @ApiProperty({ example: 'Acme Corp' })
  @IsNotEmpty()
  companyName: string;
  @ApiProperty({
    enum: AccountType,
    examples: [AccountType.ENTERPRISE, AccountType.DEMO],
  })
  @IsNotEmpty()
  accountType: AccountType;
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  contactEmail?: string;
  @ApiProperty({ example: '+123-456-7890' })
  @IsNotEmpty()
  @Allow()
  contactPhone?: string;
}

export class OnGoingOnboardingAccountConfirmationDto {
  @IsEmail()
  email: string;
}

export class CreateOnboardingDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  contactEmail: string;
  @ApiProperty({ example: 'John' })
  contactFirstName: string;
  @ApiProperty({ example: 'Doe' })
  contactLastName: string;
  @ApiProperty({ example: '+123-456-7890' })
  contactPhone: string;
  @ApiProperty({ example: 'Acme Corp' })
  companyName?: string;
  @ApiProperty({ example: 'Acme Corp' })
  businessName?: string;
  @ApiProperty({ example: AccountType.BUSINESS })
  accountType?: AccountType;
}
