import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

// Verifies the JWT sent in the Authorization header and attaches the
// matching user (minus password) to req.user.
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }


  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, invalid or expired token');
  }
});

// Must be used after `protect`. Restricts the route to admin accounts.
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Admin access required');
};

// Must be used after `protect`. Restricts the route to approved instructors.
export const instructorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'instructor' && req.user.instructorStatus === 'approved') {
    return next();
  }
  if (req.user && req.user.role === 'instructor' && req.user.instructorStatus === 'pending') {
    res.status(403);
    throw new Error('Your instructor account is awaiting admin approval');
  }
  res.status(403);
  throw new Error('Approved instructor access required');
};

// Must be used after `protect`. Allows either an approved instructor or an admin.
export const instructorOrAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  if (req.user && req.user.role === 'instructor' && req.user.instructorStatus === 'approved') {
    return next();
  }
  res.status(403);
  throw new Error('Instructor or admin access required');
};
