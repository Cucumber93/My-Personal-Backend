import { Router, type IRouter } from 'express';
import { upload } from '../config/upload.js';
import { uploadImage } from '../controllers/uploadController.js';

const router: IRouter = Router();

// POST /api/upload - Upload image file
router.post('/', upload.single('image'), uploadImage);

export default router;


