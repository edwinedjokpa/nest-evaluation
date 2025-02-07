import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailJobData } from './job-types';
import { EmailService } from './email.service';
import { EMAIL_QUEUE_NAME } from 'src/constants';

@Processor(EMAIL_QUEUE_NAME)
@Injectable()
export class EmailProcessor extends WorkerHost {
  private readonly logger: Logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobData>) {
    this.validateJobData(job.data);

    const { to, subject, context, template } = job.data;

    try {
      await this.emailService.sendSingleMail(to, subject, context, template);
      this.logger.log(`Job: ${job.id} processed from queue`);
    } catch (error) {
      this.logger.error(
        `Job: ${job.id} failed with error: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ID: ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ID: ${job.id} failed with error: ${error.message}`);
  }

  @OnWorkerEvent('drained')
  onDrained() {
    this.logger.log('Queue drained');
  }

  @OnWorkerEvent('error')
  onError(error: Error) {
    this.logger.error(`Worker error: ${error.message}`, error.stack);
  }

  private validateJobData(jobData: EmailJobData): void {
    if (
      !jobData.to ||
      !jobData.subject ||
      !jobData.context ||
      !jobData.template
    ) {
      this.logger.error('Invalid job data');
    }
  }
}
