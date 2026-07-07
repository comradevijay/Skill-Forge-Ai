import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import asyncHandler from '../utils/asyncHandler.js';

// @route   GET /api/lessons/:id
// Returns the full lesson (including youtubeId + resources) if the lesson is
// a free preview, the requester is enrolled in its course, or is the
// course's instructor/an admin.
// @access  Private
export const getLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  if (lesson.isPreview) {
    return res.json({ success: true, lesson });
  }

  const course = await Course.findById(lesson.course);
  const isOwner = req.user.role === 'admin' || String(course.instructor) === String(req.user._id);

  if (isOwner) {
    return res.json({ success: true, lesson });
  }

  const enrollment = await Enrollment.findOne({
    user: req.user._id,
    course: lesson.course,
    status: 'active',
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('Enroll in this course to watch this lesson');
  }

  res.json({ success: true, lesson });
});
