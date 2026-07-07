import express from 'express';
import { protect } from '../middleware/auth.js';
import DsaProgress from '../models/DsaProgress.js';

const router = express.Router();

// GET /api/dsa/progress  — return user's full problem map
router.get('/progress', protect, async (req, res) => {
  try {
    let doc = await DsaProgress.findOne({ user: req.user._id });
    if (!doc) {
      doc = await DsaProgress.create({ user: req.user._id, problems: {} });
    }
    // Convert Map to plain object for JSON
    const problems = Object.fromEntries(doc.problems);
    res.json({ problems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch DSA progress' });
  }
});

// PATCH /api/dsa/progress/:problemId  — toggle or update a problem
router.patch('/progress/:problemId', protect, async (req, res) => {
  const { problemId } = req.params;
  const { solved, bookmarked, note } = req.body;

  try {
    let doc = await DsaProgress.findOne({ user: req.user._id });
    if (!doc) {
      doc = await DsaProgress.create({ user: req.user._id, problems: {} });
    }

    const current = doc.problems.get(problemId) || { solved: false, bookmarked: false, note: '' };

    const updated = {
      solved: solved !== undefined ? solved : current.solved,
      bookmarked: bookmarked !== undefined ? bookmarked : current.bookmarked,
      note: note !== undefined ? note : current.note,
    };

    doc.problems.set(problemId, updated);
    await doc.save();

    res.json({ problemId, ...updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update problem' });
  }
});

// DELETE /api/dsa/progress  — reset all progress
router.delete('/progress', protect, async (req, res) => {
  try {
    await DsaProgress.findOneAndUpdate(
      { user: req.user._id },
      { problems: {} },
      { upsert: true }
    );
    res.json({ message: 'Progress reset' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset progress' });
  }
});

export default router;
