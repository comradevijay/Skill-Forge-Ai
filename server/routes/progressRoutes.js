import express from 'express';
import {
  getCourseProgress,
  saveResumePoint,
  markLessonComplete,
  markLessonIncomplete,
} from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/:courseId', getCourseProgress);
router.post('/:courseId/resume', saveResumePoint);
router.post('/:courseId/complete', markLessonComplete);
router.post('/:courseId/uncomplete', markLessonIncomplete);

export default router;
