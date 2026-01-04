// Test if MinIO image URLs are accessible
import fetch from 'node-fetch';

const MINIO_ENDPOINT = '143.198.95.222';
const MINIO_PORT = '9000';
const BUCKET_NAME = 'project-images';

async function testImageAccess() {
  console.log('🧪 Testing MinIO image accessibility...');
  console.log('');
  
  // Test bucket access
  const bucketUrl = `http://${MINIO_ENDPOINT}:${MINIO_PORT}/${BUCKET_NAME}/`;
  console.log(`Testing bucket URL: ${bucketUrl}`);
  
  try {
    const response = await fetch(bucketUrl);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 200) {
      console.log('✅ Bucket is accessible!');
      console.log('');
      console.log('📋 To test with actual image:');
      console.log('   1. Upload a new image in your app');
      console.log('   2. Copy the image URL from browser console');
      console.log('   3. Open that URL in a new browser tab');
      console.log('   4. If image shows → Success!');
    } else if (response.status === 403) {
      console.log('❌ Access Forbidden (403)');
      console.log('');
      console.log('The bucket exists but anonymous access is not configured properly.');
      console.log('');
      console.log('Fix via MinIO Console:');
      console.log('1. Go to: http://143.198.95.222:9001');
      console.log('2. Login with credentials');
      console.log('3. Buckets → project-images → Anonymous');
      console.log('4. Add Access Rule:');
      console.log('   - Prefix: *');
      console.log('   - Access: readonly');
      console.log('5. Save');
    } else if (response.status === 404) {
      console.log('❌ Bucket not found (404)');
      console.log('');
      console.log('Run: pnpm run minio:setup');
    }
  } catch (error) {
    console.error('❌ Cannot connect to MinIO!');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('Please check:');
    console.error('  1. MinIO server is running');
    console.error('  2. Port 9000 is accessible');
    console.error('  3. No firewall blocking the connection');
  }
  
  console.log('');
  console.log('💡 Next steps:');
  console.log('   1. Make sure backend is running: pnpm dev');
  console.log('   2. Upload a NEW image (old images use old URLs)');
  console.log('   3. Check browser console for the new image URL');
  console.log('   4. New images should display correctly');
}

testImageAccess();

