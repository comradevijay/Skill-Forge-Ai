import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Contact from '../models/Contact.js';
import asyncHandler from '../utils/asyncHandler.js';

// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = asyncHandler(async (req, res) => {
  const [totalStudents, totalCourses, activeEnrollments, totalLeads, newLeads, byCourse] =
    await Promise.all([
      User.countDocuments({ role: 'student' }),
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
      totalCourses,
      activeEnrollments,
      totalLeads,
      newLeads,
      enrollmentsByCourse: byCourse,
    },
  });
});
