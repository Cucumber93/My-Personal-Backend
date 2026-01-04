import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectRoutes from './routes/projectRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { initDatabase } from './db/initDatabase.js';
import { ensureBucket } from './config/minio.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    await initDatabase();
    console.log('✅ Database initialized');
    
    // Initialize MinIO bucket (non-blocking - server will start even if MinIO fails)
    try {
      await ensureBucket();
      console.log('✅ MinIO initialized and ready');
    } catch (minioError) {
      console.warn('⚠️  MinIO initialization failed');
      console.warn('⚠️  Images cannot be uploaded until MinIO is accessible');
      console.warn('⚠️  Please check:');
      console.warn('   1. MinIO server is running');
      console.warn('   2. Port 9000 is accessible (check firewall)');
      console.warn('   3. Credentials in .env are correct');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📝 API endpoints available at http://localhost:${PORT}/api/projects`);
      console.log(`🗄️  Database: ${process.env.DB_HOST || '143.198.95.222'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'db'}`);
      console.log(`📦 MinIO API: ${process.env.MINIO_ENDPOINT || '143.198.95.222'}:${process.env.MINIO_PORT || '9000'}`);
      console.log(`🌐 MinIO Console: http://${process.env.MINIO_ENDPOINT || '143.198.95.222'}:9001/browser`);
      console.log(`📸 Images: Stored in MinIO → URL saved in PostgreSQL`);
    }).on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please stop the other process or change the PORT in .env`);
        console.error(`   You can find and kill the process using: netstat -ano | findstr :${PORT}`);
      } else {
        console.error('❌ Server error:', err);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
};

startServer();

