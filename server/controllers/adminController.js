import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Contact from '../models/Contact.js';
import asyncHandler from '../utils/asyncHandler.js';

// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = asyncHandler(async (req, res) => {
  const [
    totalStudents,
    totalInstructors,
    pendingInstructors,
    totalCourses,
    activeEnrollments,
    totalLeads,
    newLeads,
    byCourse,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'instructor', instructorStatus: 'approved' }),
    User.countDocuments({ role: 'instructor', instructorStatus: 'pending' }),
    Course.countDocuments({ isActive: true }),
    Enrollment.countDocuments({ status: 'active' }),
    Contact.countDocuments(),
    Contact.countDocuments({ status: 'new' }),
    Enrollment.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      { $project: { _id: 0, title: '$course.title', count: 1 } },
      { $sort: { count: -1 } },
    ]),
  ]);

  res.json({
    success: true,
    stats: {
      totalStudents,
      totalInstructors,
      pendingInstructors,
      totalCourses,
      activeEnrollments,
      totalLeads,
      newLeads,
      enrollmentsByCourse: byCourse,
    },
  });
});

// @route   GET /api/admin/instructors?status=pending
// @access  Private/Admin
export const getInstructors = asyncHandler(async (req, res) => {
  const filter = { role: 'instructor' };
  if (req.query.status) filter.instructorStatus = req.query.status;

  const instructors = await User.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: instructors.length, instructors });
});

// @route   PATCH /api/admin/instructors/:id/approve
// @access  Private/Admin
export const approveInstructor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'instructor') {
    res.status(404);
    throw new Error('Instructor not found');
  }
  user.instructorStatus = 'approved';
  await user.save();
  res.json({ success: true, user: { id: user._id, name: user.name, instructorStatus: user.instructorStatus } });
});

// @route   PATCH /api/admin/instructors/:id/reject
// @access  Private/Admin
export const rejectInstructor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'instructor') {
    res.status(404);
    throw new Error('Instructor not found');
  }
  user.instructorStatus = 'rejected';
  await user.save();
  res.json({ success: true, user: { id: user._id, name: user.name, instructorStatus: user.instructorStatus } });
});
