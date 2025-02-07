import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { User } from './src/database/entities/user.entity';
import { DataSource } from 'typeorm';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.getOrThrow<string>('POSTGRES_HOST'),
  port: configService.getOrThrow<number>('POSTGRES_PORT', 5432),
  username: configService.getOrThrow<string>('POSTGRES_USER'),
  password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
  database: configService.getOrThrow<string>('POSTGRES_DB'),
  entities: [User],
  synchronize: true,
  logging: true,
  migrations: ['./src/database/migrations/*{.ts,.js}'],
});
