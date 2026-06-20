import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Development', 'AI & Data', 'Cloud', 'Design'],
    },
    icon: {
      type: String,
      required: true, // key used by the frontend to pick the right brand icon
    },
    iconTheme: {
      type: String,
      default: 'icon-blue', // matches existing CSS color classes
    },
    duration: {
      type: String, // e.g. "12 Weeks" - kept as display text to match original design
      required: true,
    },
    features: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    // Marketing display number shown on the public site (legacy copy, e.g. "10,000+")
    studentsDisplay: {
      type: String,
      default: '0+',
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;
