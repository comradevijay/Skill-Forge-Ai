import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course:           { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    enrollment:       { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment' },

    // Razorpay IDs
    razorpayOrderId:  { type: String, required: true },
    razorpayPaymentId:{ type: String, default: '' },
    razorpaySignature:{ type: String, default: '' },

    amount:           { type: Number, required: true },   // in paise (₹ * 100)
    currency:         { type: String, default: 'INR' },
    status:           { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },

    couponCode:       { type: String, default: '' },
    discountAmount:   { type: Number, default: 0 },

    // Invoice fields
    invoiceNumber:    { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;