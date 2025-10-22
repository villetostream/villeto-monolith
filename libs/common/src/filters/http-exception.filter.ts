import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const httpCtx = host.switchToHttp();
    // const resquest = httpCtx.getRequest()
    const response = httpCtx.getResponse();
    const statusCode = exception.getStatus();

    return response.status(statusCode).json({
      status: statusCode,
      message: exception.message,
      data: null,
      caugthBy: 'HttpExceptionFilter',
    });
  }
}
