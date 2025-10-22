import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ValidationException } from '../exceptions/validation.exception';

@Catch(ValidationException)
export class ValidationFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost) {
    const httpCtx = host.switchToHttp();
    const response = httpCtx.getResponse();

    return response.status(400).json({
      status: 400,
      caughtBy: 'ValidationFilter',
      message: exception.validationErrors,
      data: null,
    });
  }
}
