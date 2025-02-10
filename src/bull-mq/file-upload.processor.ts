import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FILE_UPLOAD_QUEUE_NAME } from 'src/constants';

@Processor(FILE_UPLOAD_QUEUE_NAME)
@Injectable()
export class FileUploadProcessor extends WorkerHost {
  private readonly logger = new Logger(FileUploadProcessor.name);
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
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'),
      },
    });
  }

  async process(job: Job<{ file: Express.Multer.File }>) {
    const { file } = job.data;
    const input = {
      Bucket: this.bucket,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: 'public-read',
    };

    try {
      const response = await this.s3Client.send(new PutObjectCommand(input));

      const fileUrl = `https://${this.bucket}.s3.amazonaws.com/${file.originalname}`;

      if (response.$metadata?.httpStatusCode !== 200) {
        this.logger.error(
          'Error uploading file',
          response.$metadata?.httpStatusCode,
        );

        throw new BadRequestException('Failed to upload file');
      }

      this.logger.log('File uploaded successfully');
      return fileUrl;
    } catch (error) {
      this.logger.error(error);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    this.logger.log('Upload completed');
  }

  @OnWorkerEvent('failed')
  onFailed() {
    this.logger.error('Upload failed');
  }

  @OnWorkerEvent('drained')
  onDrained() {
    this.logger.log('Queue drained');
  }
}
