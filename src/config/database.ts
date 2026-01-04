import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || '143.198.95.222',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'db',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'cucumber93',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;


