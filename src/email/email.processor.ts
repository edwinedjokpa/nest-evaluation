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

    // Validate required fields
    if (!this.validateJobData(job, to, subject, template)) {
      return;
    }

    try {
      // Send the email
      await this.emailService.sendSingleMail(to, subject, context, template);
      this.logger.log(
        `Job ID: ${job.id} processed successfully. Email sent to: ${to}`,
      );
      await job.moveToCompleted('Email sent successfully', job.token);
    } catch (error) {
      await this.handleError(job, error);
    }
  }

  // Validate job data and log error if invalid
  private validateJobData(
    job: Job<EmailJobData>,
    to: string,
    subject: string,
    template: string,
  ): boolean {
    if (!to || !subject || !template) {
      const missingFields = [
        !to ? 'to' : null,
        !subject ? 'subject' : null,
        !template ? 'template' : null,
      ]
        .filter(Boolean)
        .join(', ');

      this.logger.error(
        `Invalid job data for Job ID: ${job.id}. Missing required fields: ${missingFields}`,
      );
      job.moveToFailed(
        new Error(`Missing required fields: ${missingFields}`),
        job.token,
      );
      return false;
    }
    return true;
  }

  // Handle error, retry if transient, or move to failed
  private async handleError(job: Job, error: any) {
    this.logger.error(
      `Error processing Job ID: ${job.id}. Error: ${error.message}`,
      error.stack,
    );

    if (this.isTransientError(error)) {
      this.logger.log(
        `Transient error detected for Job ID: ${job.id}. Retrying...`,
      );
      try {
        // Optionally, limit retries to prevent infinite retry loops
        if (job.attemptsMade < 3) {
          await job.retry();
        } else {
          await this.moveToFailed(job, error, 'Exceeded retry limit');
        }
      } catch (retryError) {
        this.logger.error('Error retrying job', retryError);
        await this.moveToFailed(job, retryError, 'Retry failed');
      }
    } else {
      await this.moveToFailed(job, error);
    }
  }

  // Move job to failed state with error message
  private async moveToFailed(
    job: Job,
    error: any,
    reason: string = error.message,
  ) {
    this.logger.log(
      `Non-transient error detected for Job ID: ${job.id}. Marking job as failed. Reason: ${reason}`,
    );
    await job.moveToFailed(new Error(reason), job.token);
  }

  // Helper method to check if an error is transient (network issues, etc.)
  private isTransientError(error: any): boolean {
    return (
      error.message.includes('timeout') || error.message.includes('network')
    );
  }
}
