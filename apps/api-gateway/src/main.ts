import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationError } from 'class-validator';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ValidationException } from '@app/common/exceptions/validation.exception';
import { DatabaseExceptionFilter } from '@app/common/filters/db-exception.filter';
import { FallbackExceptionFilter } from '@app/common/filters/fallback.filter';
import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { NetworkResponseExceptionFilter } from '@app/common/filters/network-response-exception.filter';
import { ValidationFilter } from '@app/common/filters/validation-exception.filter';
import { NetworkResponseInterceptor } from '@app/common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(
    new NetworkResponseInterceptor(app.get('Reflector')),
  );
  app.useGlobalFilters(
    new NetworkResponseExceptionFilter(),
    new FallbackExceptionFilter(),
    new HttpExceptionFilter(),
    new DatabaseExceptionFilter(app.get(DataSource)),
    new ValidationFilter(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      skipMissingProperties: false,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.map((err) => {
          const constraints = err.constraints || {};
          const property = err.property;
          const value = err.value;
          const message = `${property} has wrong value ${value}, ${Object.values(constraints).join(', ')}`;
          return message;
        });
        return new ValidationException(messages);
      },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('VilletoStream')
    .setDescription('The backend API powering VilletoStream')
    .setVersion('1.0')
    .addTag('Endpoints')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
