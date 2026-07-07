import express from 'express';
import {
  getStats,
  getInstructors,
  approveInstructor,
  rejectInstructor,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, adminOnly, getStats);
router.get('/instructors', protect, adminOnly, getInstructors);
router.patch('/instructors/:id/approve', protect, adminOnly, approveInstructor);
router.patch('/instructors/:id/reject', protect, adminOnly, rejectInstructor);

export default router;
