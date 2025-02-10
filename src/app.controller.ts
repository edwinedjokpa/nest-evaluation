import {
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/health')
  async getHealth(): Promise<{ status: string }> {
    return this.appService.check();
  }

  @Post('files')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    try {
      const uploadedFileUrls = await this.appService.uploadFiles(files);
      return {
        message: 'Files uploaded successfully!',
        data: uploadedFileUrls,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error during file upload');
    }
  }
}
