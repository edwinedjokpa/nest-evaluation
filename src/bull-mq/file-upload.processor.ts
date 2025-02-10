import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FILE_UPLOAD_QUEUE_NAME } from 'src/constants';
import * as path from 'path';

@Processor(FILE_UPLOAD_QUEUE_NAME)
@Injectable()
export class FileUploadProcessor extends WorkerHost {
  private readonly logger = new Logger(FileUploadProcessor.name);
  private readonly region: string;
  private readonly bucket: string;
  private readonly s3Client: S3Client;

  private isValidFileType(mimetype: string): boolean {
    const validMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    return validMimeTypes.includes(mimetype);
  }

  private generateUniqueFilename(originalname: string): string {
    const baseName = path.basename(
      originalname.trim().replace(/\s+/g, '-').toLowerCase(),
      path.extname(originalname),
    );
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    return `${baseName}_${timestamp}`;
  }

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

    if (!this.isValidFileType(file.mimetype)) {
      this.logger.error('Invalid file type:' + file.mimetype);

      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and PDF are allowed.',
      );
    }
    const uniqueFileName = this.generateUniqueFilename(file.originalname);

    const input: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: uniqueFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    try {
      const response = await this.s3Client.send(new PutObjectCommand(input));

      if (response.$metadata?.httpStatusCode !== 200) {
        this.logger.error(
          'Error uploading file',
          response.$metadata?.httpStatusCode,
        );

        throw new BadRequestException('Error uploading file');
      }

      const fileUrl = `https://${this.bucket}.s3.amazonaws.com/${uniqueFileName}`;
      this.logger.log('File uploaded successfully');
      return fileUrl;
    } catch (error) {
      this.logger.error('Error uploading file', error);
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
