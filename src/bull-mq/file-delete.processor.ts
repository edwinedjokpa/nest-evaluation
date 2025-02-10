import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';

@Processor('file-delete')
@Injectable()
export class FileDeleteProcessor extends WorkerHost {
  private readonly logger = new Logger(FileDeleteProcessor.name);
  private readonly region: string;
  private readonly bucket: string;
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    super();
    this.region = this.configService.get('AWS_S3_REGION');
    this.bucket = this.configService.get('AWS_S3_BUCKET');
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: configService.get('AWS_S3_ACCESS_KEY'),
        secretAccessKey: configService.get('AWS_S3_SECRET_KEY'),
      },
    });
  }

  async process(job: Job<{ key: string }>) {
    const { key } = job.data;

    try {
      const deleteParams = {
        Bucket: this.bucket,
        Key: key,
      };

      const response = await this.s3Client.send(
        new DeleteObjectCommand(deleteParams),
      );

      if (response.$metadata.httpStatusCode !== 204) {
        this.logger.error(
          'Failed to delete file',
          response.$metadata.httpStatusCode,
        );

        throw new BadRequestException('Failed to delete file');
      }

      this.logger.log('File deleted successfully!');
    } catch (error) {
      this.logger.error(error);
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
}
