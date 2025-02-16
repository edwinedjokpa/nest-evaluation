import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { FILE_DELETE_QUEUE_NAME, FILE_UPLOAD_QUEUE_NAME } from 'src/constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly queueEvents: QueueEvents;

  constructor(
    @InjectQueue(FILE_UPLOAD_QUEUE_NAME)
    private readonly fileUploadQueue: Queue,
    @InjectQueue(FILE_DELETE_QUEUE_NAME)
    private readonly fileDeleteQueue: Queue,
    private readonly configService: ConfigService,
  ) {
    // Initialize QueueEvents to listen for events globally on the file-upload queue
    this.queueEvents = new QueueEvents(FILE_UPLOAD_QUEUE_NAME, {
      connection: { url: configService.get<string>('REDIS_URL') },
    });
  }

  // Upload multiple files using queue
  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    const uploadedFileUrls: string[] = [];

    try {
      // Create promises for each file upload job
      const uploadPromises = files.map(async (file) => {
        const job = await this.fileUploadQueue.add('upload', { file });

        // Wait for the job to complete or fail
        const fileUrl = await this.waitForJobCompletion(job.id);
        uploadedFileUrls.push(fileUrl);
      });

      // Wait for all jobs to complete
      await Promise.all(uploadPromises);

      return uploadedFileUrls;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.message);
    }
  }

  // Upload a single file using queue
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const job = await this.fileUploadQueue.add('upload', { file });

    // Wait for the job to complete and get the file URL
    const fileUrl = await this.waitForJobCompletion(job.id);
    return fileUrl;
  }

  // Delete a single file using queue
  async deleteFile(file: string): Promise<void> {
    const key = new URL(file).pathname.substring(1);

    try {
      const job = await this.fileDeleteQueue.add('delete', { key });

      // Wait for the job to complete
      await this.waitForJobCompletion(job.id);

      this.logger.log('File deleted successfully via queue');
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.message);
    }
  }

  // Delete multiple files using queue
  async deleteFiles(mediaFiles: string[]): Promise<void> {
    try {
      // Create promises for each file deletion job
      const deletePromises = mediaFiles.map(async (file) => {
        const key = new URL(file).pathname.substring(1);

        const job = await this.fileDeleteQueue.add('delete', { key });

        // Wait for the job to complete
        await this.waitForJobCompletion(job.id);
      });

      // Wait for all delete jobs to complete
      await Promise.all(deletePromises);

      this.logger.log('Files deleted successfully via queue');
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.message);
    }
  }

  // Helper function to wait for job completion and return the result
  private async waitForJobCompletion(jobId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Listen for completion or failure events for the given jobId
      this.queueEvents.on(
        'completed',
        async ({ jobId: completedJobId, returnvalue }) => {
          if (completedJobId === jobId) {
            resolve(returnvalue);
          }
        },
      );

      // Handle failure event
      this.queueEvents.on(
        'failed',
        async ({ jobId: failedJobId, failedReason }) => {
          if (failedJobId === jobId) {
            reject(new BadRequestException(`Job failed: ${failedReason}`));
          }
        },
      );
    });
  }
}
