import {
  ExceptionFilter,
  Catch,
  HttpException,
  ArgumentsHost,
} from '@nestjs/common';
import { Response } from 'express';
import { IsBoolean, IsString, IsObject } from 'class-validator';

class ErrorResponseDto {
  @IsBoolean()
  success: boolean;

  @IsString()
  message: string;

  @IsObject()
  error: object;
}

@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const errorResponse: ErrorResponseDto = {
      success: false,
      message: exception.message || 'An error occurred',
      error: this.getErrorResponse(exception.getResponse()),
    };

    response.status(status).json(errorResponse);
  }

  private getErrorResponse(response: any): object {
    if (typeof response === 'string') {
      return { details: response };
    }
    return { details: response };
  }
}
