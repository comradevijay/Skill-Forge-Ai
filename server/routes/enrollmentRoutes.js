import express from 'express';
import {
  enrollInCourse,
  getMyEnrollments,
  cancelEnrollment,
  getAllEnrollments,
} from '../controllers/enrollmentController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, enrollInCourse);
router.get('/me', protect, getMyEnrollments);
router.get('/', protect, adminOnly, getAllEnrollments);
router.delete('/:id', protect, cancelEnrollment);

export default router;
