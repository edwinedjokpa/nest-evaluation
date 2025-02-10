import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import {
  EMAIL_QUEUE_NAME,
  FILE_DELETE_QUEUE_NAME,
  FILE_UPLOAD_QUEUE_NAME,
} from 'src/constants';
import { UploadService } from 'src/upload/upload.service';
import { FileUploadProcessor } from './file-upload.processor';
import { FileDeleteProcessor } from './file-delete.processor';
import { EmailService } from 'src/email/email.service';
import { EmailProcessor } from 'src/bull-mq/email.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: EMAIL_QUEUE_NAME }),
    BullModule.registerQueue({ name: FILE_UPLOAD_QUEUE_NAME }),
    BullModule.registerQueue({ name: FILE_DELETE_QUEUE_NAME }),
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
export class BullMqModule {}
