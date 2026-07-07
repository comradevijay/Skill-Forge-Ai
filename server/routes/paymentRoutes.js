import express from 'express';
import {
  createOrder, verifyPayment, getPaymentHistory,
  getInvoice, validateCoupon, getAllPayments,
  createCoupon, getCoupons, deleteCoupon,
} from '../controllers/paymentController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Student
router.post('/order',           protect, createOrder);
router.post('/verify',          protect, verifyPayment);
router.get('/history',          protect, getPaymentHistory);
router.get('/invoice/:paymentId', protect, getInvoice);
router.post('/validate-coupon', protect, validateCoupon);

// Admin
router.get('/',                  protect, adminOnly, getAllPayments);
router.post('/coupons',          protect, adminOnly, createCoupon);
router.get('/coupons',           protect, adminOnly, getCoupons);
router.delete('/coupons/:id',    protect, adminOnly, deleteCoupon);

export default router;