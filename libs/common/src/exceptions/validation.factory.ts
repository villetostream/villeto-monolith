import { ValidationError } from 'class-validator';
import { ValidationException } from './validation.exception';

export const exceptionFactory = (
  errors: ValidationError[],
): ValidationException => {
  const messages = errors.map((err) => {
    const constraints = err.constraints || {};
    const property = err.property;
    const value = err.value;
    const message = `${property} has wrong value ${value}, ${Object.values(constraints).join(', ')}`;
    return message;
  });
  return new ValidationException(messages);
};
