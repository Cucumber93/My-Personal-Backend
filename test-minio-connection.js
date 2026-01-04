// Test MinIO Connection Script
import { Client } from 'minio';
import dotenv from 'dotenv';

dotenv.config();

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || '143.198.95.222',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_NAME = (process.env.MINIO_BUCKET_NAME || 'project-images').trim();

async function testConnection() {
  console.log('🔍 Testing MinIO Connection...');
  console.log(`   Endpoint: ${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`);
  console.log(`   Bucket: ${BUCKET_NAME}`);
  console.log('');

  try {
    // Test 1: List buckets
    console.log('📋 Test 1: List buckets...');
    const buckets = await minioClient.listBuckets();
    console.log('✅ Connected successfully!');
    console.log('   Buckets:', buckets.map(b => b.name).join(', '));
    console.log('');

    // Test 2: Check if bucket exists
    console.log(`📦 Test 2: Check if bucket "${BUCKET_NAME}" exists...`);
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (exists) {
      console.log(`✅ Bucket "${BUCKET_NAME}" exists`);
    } else {
      console.log(`❌ Bucket "${BUCKET_NAME}" does not exist`);
      console.log('   Creating bucket...');
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`✅ Bucket "${BUCKET_NAME}" created successfully`);
    }
    console.log('');

    // Test 3: List objects in bucket
    console.log(`📂 Test 3: List objects in bucket "${BUCKET_NAME}"...`);
    const stream = minioClient.listObjects(BUCKET_NAME, '', true);
    const objects = [];
    
    await new Promise((resolve, reject) => {
      stream.on('data', obj => objects.push(obj));
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    if (objects.length > 0) {
      console.log(`✅ Found ${objects.length} objects in bucket:`);
      objects.forEach((obj, i) => {
        console.log(`   ${i + 1}. ${obj.name} (${(obj.size / 1024).toFixed(2)} KB)`);
      });
    } else {
      console.log('   Bucket is empty (no images uploaded yet)');
    }
    console.log('');

    console.log('🎉 All tests passed! MinIO is working correctly.');
    console.log('   You can now upload images to MinIO.');
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('Possible causes:');
    console.error('  1. Port 9000 is blocked by firewall');
    console.error('  2. MinIO server is not running');
    console.error('  3. Wrong credentials (check MINIO_ACCESS_KEY and MINIO_SECRET_KEY)');
    console.error('  4. Wrong endpoint or port');
    console.error('');
    console.error('To fix:');
    console.error('  - Open port 9000 in firewall: sudo ufw allow 9000/tcp');
    console.error('  - Check MinIO is running: sudo systemctl status minio');
    console.error('  - Verify credentials in .env file');
    process.exit(1);
  }
}

testConnection();

