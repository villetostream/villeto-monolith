import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NetworkResponseInterceptor } from './common/interceptors/response.interceptor';
import { ValidationError } from 'class-validator';
import { ValidationException } from './common/exceptions/validation.exception';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DatabaseExceptionFilter } from './common/filters/db-exception.filter';
import { DataSource } from 'typeorm';
import { ValidationFilter } from './common/filters/validation-exception.filter';
import { NetworkResponseExceptionFilter } from './common/filters/network-response-exception.filter';
import { FallbackExceptionFilter } from './common/filters/fallback.filter';

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
