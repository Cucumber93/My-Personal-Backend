import type { Request, Response } from 'express';
import { minioClient, BUCKET_NAME } from '../config/minio.js';
import { ensureBucketExists } from '../utils/minioHelper.js';
import { Readable } from 'stream';

/**
 * Upload image to MinIO and return the public URL
 * The URL will be stored in PostgreSQL to link the image to the project
 */
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate bucket name
    if (!BUCKET_NAME || BUCKET_NAME.trim() === '' || BUCKET_NAME === 'undefined') {
      console.error('❌ MinIO bucket name is not configured');
      res.status(500).json({ 
        error: 'MinIO bucket name is not configured. Please set MINIO_BUCKET_NAME in .env' 
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const file = req.file;
    
    // Validate file buffer exists
    if (!file.buffer) {
      res.status(400).json({ error: 'File buffer is empty' });
      return;
    }

    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      res.status(400).json({ error: 'File must be an image' });
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      res.status(400).json({ error: 'Image size must be less than 5MB' });
      return;
    }

    // Ensure bucket exists before uploading - create if it doesn't exist
    // If MinIO is not accessible (e.g., port 9000 blocked by firewall),
    // fallback to base64 storage
    let useMinIO = true;
    try {
      await ensureBucketExists();
    } catch (bucketError) {
      console.warn('⚠️  Cannot connect to MinIO (port 9000 might be blocked by firewall)');
      console.warn('⚠️  Falling back to base64 storage in PostgreSQL');
      useMinIO = false;
    }

    // Fallback: Store as base64 if MinIO is not accessible
    if (!useMinIO) {
      const base64String = file.buffer.toString('base64');
      const dataUrl = `data:${file.mimetype};base64,${base64String}`;

      console.log(`✅ Image converted to base64 (MinIO not accessible)`);
      console.log(`   📦 Image will be stored in PostgreSQL database`);
      console.log(`   💡 To use MinIO: Open port 9000 in firewall`);

      res.json({
        url: dataUrl,
        mimeType: file.mimetype,
        size: file.size,
        storage: 'base64'
      });
      return;
    }

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExtension}`;

    // Create readable stream from buffer
    const fileStream = new Readable();
    fileStream.push(file.buffer);
    fileStream.push(null); // End of stream

    console.log(`📤 Uploading file to MinIO: ${fileName}, size: ${file.size} bytes, type: ${file.mimetype}`);
    console.log(`📦 Bucket: ${BUCKET_NAME}`);

    // Upload to MinIO
    await minioClient.putObject(BUCKET_NAME, fileName, fileStream, file.size, {
      'Content-Type': file.mimetype,
    });

    console.log(`✅ File uploaded successfully to MinIO: ${fileName}`);
    console.log(`   📦 Image stored in MinIO bucket: ${BUCKET_NAME}`);
    console.log(`   🔗 Generating permanent URL for image`);

    // Generate permanent URL (works if bucket has anonymous download policy)
    // Use MINIO_PUBLIC_URL if set (for HTTPS/domain), otherwise use endpoint
    const minioPublicUrl = process.env.MINIO_PUBLIC_URL;
    let permanentUrl: string;
    
    if (minioPublicUrl) {
      // Use public URL (supports HTTPS and domain name)
      // Format: 
      //   - https://images.cucumber-dashboard.win (subdomain)
      //   - https://cucumber-dashboard.win/minio (path with /minio/)
      const baseUrl = minioPublicUrl.endsWith('/') 
        ? minioPublicUrl.slice(0, -1) 
        : minioPublicUrl;
      
      // If URL contains /minio, it's a path-based proxy (nginx location /minio/)
      // MinIO bucket path will be: /minio/bucket-name/filename
      if (baseUrl.includes('/minio')) {
        permanentUrl = `${baseUrl}/${BUCKET_NAME}/${fileName}`;
      } else {
        // Subdomain or direct access
        permanentUrl = `${baseUrl}/${BUCKET_NAME}/${fileName}`;
      }
    } else {
      // Fallback to endpoint (for local development)
      const minioEndpoint = process.env.MINIO_ENDPOINT || '143.198.95.222';
      const minioPort = process.env.MINIO_PORT || '9000';
      const minioUseSSL = process.env.MINIO_USE_SSL === 'true';
      const protocol = minioUseSSL ? 'https' : 'http';
      permanentUrl = `${protocol}://${minioEndpoint}:${minioPort}/${BUCKET_NAME}/${fileName}`;
    }

    console.log(`   ✅ Permanent URL: ${permanentUrl}`);
    console.log(`   ♾️  URL is permanent (never expires)`);

    res.json({
      url: permanentUrl,
      filename: fileName,
      bucket: BUCKET_NAME,
    });
  } catch (error) {
    console.error('❌ Error uploading file to MinIO:', error);
    
    let errorMessage = 'Failed to upload file to MinIO';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error details:', error.stack);
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
    });
  }
};
