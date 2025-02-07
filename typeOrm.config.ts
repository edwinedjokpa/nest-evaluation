import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { User } from './src/database/entities/user.entity';
import { DataSource } from 'typeorm';
import { Admin } from './src/database/entities/admin.entity';

config();

const configService = new ConfigService();

const dataSource = new DataSource({
  type: 'postgres',
  host: configService.getOrThrow<string>('POSTGRES_HOST'),
  port: configService.getOrThrow<number>('POSTGRES_PORT', 5432),
  username: configService.getOrThrow<string>('POSTGRES_USER'),
  password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
  database: configService.getOrThrow<string>('POSTGRES_DB'),
  entities: [User, Admin],
  synchronize: true,
  logging: true,
  migrations: [
    './src/database/migrations/*{.ts,.js}',
    './dist/src/database/migrations/*{.ts,.js}',
  ],
});

export default dataSource;
