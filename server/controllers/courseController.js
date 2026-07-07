import Course from '../models/Course.js';
import Section from '../models/Section.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import asyncHandler from '../utils/asyncHandler.js';

// @route   GET /api/courses?category=Cloud
// @access  Public
export const getCourses = asyncHandler(async (req, res) => {
  const filter = { isActive: true, status: 'published' };
  if (req.query.category && req.query.category !== 'All Courses') {
    filter.category = req.query.category;
  }
  const courses = await Course.find(filter)
    .populate('instructor', 'name avatarUrl')
    .sort({ createdAt: 1 });
  res.json({ success: true, count: courses.length, courses });
});

// @route   GET /api/courses/:id
// Returns the course plus its curriculum (sections -> lessons). Video IDs
// are only included for preview lessons or if the requester is enrolled.
// @access  Public
export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('instructor', 'name bio avatarUrl');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const sections = await Section.find({ course: course._id }).sort({ order: 1 });
  const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 });

  let isEnrolled = false;
  if (req.headers.authorization) {
    try {
      const jwt = (await import('jsonwebtoken')).default;
      const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
      const enrollment = await Enrollment.findOne({
        user: decoded.id,
        course: course._id,
        status: 'active',
      });
      isEnrolled = !!enrollment;
    } catch {
      isEnrolled = false;
    }
  }

  const curriculum = sections.map((section) => ({
    _id: section._id,
    title: section.title,
    order: section.order,
    lessons: lessons
      .filter((l) => String(l.section) === String(section._id))
      .map((l) => ({
        _id: l._id,
        title: l.title,
        durationSeconds: l.durationSeconds,
        isPreview: l.isPreview,
        order: l.order,
        youtubeId: l.isPreview || isEnrolled ? l.youtubeId : null,
        resources: l.isPreview || isEnrolled ? l.resources : [],
      })),
  }));

  const totalLessons = lessons.length;
  const totalDurationSeconds = lessons.reduce((sum, l) => sum + (l.durationSeconds || 0), 0);

  res.json({
    success: true,
    course,
    curriculum,
    totalLessons,
    totalDurationSeconds,
    isEnrolled,
  });
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
  // Clean up curriculum so deleted courses don't leave orphaned sections/lessons
  await Lesson.deleteMany({ course: course._id });
  await Section.deleteMany({ course: course._id });
  res.json({ success: true, message: 'Course deleted' });
});
