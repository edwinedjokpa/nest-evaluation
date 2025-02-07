import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailJobData } from './job-types';
import { EmailService } from './email.service';

@Processor('email')
@Injectable()
export class EmailProcessor extends WorkerHost {
  private readonly logger: Logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobData>) {
    const { to, subject, context, template } = job.data;

    if (!to || !subject || !template) {
      this.logger.error(
        `Invalid job data for Job ID: ${job.id}. Missing required fields.`,
      );
      await job.moveToFailed(
        new Error('Missing required fields: to, subject, or template'),
        job.token,
      );
      return;
    }

    try {
      // Attempt to send the email
      await this.emailService.sendSingleMail(to, subject, context, template);

      // Log success
      this.logger.log(
        `Job ID: ${job.id} processed successfully. Email sent to: ${to}`,
      );
      await job.moveToCompleted('Email sent successfully', job.token);
    } catch (error) {
      this.logger.error(
        `Error processing Job ID: ${job.id}. Error: ${error.message}`,
        error.stack,
      );

      if (this.isTransientError(error)) {
        this.logger.log(
          `Transient error detected for Job ID: ${job.id}. Retrying...`,
        );
        await job.retry();
      } else {
        this.logger.log(
          `Non-transient error detected for Job ID: ${job.id}. Marking job as failed.`,
        );
        await job.moveToFailed(new Error(error.message), job.token);
      }
    }
  }

  // Helper method to check if an error is transient (network issues, etc.)
  private isTransientError(error: any): boolean {
    return (
      error.message.includes('timeout') || error.message.includes('network')
    );
  }
}
