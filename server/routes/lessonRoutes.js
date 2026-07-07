import express from 'express';
import { getLesson } from '../controllers/lessonController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', protect, getLesson);

export default router;
