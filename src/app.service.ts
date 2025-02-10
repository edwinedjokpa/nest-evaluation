import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadService } from './upload/upload.service';

@Injectable()
export class AppService {
  constructor(private readonly uploadService: UploadService) {}
  getHello(): string {
    return 'Hello World!';
  }

  async check(): Promise<{ status: string }> {
    return { status: 'ok' };
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      return await this.uploadService.uploadFile(file);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    try {
      return await this.uploadService.uploadFiles(files);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
