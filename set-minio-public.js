// Script to set MinIO bucket to public access
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

async function setPublicAccess() {
  try {
    console.log(`🔓 Setting public read access for bucket: ${BUCKET_NAME}`);
    console.log('');

    // Check if bucket exists
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      console.error(`❌ Bucket "${BUCKET_NAME}" does not exist!`);
      console.log('   Create the bucket first, then run this script again.');
      process.exit(1);
    }

    // Set bucket policy to public read
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    };

    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    
    console.log(`✅ Success! Bucket "${BUCKET_NAME}" is now public.`);
    console.log('');
    console.log('📷 Your images can be accessed at:');
    console.log(`   http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/filename.jpg`);
    console.log('');
    console.log('🧪 Test by uploading an image and visiting the URL in your browser.');
    
  } catch (error) {
    console.error('❌ Failed to set public access!');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('Alternative method:');
    console.error('1. Go to MinIO Console: http://143.198.95.222:9001');
    console.error('2. Login with your credentials');
    console.error(`3. Go to Buckets → ${BUCKET_NAME} → Summary`);
    console.error('4. Set Access Policy to "Public" or "Download"');
    process.exit(1);
  }
}

setPublicAccess();

