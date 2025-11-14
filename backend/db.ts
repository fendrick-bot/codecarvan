import pkg from 'pg';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { DatabaseConfig } from './types/index.js';

dotenv.config();

const { Pool: PoolClass } = pkg;

// Use DATABASE_URL if provided, otherwise fall back to individual variables
const poolConfig: DatabaseConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'examprep',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'Kaushik@17',
    };

const pool: Pool = new PoolClass(poolConfig);

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;

