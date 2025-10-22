import { DynamicModule, Module } from '@nestjs/common';
import { DataSourceOptions } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSource from './data-source';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        ...((await dataSource).options as DataSourceOptions),
        autoLoadEntities: true,
      }),
      // dataSourceFactory: async () => dataSource.initialize(),
    }),
  ],
})
export class DatabaseModule {
  static forFeature(entities: EntityClassOrSchema[]): DynamicModule {
    return TypeOrmModule.forFeature([...entities]);
  }
}
