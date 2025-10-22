import { IsString, IsEnum } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment) NODE_ENV: Environment;

  @IsString() DATABASE_URL: string;

  @IsString() JWT_SECRET: string;

  @IsString() CLOUDINARY_CLOUD_NAME: string;

  @IsString() CLOUDINARY_API_KEY: string;

  @IsString() CLOUDINARY_API_SECRET: string;

  @IsString() MAIL_HOST: string;

  @IsString() MAIL_PORT: string;

  @IsString() MAIL_USER: string;

  @IsString() MAIL_PASS: string;

  @IsString() MAIL_FROM: string;

  @IsString() ENCRYPTION_KEY: string;
}
