import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EmailProcessor } from 'src/queue/email.processor';
import { FileDeleteProcessor } from 'src/queue/file-delete.processor';
import { FileUploadProcessor } from 'src/queue/file-upload.processor';

import {
  EMAIL_QUEUE_NAME,
  FILE_DELETE_QUEUE_NAME,
  FILE_UPLOAD_QUEUE_NAME,
} from 'src/constants';
import { EmailService } from 'src/email/email.service';
import { UploadService } from 'src/upload/upload.service';

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
    // FileUploadProcessor,
    // FileDeleteProcessor,
  ],
  exports: [BullModule],
})
export class QueueModule {}
