import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendUserConfirmation(user: any, token: string) {
    const url = `example.com/auth/confirm?token=${token}`;

    return await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to VilletoStream! Confirm your Email',
      template: 'confirmation', // The name of the template file i.e confirmation.hbs
      context: {
        // Data to be sent to template engine
        name: user.name,
        url,
      },
    });
  }

  async sendPasswordReset(user: any, token: string) {
    const url = `example.com/auth/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset Password',
      template: 'reset-password', // The name of the template file i.e reset-password.hbs
      context: {
        // Data to be sent to template engine
        name: user.name,
        url,
      },
    });
  }
}
