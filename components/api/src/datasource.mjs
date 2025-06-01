/**
 * This file is ONLY used by Typeorm CLI - and even then its broken and not working. So i stopped trying to use this file
 *
 * In a perfect world i would make this file be consumed by nestJS - alothough
 * ive done this before to do it nicely is somewhat involved. I.E. partially
 * bootstrapping nestJS so that you can pull the env var configs through the
 * config service, and benefit from the config validation (assuming implemented).
 * addition benefits observed in that nestjs typeorm plugin will then consume this
 * datasource, so there is only a single source of truth for db credentials
 */

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config();

const options = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'flicket',
  entities: [join(import.meta.dirname, '**', '*.entity{.ts,.js}')],
  migrations: [join(import.meta.dirname, 'database', 'migrations', '**', '*{.ts,.js}')],
  migrationsRun: false,
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
};

export default new DataSource(options);
