// Setup MinIO bucket with anonymous download policy
// This allows permanent URLs without authentication
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

async function setupAnonymousDownload() {
  try {
    console.log('🔧 Setting up MinIO bucket for anonymous download...');
    console.log(`📦 Bucket: ${BUCKET_NAME}`);
    console.log('');

    // Check if bucket exists
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      console.log('📦 Creating bucket...');
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log('✅ Bucket created');
    }

    // Set anonymous download policy (public read-only)
    const anonymousPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: [
            's3:GetBucketLocation',
            's3:ListBucket'
          ],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}`]
        },
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
        }
      ]
    };

    console.log('🔓 Setting anonymous download policy...');
    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(anonymousPolicy));
    
    console.log('');
    console.log('✅ Success! Bucket is now configured for anonymous download.');
    console.log('');
    console.log('📷 Your images will be accessible at:');
    const endpoint = process.env.MINIO_ENDPOINT || '143.198.95.222';
    const port = process.env.MINIO_PORT || '9000';
    console.log(`   http://${endpoint}:${port}/${BUCKET_NAME}/filename.jpg`);
    console.log('');
    console.log('✨ URLs are permanent and will work forever!');
    console.log('');
    console.log('🧪 Next steps:');
    console.log('   1. Restart your backend: pnpm dev');
    console.log('   2. Upload a new image');
    console.log('   3. Image should display immediately');
    
  } catch (error) {
    console.error('❌ Failed to setup anonymous download!');
    console.error('');
    if (error.message) {
      console.error('Error:', error.message);
    }
    console.error('');
    console.error('Please check:');
    console.error('  1. MinIO server is running and accessible');
    console.error('  2. Credentials in .env are correct');
    console.error('  3. Port 9000 is open in firewall');
    console.error('');
    console.error('Alternative: Use MinIO Console');
    console.error(`  1. Go to: http://${process.env.MINIO_ENDPOINT}:9001`);
    console.error('  2. Login with your credentials');
    console.error(`  3. Go to: Buckets → ${BUCKET_NAME} → Anonymous`);
    console.error('  4. Set Access: Custom');
    console.error('  5. Add prefix: * (asterisk)');
    console.error('  6. Access: readonly or readwrite');
    console.error('  7. Save');
    process.exit(1);
  }
}

setupAnonymousDownload();

