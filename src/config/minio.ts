import { Client } from 'minio';
import dotenv from 'dotenv';

dotenv.config();

// MinIO configuration
// Note: MinIO typically uses port 9000 for API (S3) and 9001 for console (web UI)
// If you can only access MinIO on port 9001, check your MinIO configuration
// The API port might be different or behind a proxy
const MINIO_API_PORT = parseInt(process.env.MINIO_PORT || process.env.MINIO_API_PORT || '9000');

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || '143.198.95.222',
  port: MINIO_API_PORT,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

// Get bucket name from environment, with validation
const getBucketName = (): string => {
  const bucketName = process.env.MINIO_BUCKET_NAME || 'project-images';
  const trimmed = bucketName.trim();
  if (!trimmed || trimmed === '' || trimmed === 'undefined') {
    throw new Error('MINIO_BUCKET_NAME is not set or invalid in .env file');
  }
  return trimmed;
};

const BUCKET_NAME = getBucketName();

// Ensure bucket exists - create if it doesn't exist
export const ensureBucket = async (): Promise<void> => {
  try {
    // Validate bucket name first
    if (!BUCKET_NAME || BUCKET_NAME.trim() === '' || BUCKET_NAME === 'undefined') {
      console.error('❌ MinIO bucket name is not configured');
      throw new Error('MINIO_BUCKET_NAME is not set in .env file');
    }

    console.log(`🔗 Connecting to MinIO at ${process.env.MINIO_ENDPOINT || '143.198.95.222'}:${MINIO_API_PORT}...`);
    console.log(`📦 Bucket name: "${BUCKET_NAME}"`);
    
    // Test connection by checking if bucket exists (this also tests connection)
    // Don't use listBuckets() as it may cause issues with undefined bucket names
    console.log(`📦 Checking if bucket "${BUCKET_NAME}" exists...`);
    let exists: boolean;
    
    try {
      exists = await minioClient.bucketExists(BUCKET_NAME);
      console.log('✅ MinIO connection successful');
    } catch (connError) {
      console.error('❌ MinIO connection failed:', connError instanceof Error ? connError.message : connError);
      console.error(`⚠️  Trying to connect to port ${MINIO_API_PORT}`);
      console.error(`⚠️  Check your MinIO configuration, credentials, or firewall settings`);
      console.error(`⚠️  Ensure MinIO server is running and accessible at ${process.env.MINIO_ENDPOINT || '143.198.95.222'}:${MINIO_API_PORT}`);
      throw connError;
    }
    
    if (!exists) {
      console.log(`📦 Bucket "${BUCKET_NAME}" does not exist, creating...`);
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`✅ Bucket "${BUCKET_NAME}" created successfully`);
      
      // Set bucket policy to allow public read access
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
      
      try {
        await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
        console.log(`✅ Bucket policy set for public read access`);
      } catch (policyError) {
        console.warn(`⚠️  Could not set bucket policy (files may not be publicly accessible):`, policyError instanceof Error ? policyError.message : policyError);
      }
    } else {
      console.log(`✅ Bucket "${BUCKET_NAME}" already exists`);
    }
  } catch (error) {
    console.error('⚠️  Warning: Could not initialize MinIO:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    console.error('⚠️  Image uploads will not work until MinIO is available');
    console.error('⚠️  Bucket will be created automatically on first upload attempt');
    // Don't throw error - allow server to start without MinIO
    // Bucket will be created when first upload happens
  }
};

export { minioClient, BUCKET_NAME };

