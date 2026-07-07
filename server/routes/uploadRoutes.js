import express from 'express';
import { uploadPdfMiddleware, uploadImageMiddleware, uploadPdf, uploadImage } from '../controllers/uploadController.js';
import { protect, instructorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/pdf', protect, instructorOrAdmin, uploadPdfMiddleware, uploadPdf);
router.post('/image', protect, instructorOrAdmin, uploadImageMiddleware, uploadImage);

export default router;
