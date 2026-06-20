import Course from '../models/Course.js';
import asyncHandler from '../utils/asyncHandler.js';

// @route   GET /api/courses?category=Cloud
// @access  Public
export const getCourses = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.category && req.query.category !== 'All Courses') {
    filter.category = req.query.category;
  }
  const courses = await Course.find(filter).sort({ createdAt: 1 });
  res.json({ success: true, count: courses.length, courses });
});

// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json({ success: true, course });
});

// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json({ success: true, course });
});

// @route   PUT /api/courses/:id
// @access  Private/Admin
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json({ success: true, course });
});

// @route   DELETE /api/courses/:id
// @access  Private/Admin
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json({ success: true, message: 'Course deleted' });
});
