import mongoose from 'mongoose';

const dsaProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    // Map of problemId -> { solved: bool, bookmarked: bool, note: string }
    problems: {
      type: Map,
      of: new mongoose.Schema(
        {
          solved: { type: Boolean, default: false },
          bookmarked: { type: Boolean, default: false },
          note: { type: String, default: '', maxlength: 500 },
        },
        { _id: false }
      ),
      default: {},
    },
  },
  { timestamps: true }
);

const DsaProgress = mongoose.model('DsaProgress', dsaProgressSchema);
export default DsaProgress;
