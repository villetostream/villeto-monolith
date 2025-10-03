import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

const isProd = process.env.NODE_ENV === 'production';
const isDev =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';

const dataSourceOption: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  schema: isProd ? 'villeto' : 'villeto_test',
  synchronize: false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: ['dist/database/migrations/**/*.[jt]s'],
  subscribers: ['dist/database/subscribers/**/*.[jt]s'],
  poolSize: 10,
  ssl: isProd ? { rejectUnauthorized: false } : false,
  // logging: ['error', 'query', 'schema'],
  logger: 'advanced-console',
};

export default new DataSource(dataSourceOption);
