import express from 'express';
import rateLimit from 'express-rate-limit';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Limit login attempts to slow down brute-force guessing
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', registerUser);
router.post('/login', loginLimiter, loginUser);
router.get('/me', protect, getMe);

export default router;
