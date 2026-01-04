import { minioClient, BUCKET_NAME } from '../config/minio.js';

/**
 * Ensures the bucket exists, creates it if it doesn't
 * This function is called both at startup and before uploads
 */
export const ensureBucketExists = async (): Promise<void> => {
  try {
    console.log(`📦 Checking if bucket "${BUCKET_NAME}" exists...`);
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    
    if (!exists) {
      console.log(`📦 Bucket "${BUCKET_NAME}" does not exist, creating...`);
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`✅ Bucket "${BUCKET_NAME}" created successfully`);
      
      // Set anonymous download policy (public read-only)
      // This allows permanent URLs without authentication
      try {
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
        await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(anonymousPolicy));
        console.log(`✅ Anonymous download policy set`);
        console.log(`   ♾️  Images accessible via permanent URLs`);
      } catch (policyError) {
        console.error(`❌ Failed to set bucket policy:`, policyError instanceof Error ? policyError.message : policyError);
        console.error(`⚠️  Run: pnpm run minio:setup`);
        // Don't throw - bucket exists but policy might fail
      }
    } else {
      console.log(`✅ Bucket "${BUCKET_NAME}" already exists`);
    }
  } catch (error) {
    console.error(`❌ Error ensuring bucket "${BUCKET_NAME}":`, error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    throw error; // Re-throw so caller can handle
  }
};


