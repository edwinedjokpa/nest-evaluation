import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly region: string;
  private readonly bucket: string;
  private readonly s3Client: S3Client;
  constructor(private readonly configService: ConfigService) {
    this.region = configService.get('AWS_S3_REGION');
    this.bucket = configService.get('AWS_S3_BUCKET');
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: configService.get('AWS_S3_ACCESS_KEY'),
        secretAccessKey: configService.get('AWS_S3_SECRET_KEY'),
      },
    });
  }
  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    const uploadedFileUrls: string[] = [];

    try {
      await Promise.all(
        files.map(async (file) => {
          const input: PutObjectCommandInput = {
            Bucket: this.bucket,
            Key: file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
          };

          const response: PutObjectCommandOutput = await this.s3Client.send(
            new PutObjectCommand(input),
          );

          const fileUrl = `https://${this.bucket}.s3.amazonaws.com/${file.originalname}`;
          uploadedFileUrls.push(fileUrl);

          // Extract file location from response metadata
          if (response.$metadata?.httpStatusCode !== 200) {
            this.logger.error(
              'Error uploading file',
              response.$metadata?.httpStatusCode,
            );
          }

          this.logger.log('File uploaded successfully');
        }),
      );
      return uploadedFileUrls;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error uploading files');
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const input: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    const response: PutObjectCommandOutput = await this.s3Client.send(
      new PutObjectCommand(input),
    );

    const fileUrl = `https://${this.bucket}.s3.amazonaws.com/${file.originalname}`;

    if (response.$metadata?.httpStatusCode !== 200) {
      this.logger.error(
        'Error uploading file',
        response.$metadata?.httpStatusCode,
      );
    }

    this.logger.log('File uploaded successfully');
    return fileUrl;
  }

  async deleteFiles(mediaFiles: string[]) {
    try {
      await Promise.all(
        mediaFiles.map(async (file) => {
          const key = new URL(file).pathname.substring(1);

          const deleteParams = {
            Bucket: this.bucket,
            Delete: {
              Objects: [{ Key: key }],
            },
          };

          const response = await this.s3Client.send(
            new DeleteObjectsCommand(deleteParams),
          );

          if (response.$metadata.httpStatusCode !== 200) {
            this.logger.error(
              'Failed to delete files',
              response.$metadata.httpStatusCode,
            );
          }

          this.logger.log('Files deleted successfully!');
        }),
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  async deleteFile(file: string) {
    const key = new URL(file).pathname.substring(1);

    const deleteParams = {
      Bucket: this.bucket,
      Key: key,
    };

    try {
      const response = await this.s3Client.send(
        new DeleteObjectCommand(deleteParams),
      );

      if (response.$metadata.httpStatusCode !== 204) {
        this.logger.error(
          'Failed to delete file',
          response.$metadata.httpStatusCode,
        );
      }
      return this.logger.log('File deleted successfully!');
    } catch (error) {
      this.logger.error(error);
    }
  }
}
