import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import asyncHandler from '../utils/asyncHandler.js';

// @route   POST /api/enrollments
// @access  Private
export const enrollInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  if (!courseId) {
    res.status(400);
    throw new Error('courseId is required');
  }

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const existing = await Enrollment.findOne({ user: req.user._id, course: courseId });

  if (existing) {
    if (existing.status === 'active') {
      res.status(400);
      throw new Error('You are already enrolled in this course');
    }
    // Re-activate a previously cancelled enrollment
    existing.status = 'active';
    await existing.save();
    return res.status(200).json({ success: true, enrollment: existing });
  }

  const enrollment = await Enrollment.create({
    user: req.user._id,
    course: courseId,
  });

  res.status(201).json({ success: true, enrollment });
});

// @route   GET /api/enrollments/me
// @access  Private
export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({
    user: req.user._id,
    status: 'active',
  })
    .populate('course')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: enrollments.length, enrollments });
});

// @route   DELETE /api/enrollments/:id
// @access  Private (owner) or Admin
export const cancelEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  const isOwner = enrollment.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to cancel this enrollment');
  }

  enrollment.status = 'cancelled';
  await enrollment.save();

  res.json({ success: true, message: 'Enrollment cancelled' });
});

// @route   GET /api/enrollments
// @access  Private/Admin
export const getAllEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find()
    .populate('user', 'name email')
    .populate('course', 'title category')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: enrollments.length, enrollments });
});
