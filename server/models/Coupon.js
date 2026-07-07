import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code:            { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType:    { type: String, enum: ['percent', 'flat'], default: 'percent' },
    discountValue:   { type: Number, required: true },   // % or ₹
    maxUses:         { type: Number, default: 0 },        // 0 = unlimited
    usedCount:       { type: Number, default: 0 },
    expiresAt:       { type: Date, default: null },
    isActive:        { type: Boolean, default: true },
    applicableCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // empty = all courses
  },
  { timestamps: true }
);

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;