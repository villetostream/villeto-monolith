import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from 'src/resources/company/enums/account.enum';

export class OnboardingStartDto {
  @ApiProperty({ example: 'John' })
  contactFirstName: string;
  @ApiProperty({ example: 'Doe' })
  contactLastName: string;
  @ApiProperty({ example: 'Acme Corp' })
  companyName: string;
  @ApiProperty({
    enum: AccountType,
    examples: [AccountType.ENTERPRISE, AccountType.DEMO],
  })
  accountType: AccountType;
  @ApiProperty({ example: 'john.doe@example.com' })
  contactEmail?: string;
  @ApiProperty({ example: '+123-456-7890' })
  contactPhone?: string;
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
