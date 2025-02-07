import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendSingleMail(
    to: string,
    subject: string,
    context: Record<string, any>,
    template?: string,
  ) {
    try {
      if (!template) {
        template = './default';
      }

      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context: { email: to, ...context },
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Failed to send email');
    }
  }

  async sendBulkMail(
    to: string[],
    subject: string,
    context: Record<string, any>,
    template?: string,
  ) {
    try {
      if (!template) {
        template = './default';
      }

      await this.mailerService.sendMail({
        to: to,
        subject,
        template: template,
        context: {
          email: to,
          ...context,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to send email');
    }
  }
}
