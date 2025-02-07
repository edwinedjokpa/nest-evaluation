import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException } from '@nestjs/common';
import * as path from 'path';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  private getTemplatePath(template: string): string {
    const isProduction = process.env.NODE_ENV === 'production';
    const baseTemplatePath = isProduction
      ? path.join(__dirname, '..', '..', 'email', 'templates')
      : path.join(__dirname, 'email', 'templates');

    return path.join(baseTemplatePath, template);
  }

  async sendSingleMail(
    to: string,
    subject: string,
    context: Record<string, any>,
    template: string = './default',
  ) {
    try {
      const templatePath = this.getTemplatePath(template);

      await this.mailerService.sendMail({
        to,
        subject,
        template: templatePath,
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
      const templatePath = this.getTemplatePath(template);

      await this.mailerService.sendMail({
        to,
        subject,
        template: templatePath,
        context: { email: to, ...context },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to send email');
    }
  }
}
