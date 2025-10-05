// src/common/filters/network-response-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class NetworkResponseExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;
    if (exception instanceof HttpException) {
      const resBody = exception.getResponse();
      // Handle both string messages and objects
      message =
        typeof resBody === 'string'
          ? resBody
          : (resBody as any).message || 'An error occurred';
    } else {
      message = 'Internal server error';
    }

    response.status(status).json({
      message,
      status,
      data: null,
    });
  }
}
