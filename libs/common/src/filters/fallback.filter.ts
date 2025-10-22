import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class FallbackExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp(),
      response = ctx.getResponse();

    return response.status(500).json({
      status: 500,
      // createdBy: 'FallbackExceptionFilter',
      message: exception.message
        ? exception.message
        : 'Unexpected error ocurred',
      data: null,
    });
  }
}
