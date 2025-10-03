import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { EnvironmentVariables } from './env.variables';
import { join } from 'path/win32';

export function validateEnvVariables(
  config: Record<string, any>,
): Record<string, any> {
  const validatedConfig = plainToInstance(EnvironmentVariables, config);
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => {
        const constraints = Object.values(error.constraints || {});
        const property = error.property;
        const message = `${property} has wrong value ${error.value}, ${constraints.join(', ')}`;
        return message;
      })
    throw new Error(`\nInvalid environment variables: \n\n${errorMessages.join('\n')}`);
  }
  return validatedConfig;
}
