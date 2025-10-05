import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './resources/users/users.module';
import { ConfigModule } from './config/config.module';
import { CompanyModule } from './resources/company/company.module';
import { OnboardingModule } from './resources/onboarding/onboarding.module';
import { NotificationsModule } from './resources/notifications/notifications.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    ConfigModule,
    CompanyModule,
    OnboardingModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
