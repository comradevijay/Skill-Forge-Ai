import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true }, // Cloudinary URL (PDFs/files only)
    type: {
      type: String,
      enum: ['pdf', 'link', 'other'],
      default: 'pdf',
    },
  },
  { _id: true }
);

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Just the 11-character YouTube video ID (e.g. "dQw4w9WgXcQ"), not the full URL.
    // Extracted server-side from whatever URL the instructor pastes in.
    youtubeId: {
      type: String,
      required: true,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    // Free preview lessons are watchable without enrolling
    isPreview: {
      type: Boolean,
      default: false,
    },
    resources: {
      type: [resourceSchema],
      default: [],
    },
  },
  { timestamps: true }
);

lessonSchema.index({ course: 1, order: 1 });
lessonSchema.index({ section: 1, order: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;
