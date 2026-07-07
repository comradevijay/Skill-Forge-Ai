import Progress from '../models/Progress.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import asyncHandler from '../utils/asyncHandler.js';

const ensureEnrolled = async (userId, courseId) => {
  const enrollment = await Enrollment.findOne({ user: userId, course: courseId, status: 'active' });
  if (!enrollment) {
    const err = new Error('You must be enrolled in this course to do that');
    err.statusCode = 403;
    throw err;
  }
};

const recalculatePercent = async (userId, courseId) => {
  const totalLessons = await Lesson.countDocuments({ course: courseId });
  const progress = await Progress.findOne({ user: userId, course: courseId });
  if (!progress || totalLessons === 0) return 0;
  const percent = Math.round((progress.completedLessons.length / totalLessons) * 100);
  progress.percent = percent;
  if (percent === 100) progress.certificateIssued = true;
  await progress.save();
  return percent;
};

// @route   GET /api/progress/:courseId
// @access  Private
export const getCourseProgress = asyncHandler(async (req, res) => {
  await ensureEnrolled(req.user._id, req.params.courseId);

  let progress = await Progress.findOne({ user: req.user._id, course: req.params.courseId });
  if (!progress) {
    progress = await Progress.create({ user: req.user._id, course: req.params.courseId });
  }

  res.json({ success: true, progress });
});

// @route   POST /api/progress/:courseId/resume
// body: { lessonId, positionSeconds }
// Saves the last-watched lesson and timestamp for resume support
// @access  Private
export const saveResumePoint = asyncHandler(async (req, res) => {
  await ensureEnrolled(req.user._id, req.params.courseId);
  const { lessonId, positionSeconds } = req.body;

  const progress = await Progress.findOneAndUpdate(
    { user: req.user._id, course: req.params.courseId },
    { lastLesson: lessonId, lastPositionSeconds: positionSeconds || 0 },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, progress });
});

// @route   POST /api/progress/:courseId/complete
// body: { lessonId }
// @access  Private
export const markLessonComplete = asyncHandler(async (req, res) => {
  await ensureEnrolled(req.user._id, req.params.courseId);
  const { lessonId } = req.body;

  if (!lessonId) {
    res.status(400);
    throw new Error('lessonId is required');
  }

  const lesson = await Lesson.findById(lessonId);
  if (!lesson || String(lesson.course) !== String(req.params.courseId)) {
    res.status(404);
    throw new Error('Lesson not found in this course');
  }

  let progress = await Progress.findOne({ user: req.user._id, course: req.params.courseId });
  if (!progress) {
    progress = await Progress.create({ user: req.user._id, course: req.params.courseId });
  }

  const alreadyDone = progress.completedLessons.some((id) => String(id) === String(lessonId));
  if (!alreadyDone) {
    progress.completedLessons.push(lessonId);
    await progress.save();
  }

  const percent = await recalculatePercent(req.user._id, req.params.courseId);
  const updated = await Progress.findOne({ user: req.user._id, course: req.params.courseId });

  res.json({ success: true, progress: updated, percent });
});

// @route   POST /api/progress/:courseId/uncomplete
// body: { lessonId } - lets a student un-check a lesson if they want to revisit it
// @access  Private
export const markLessonIncomplete = asyncHandler(async (req, res) => {
  await ensureEnrolled(req.user._id, req.params.courseId);
  const { lessonId } = req.body;

  const progress = await Progress.findOne({ user: req.user._id, course: req.params.courseId });
  if (progress) {
    progress.completedLessons = progress.completedLessons.filter(
      (id) => String(id) !== String(lessonId)
    );
    progress.certificateIssued = false;
    await progress.save();
  }

  const percent = await recalculatePercent(req.user._id, req.params.courseId);
  const updated = await Progress.findOne({ user: req.user._id, course: req.params.courseId });

  res.json({ success: true, progress: updated, percent });
});
