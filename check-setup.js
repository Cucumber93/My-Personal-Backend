// Quick setup checker
import dotenv from 'dotenv';
import { Client } from 'minio';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

console.log('🔍 Checking Backend Setup...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log(`  PORT: ${process.env.PORT || '3000 (default)'}`);
console.log(`  DB_HOST: ${process.env.DB_HOST || 'not set'}`);
console.log(`  DB_PORT: ${process.env.DB_PORT || 'not set'}`);
console.log(`  DB_NAME: ${process.env.DB_NAME || 'not set'}`);
console.log(`  DB_USER: ${process.env.DB_USER || 'not set'}`);
console.log(`  MINIO_ENDPOINT: ${process.env.MINIO_ENDPOINT || 'not set'}`);
console.log(`  MINIO_PORT: ${process.env.MINIO_PORT || 'not set'}`);
console.log(`  MINIO_ACCESS_KEY: ${process.env.MINIO_ACCESS_KEY ? '***set***' : 'not set'}`);
console.log(`  MINIO_SECRET_KEY: ${process.env.MINIO_SECRET_KEY ? '***set***' : 'not set'}\n`);

// Test database connection
console.log('🗄️  Testing Database Connection...');
const dbPool = new Pool({
  host: process.env.DB_HOST || '143.198.95.222',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'db',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'ddd',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

try {
  const result = await dbPool.query('SELECT NOW()');
  console.log('  ✅ Database connection successful');
  console.log(`  Server time: ${result.rows[0].now}\n`);
  await dbPool.end();
} catch (error) {
  console.error('  ❌ Database connection failed:', error.message);
  console.error('  Details:', error);
  await dbPool.end();
}

// Test MinIO connection
console.log('📦 Testing MinIO Connection...');
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || '143.198.95.222',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

try {
  const buckets = await minioClient.listBuckets();
  console.log('  ✅ MinIO connection successful');
  console.log(`  Available buckets: ${buckets.map(b => b.name).join(', ') || 'none'}\n`);
} catch (error) {
  console.error('  ❌ MinIO connection failed:', error.message);
  console.error('  Details:', error);
}

console.log('✅ Setup check complete!');


