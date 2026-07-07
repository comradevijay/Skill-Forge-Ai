import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

sectionSchema.index({ course: 1, order: 1 });

const Section = mongoose.model('Section', sectionSchema);
export default Section;
