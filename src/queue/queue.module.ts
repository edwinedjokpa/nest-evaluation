import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EMAIL_QUEUE_NAME,
  FILE_DELETE_QUEUE_NAME,
  FILE_UPLOAD_QUEUE_NAME,
} from 'src/constants';
import { EmailService } from 'src/email/email.service';
import { EmailProcessor } from 'src/queue/email.processor';
import { FileDeleteProcessor } from 'src/queue/file-delete.processor';
import { FileUploadProcessor } from 'src/queue/file-upload.processor';
import { UploadService } from 'src/upload/upload.service';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: EMAIL_QUEUE_NAME,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('REDIS_URL'),
        },
      }),
    }),
    BullModule.registerQueueAsync({
      name: FILE_UPLOAD_QUEUE_NAME,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: { url: configService.get<string>('REDIS_URL') },
      }),
    }),
    BullModule.registerQueueAsync({
      name: FILE_DELETE_QUEUE_NAME,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: { url: configService.get<string>('REDIS_URL') },
      }),
    }),
  ],
  providers: [
    EmailService,
    UploadService,
    EmailProcessor,
    FileUploadProcessor,
    FileDeleteProcessor,
  ],
  exports: [BullModule],
})
export class QueueModule {}
