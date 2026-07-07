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
    subtitle: {
      type: String,
      default: '',
    },
    banner: {
      type: String,   // Cloudinary URL
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    // Long-form detail page fields
    thumbnail: {
      type: String, // Cloudinary URL
      default: '',
    },
    requirements: {
      type: [String],
      default: [],
    },
    learnOutcomes: {
      type: [String],
      default: [],
    },
    // Course pricing
    price: {
      type: Number,
      default: 0, // 0 = free
    },
    originalPrice: {
      type: Number,
      default: 0, // crossed-out original before discount
    },
    // Key selling highlights shown as icon cards below the hero
    // e.g. [{icon:'certificate', label:'Industry Certificate'}, ...]
    highlights: {
      type: [
        {
          icon: { type: String, default: 'star' },
          label: { type: String, required: true },
          desc: { type: String, default: '' },
        },
      ],
      default: [],
    },
    // FAQ accordion entries on the course details page
    faqs: {
      type: [
        {
          question: { type: String, required: true },
          answer: { type: String, required: true },
        },
      ],
      default: [],
    },
    // Student reviews (can be seeded or added by admin)
    reviews: {
      type: [
        {
          name: { type: String, required: true },
          avatar: { type: String, default: '' },
          rating: { type: Number, default: 5 },
          text: { type: String, required: true },
        },
      ],
      default: [],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Draft courses are only visible to their instructor/admin until published
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

courseSchema.index({ instructor: 1 });

const Course = mongoose.model('Course', courseSchema);
export default Course;