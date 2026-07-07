import Razorpay from 'razorpay';
import crypto from 'crypto';
import asyncHandler from '../utils/asyncHandler.js';
import Payment from '../models/Payment.js';
import Coupon from '../models/Coupon.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

const getRazorpay = () => new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// ── Helpers ────────────────────────────────────────────────────────────────
const generateInvoiceNumber = () => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${y}${m}-${rand}`;
};

// ── POST /api/payments/order  — create Razorpay order ─────────────────────
export const createOrder = asyncHandler(async (req, res) => {
  const { courseId, couponCode } = req.body;

  const course = await Course.findById(courseId);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  if (course.status && course.status !== 'published') { res.status(400); throw new Error('Course not available'); }

  // Free course → enroll directly, skip payment
  if (!course.price || course.price === 0) {
    const existing = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (existing?.status === 'active') {
      return res.json({ success: true, free: true, message: 'Already enrolled' });
    }
    if (existing) { existing.status = 'active'; await existing.save(); }
    else await Enrollment.create({ user: req.user._id, course: courseId });
    return res.json({ success: true, free: true, message: 'Enrolled successfully' });
  }

  // Paid course — apply coupon if provided
  let originalAmount = course.price;
  let discountAmount = 0;
  let appliedCoupon  = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (!coupon) { res.status(400); throw new Error('Invalid or expired coupon'); }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) { res.status(400); throw new Error('Coupon has expired'); }
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) { res.status(400); throw new Error('Coupon usage limit reached'); }
    if (coupon.applicableCourses.length > 0 && !coupon.applicableCourses.includes(courseId)) {
      res.status(400); throw new Error('Coupon not valid for this course');
    }
    if (coupon.discountType === 'percent') {
      discountAmount = Math.round((originalAmount * coupon.discountValue) / 100);
    } else {
      discountAmount = coupon.discountValue;
    }
    discountAmount = Math.min(discountAmount, originalAmount);
    appliedCoupon  = coupon;
  }

  const finalAmount = originalAmount - discountAmount;
  const amountPaise = finalAmount * 100; // Razorpay uses paise

  let razorpayOrder;
  try {
    razorpayOrder = await getRazorpay().orders.create({
      amount:   amountPaise,
      currency: 'INR',
      notes:    { courseId, userId: req.user._id.toString() },
    });
  } catch (rzpErr) {
    res.status(502);
    throw new Error(rzpErr?.error?.description || rzpErr?.message || 'Payment gateway error. Please try again.');
  }

  if (!razorpayOrder || razorpayOrder.error || !razorpayOrder.id) {
    res.status(502);
    throw new Error(razorpayOrder?.error?.description || 'Payment gateway error. Please try again.');
  }

  const payment = await Payment.create({
    user:           req.user._id,
    course:         courseId,
    razorpayOrderId: razorpayOrder.id,
    amount:         amountPaise,
    couponCode:     couponCode || '',
    discountAmount: discountAmount * 100,
  });

  res.json({
    success:         true,
    orderId:         razorpayOrder.id,
    amount:          amountPaise,
    currency:        'INR',
    keyId:           process.env.RAZORPAY_KEY_ID,
    courseName:      course.title,
    userName:        req.user.name,
    userEmail:       req.user.email,
    originalAmount:  originalAmount * 100,
    discountAmount:  discountAmount * 100,
    finalAmount:     finalAmount * 100,
    couponApplied:   appliedCoupon ? { code: appliedCoupon.code, type: appliedCoupon.discountType, value: appliedCoupon.discountValue } : null,
  });
});

// ── POST /api/payments/verify  — verify & enroll ──────────────────────────
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

  // Verify HMAC signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSig !== razorpay_signature) {
    res.status(400); throw new Error('Payment verification failed');
  }

  // Update payment record
  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (!payment) { res.status(404); throw new Error('Payment record not found'); }

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature  = razorpay_signature;
  payment.status             = 'paid';
  payment.invoiceNumber      = generateInvoiceNumber();
  await payment.save();

  // Increment coupon usage
  if (payment.couponCode) {
    await Coupon.findOneAndUpdate({ code: payment.couponCode }, { $inc: { usedCount: 1 } });
  }

  // Create/activate enrollment
  const existing = await Enrollment.findOne({ user: req.user._id, course: courseId });
  let enrollment;
  if (existing) {
    existing.status = 'active';
    enrollment = await existing.save();
  } else {
    enrollment = await Enrollment.create({ user: req.user._id, course: courseId });
  }

  payment.enrollment = enrollment._id;
  await payment.save();

  res.json({ success: true, invoiceNumber: payment.invoiceNumber });
});

// ── GET /api/payments/history  — my payment history ──────────────────────
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id, status: 'paid' })
    .populate('course', 'title thumbnail category')
    .sort({ createdAt: -1 });
  res.json({ success: true, payments });
});

// ── GET /api/payments/invoice/:paymentId  — invoice data ─────────────────
export const getInvoice = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.paymentId)
    .populate('user', 'name email')
    .populate('course', 'title category');

  if (!payment) { res.status(404); throw new Error('Invoice not found'); }
  if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  if (payment.status !== 'paid') { res.status(400); throw new Error('Payment not completed'); }

  res.json({ success: true, payment });
});

// ── POST /api/payments/validate-coupon  — check coupon before checkout ─────
export const validateCoupon = asyncHandler(async (req, res) => {
  const { couponCode, courseId } = req.body;
  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
  if (!coupon || (coupon.expiresAt && coupon.expiresAt < new Date())) {
    res.status(400); throw new Error('Invalid or expired coupon');
  }
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    res.status(400); throw new Error('Coupon usage limit reached');
  }
  if (coupon.applicableCourses.length > 0 && !coupon.applicableCourses.map(String).includes(courseId)) {
    res.status(400); throw new Error('Coupon not valid for this course');
  }

  const course = await Course.findById(courseId);
  let discountAmount = coupon.discountType === 'percent'
    ? Math.round((course.price * coupon.discountValue) / 100)
    : coupon.discountValue;
  discountAmount = Math.min(discountAmount, course.price);

  res.json({
    success: true,
    coupon: { code: coupon.code, type: coupon.discountType, value: coupon.discountValue },
    originalPrice: course.price,
    discountAmount,
    finalPrice: course.price - discountAmount,
  });
});

// ── Admin: GET /api/payments  — all payments ──────────────────────────────
export const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ status: 'paid' })
    .populate('user', 'name email')
    .populate('course', 'title')
    .sort({ createdAt: -1 });
  res.json({ success: true, payments });
});

// ── Admin: CRUD coupons ───────────────────────────────────────────────────
export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
});