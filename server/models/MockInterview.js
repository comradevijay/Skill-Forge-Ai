import mongoose from 'mongoose';

const qaSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, default: '' },
  evaluation: { type: String, default: '' },
  score: { type: Number, min: 0, max: 10, default: null },
});

const mockInterviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      required: true,
      enum: ['Java', 'React', 'Node', 'MongoDB', 'SQL', 'HR'],
    },
    qas: [qaSchema],
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress',
    },
  },
  { timestamps: true }
);

const MockInterview = mongoose.model('MockInterview', mockInterviewSchema);
export default MockInterview;