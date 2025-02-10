import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { DatabaseModule } from './database/database.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UploadService } from './upload/upload.service';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { PingService } from './ping/ping.service';
import { ScheduleModule } from '@nestjs/schedule';
import { BullMqModule } from './bull-mq/bull-mq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    DatabaseModule,
    AuthModule,
    UserModule,
    EmailModule,
    ScheduleModule.forRoot(),
    BullMqModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UploadService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    PingService,
  ],
})
export class AppModule {}
