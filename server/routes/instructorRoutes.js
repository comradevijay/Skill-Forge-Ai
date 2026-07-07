import express from 'express';
import {
  getMyCourses,
  createMyCourse,
  updateMyCourse,
  togglePublish,
  deleteMyCourse,
  getSections,
  createSection,
  updateSection,
  deleteSection,
  createLesson,
  updateLesson,
  deleteLesson,
  getCourseStudents,
  getInstructorAnalytics,
  getInstructorStudents,
} from '../controllers/instructorController.js';
import { protect, instructorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Every route here requires an approved instructor (or admin)
router.use(protect, instructorOrAdmin);

router.get('/courses', getMyCourses);
router.post('/courses', createMyCourse);
router.put('/courses/:id', updateMyCourse);
router.patch('/courses/:id/publish', togglePublish);
router.delete('/courses/:id', deleteMyCourse);

router.get('/courses/:courseId/sections', getSections);
router.post('/courses/:courseId/sections', createSection);
router.put('/sections/:id', updateSection);
router.delete('/sections/:id', deleteSection);

router.post('/sections/:sectionId/lessons', createLesson);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);

router.get('/courses/:courseId/students', getCourseStudents);
router.get('/analytics', getInstructorAnalytics);
router.get('/students', getInstructorStudents);

export default router;