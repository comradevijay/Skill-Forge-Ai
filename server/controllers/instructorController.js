import Course from '../models/Course.js';
import Section from '../models/Section.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import asyncHandler from '../utils/asyncHandler.js';
import extractYoutubeId from '../utils/extractYoutubeId.js';

// Shared ownership check - throws if the course doesn't belong to this instructor (admins bypass)
const assertOwnership = (course, req) => {
  if (!course) {
    const err = new Error('Course not found');
    err.statusCode = 404;
    throw err;
  }
  if (req.user.role !== 'admin' && String(course.instructor) !== String(req.user._id)) {
    const err = new Error('You do not have access to this course');
    err.statusCode = 403;
    throw err;
  }
};

// ---------- Courses ----------

// @route   GET /api/instructor/courses
// @access  Private/Instructor
export const getMyCourses = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { instructor: req.user._id };
  const courses = await Course.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: courses.length, courses });
});

// @route   POST /api/instructor/courses
// @access  Private/Instructor
export const createMyCourse = asyncHandler(async (req, res) => {
  const course = await Course.create({
    ...req.body,
    instructor: req.user._id,
    status: 'draft',
  });
  res.status(201).json({ success: true, course });
});

// @route   PUT /api/instructor/courses/:id
// @access  Private/Instructor (own courses only)
export const updateMyCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  assertOwnership(course, req);

  // Instructors can't reassign their own course to someone else
  const { instructor, ...safeUpdates } = req.body;
  Object.assign(course, safeUpdates);
  await course.save();

  res.json({ success: true, course });
});

// @route   PATCH /api/instructor/courses/:id/publish
// @access  Private/Instructor (own courses only)
export const togglePublish = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  assertOwnership(course, req);

  if (course.status === 'draft') {
    const lessonCount = await Lesson.countDocuments({ course: course._id });
    if (lessonCount === 0) {
      res.status(400);
      throw new Error('Add at least one lesson before publishing');
    }
    course.status = 'published';
  } else {
    course.status = 'draft';
  }
  await course.save();

  res.json({ success: true, course });
});

// @route   DELETE /api/instructor/courses/:id
// @access  Private/Instructor (own courses only)
export const deleteMyCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  assertOwnership(course, req);

  await Lesson.deleteMany({ course: course._id });
  await Section.deleteMany({ course: course._id });
  await course.deleteOne();

  res.json({ success: true, message: 'Course deleted' });
});

// ---------- Curriculum: Sections ----------

// @route   GET /api/instructor/courses/:courseId/sections
// @access  Private/Instructor (own courses only)
export const getSections = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  assertOwnership(course, req);

  const sections = await Section.find({ course: course._id }).sort({ order: 1 });
  const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 });

  const withLessons = sections.map((s) => ({
    ...s.toObject(),
    lessons: lessons.filter((l) => String(l.section) === String(s._id)),
  }));

  res.json({ success: true, sections: withLessons });
});

// @route   POST /api/instructor/courses/:courseId/sections
// @access  Private/Instructor (own courses only)
export const createSection = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  assertOwnership(course, req);

  const { title } = req.body;
  if (!title) {
    res.status(400);
    throw new Error('Section title is required');
  }

  const count = await Section.countDocuments({ course: course._id });
  const section = await Section.create({ course: course._id, title, order: count });

  res.status(201).json({ success: true, section });
});

// @route   PUT /api/instructor/sections/:id
// @access  Private/Instructor (own courses only)
export const updateSection = asyncHandler(async (req, res) => {
  const section = await Section.findById(req.params.id);
  if (!section) {
    res.status(404);
    throw new Error('Section not found');
  }
  const course = await Course.findById(section.course);
  assertOwnership(course, req);

  if (req.body.title !== undefined) section.title = req.body.title;
  if (req.body.order !== undefined) section.order = req.body.order;
  await section.save();

  res.json({ success: true, section });
});

// @route   DELETE /api/instructor/sections/:id
// @access  Private/Instructor (own courses only)
export const deleteSection = asyncHandler(async (req, res) => {
  const section = await Section.findById(req.params.id);
  if (!section) {
    res.status(404);
    throw new Error('Section not found');
  }
  const course = await Course.findById(section.course);
  assertOwnership(course, req);

  await Lesson.deleteMany({ section: section._id });
  await section.deleteOne();

  res.json({ success: true, message: 'Section and its lessons deleted' });
});

// ---------- Curriculum: Lessons ----------

// @route   POST /api/instructor/sections/:sectionId/lessons
// @access  Private/Instructor (own courses only)
export const createLesson = asyncHandler(async (req, res) => {
  const section = await Section.findById(req.params.sectionId);
  if (!section) {
    res.status(404);
    throw new Error('Section not found');
  }
  const course = await Course.findById(section.course);
  assertOwnership(course, req);

  const { title, videoUrl, durationSeconds, isPreview, resources } = req.body;

  if (!title || !videoUrl) {
    res.status(400);
    throw new Error('Lesson title and YouTube video URL are required');
  }

  const youtubeId = extractYoutubeId(videoUrl);
  if (!youtubeId) {
    res.status(400);
    throw new Error('Could not read a valid YouTube video ID from that URL');
  }

  const count = await Lesson.countDocuments({ section: section._id });
  const lesson = await Lesson.create({
    course: course._id,
    section: section._id,
    title,
    youtubeId,
    durationSeconds: durationSeconds || 0,
    isPreview: !!isPreview,
    resources: resources || [],
    order: count,
  });

  res.status(201).json({ success: true, lesson });
});

// @route   PUT /api/instructor/lessons/:id
// @access  Private/Instructor (own courses only)
export const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }
  const course = await Course.findById(lesson.course);
  assertOwnership(course, req);

  const { title, videoUrl, durationSeconds, isPreview, resources, order } = req.body;

  if (title !== undefined) lesson.title = title;
  if (durationSeconds !== undefined) lesson.durationSeconds = durationSeconds;
  if (isPreview !== undefined) lesson.isPreview = isPreview;
  if (resources !== undefined) lesson.resources = resources;
  if (order !== undefined) lesson.order = order;

  if (videoUrl) {
    const youtubeId = extractYoutubeId(videoUrl);
    if (!youtubeId) {
      res.status(400);
      throw new Error('Could not read a valid YouTube video ID from that URL');
    }
    lesson.youtubeId = youtubeId;
  }

  await lesson.save();
  res.json({ success: true, lesson });
});

// @route   DELETE /api/instructor/lessons/:id
// @access  Private/Instructor (own courses only)
export const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }
  const course = await Course.findById(lesson.course);
  assertOwnership(course, req);

  await lesson.deleteOne();
  res.json({ success: true, message: 'Lesson deleted' });
});

// ---------- Students & Analytics ----------

// @route   GET /api/instructor/courses/:courseId/students
// @access  Private/Instructor (own courses only)
export const getCourseStudents = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  assertOwnership(course, req);

  const enrollments = await Enrollment.find({ course: course._id, status: 'active' })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  const progressDocs = await Progress.find({ course: course._id });
  const progressByUser = new Map(progressDocs.map((p) => [String(p.user), p]));

  const students = enrollments.map((e) => ({
    enrollmentId: e._id,
    user: e.user,
    enrolledAt: e.createdAt,
    progressPercent: progressByUser.get(String(e.user._id))?.percent || 0,
  }));

  res.json({ success: true, count: students.length, students });
});

// @route   GET /api/instructor/analytics
// @access  Private/Instructor
export const getInstructorAnalytics = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { instructor: req.user._id };
  const courses = await Course.find(filter);
  const courseIds = courses.map((c) => c._id);

  const [enrollmentCounts, progressDocs] = await Promise.all([
    Enrollment.aggregate([
      { $match: { course: { $in: courseIds }, status: 'active' } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
    ]),
    Progress.find({ course: { $in: courseIds } }),
  ]);

  const enrollMap = new Map(enrollmentCounts.map((e) => [String(e._id), e.count]));

  const perCourse = courses.map((c) => {
    const courseProgress = progressDocs.filter((p) => String(p.course) === String(c._id));
    const avgCompletion =
      courseProgress.length > 0
        ? Math.round(
            courseProgress.reduce((sum, p) => sum + p.percent, 0) / courseProgress.length
          )
        : 0;

    return {
      courseId: c._id,
      title: c.title,
      status: c.status,
      enrollments: enrollMap.get(String(c._id)) || 0,
      avgCompletionPercent: avgCompletion,
    };
  });

  const totalEnrollments = perCourse.reduce((sum, c) => sum + c.enrollments, 0);
  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.status === 'published').length;

  res.json({
    success: true,
    summary: { totalCourses, publishedCourses, totalEnrollments },
    courses: perCourse,
  });
});

// @route   GET /api/instructor/students
// @access  Private/Instructor
export const getInstructorStudents = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { instructor: req.user._id };
  const courses = await Course.find(filter, '_id title');
  const courseIds = courses.map((c) => c._id);
  const courseMap = new Map(courses.map((c) => [String(c._id), c.title]));

  const enrollments = await Enrollment.find({
    course: { $in: courseIds },
    status: 'active',
  })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  const students = enrollments.map((e) => ({
    enrollmentId: e._id,
    studentName: e.user?.name || 'Unknown',
    studentEmail: e.user?.email || '',
    courseId: e.course,
    courseTitle: courseMap.get(String(e.course)) || 'Unknown',
    enrolledAt: e.createdAt,
  }));

  res.json({ success: true, students });
});