import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendSingleMail(
    to: string,
    subject: string,
    context: Record<string, any>,
    template: string = './default',
  ) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template: template,
        context: { email: to, ...context },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to send email');
    }
  }

  async sendBulkMail(
    to: string[],
    subject: string,
    context: Record<string, any>,
    template: string = './default',
  ) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template: template,
        context: { email: to, ...context },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to send email');
    }
  }
}
