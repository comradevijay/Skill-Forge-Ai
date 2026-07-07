import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import api from '../api/axios.js';
import { DSA_CHAPTERS, TOTAL_PROBLEMS } from '../data/dsaSheet.js';

// ── Difficulty config ────────────────────────────────────────────────────────
const DIFF_COLOR = {
  Easy:   { bg: '#e6f4ea', color: '#1ca34e' },
  Medium: { bg: '#fff3e0', color: '#d97706' },
  Hard:   { bg: '#fef3f2', color: '#d92d20' },
};

// ── Small icon SVGs ───────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const BookmarkIcon = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);
const LinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const ChevronDown = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const NoteIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

// ── Progress ring ─────────────────────────────────────────────────────────────
function ProgressRing({ solved, total, size = 80 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = total ? solved / total : 0;
  const dash = pct * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e9f5" strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#0151e6" strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ / 4}
        strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fontSize={size < 70 ? "11" : "13"} fontWeight="700" fill="#0f1a3d">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

// ── Note modal ────────────────────────────────────────────────────────────────
function NoteModal({ problem, note, onSave, onClose }) {
  const [text, setText] = useState(note || '');
  return (
    <div className="dsa-modal-overlay" onClick={onClose}>
      <div className="dsa-modal" onClick={e => e.stopPropagation()}>
        <div className="dsa-modal-header">
          <h3>📝 Note</h3>
          <button className="dsa-modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="dsa-modal-problem">{problem.title}</p>
        <textarea
          className="dsa-note-textarea"
          placeholder="Write your notes, approach, or links here..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
          autoFocus
        />
        <div className="dsa-modal-actions">
          <button className="dsa-btn-outline" onClick={onClose}>Cancel</button>
          <button className="dsa-btn-primary" onClick={() => onSave(text)}>Save Note</button>
        </div>
      </div>
    </div>
  );
}

// ── Problem row ───────────────────────────────────────────────────────────────
const ProblemRow = React.memo(function ProblemRow({ problem, isTheory, data, onToggleSolved, onToggleBookmark, onOpenNote }) {
  const done = data?.solved || false;
  const bookmarked = data?.bookmarked || false;
  const hasNote = !!(data?.note);
  const diff = DIFF_COLOR[problem.difficulty] || DIFF_COLOR.Easy;

  // Theory rows (Ch1 concepts/patterns): "Studied" checkbox + Striver link
  if (isTheory) {
    return (
      <div className={`dsa-problem-row ${done ? 'dsa-row-studied' : ''}`}>
        {/* Studied checkbox */}
        <button
          className={`dsa-check-btn ${done ? 'dsa-check-studied' : ''}`}
          onClick={() => onToggleSolved(problem.id, !done)}
          title={done ? 'Mark as not studied' : 'Mark as studied'}
        >
          {done && <CheckIcon />}
        </button>

        {/* Title */}
        <span className={`dsa-problem-title ${done ? 'dsa-title-done' : ''}`}>
          {problem.title}
        </span>

        {/* Topic badge instead of difficulty for theory */}
        <span className="dsa-diff-badge" style={{ background: '#ede9fe', color: '#6d28d9' }}>
          Theory
        </span>

        {/* Striver article link */}
        <div className="dsa-problem-links">
          {(problem.striver || problem.practice) && (
            <a
              href={problem.striver || problem.practice}
              target="_blank"
              rel="noreferrer"
              className="dsa-link-btn dsa-link-striver"
              title="Read on TakeUForward"
            >
              <LinkIcon /> TUF
            </a>
          )}
        </div>

        {/* Note + bookmark */}
        <div className="dsa-problem-actions">
          <button
            className={`dsa-icon-btn ${hasNote ? 'dsa-icon-active' : ''}`}
            onClick={() => onOpenNote(problem)}
            title="Add note"
          >
            <NoteIcon />
          </button>
          <button
            className={`dsa-icon-btn ${bookmarked ? 'dsa-icon-bookmarked' : ''}`}
            onClick={() => onToggleBookmark(problem.id, !bookmarked)}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <BookmarkIcon filled={bookmarked} />
          </button>
        </div>
      </div>
    );
  }

  // Coding rows: solved checkbox + LC/GFG links
  return (
    <div className={`dsa-problem-row ${done ? 'dsa-row-solved' : ''}`}>
      {/* Solved checkbox */}
      <button
        className={`dsa-check-btn ${done ? 'dsa-check-done' : ''}`}
        onClick={() => onToggleSolved(problem.id, !done)}
        title={done ? 'Mark unsolved' : 'Mark solved'}
      >
        {done && <CheckIcon />}
      </button>

      {/* Title */}
      <span className={`dsa-problem-title ${done ? 'dsa-title-done' : ''}`}>
        {problem.title}
      </span>

      {/* Difficulty badge */}
      <span className="dsa-diff-badge" style={{ background: diff.bg, color: diff.color }}>
        {problem.difficulty}
      </span>

      {/* Action links */}
      <div className="dsa-problem-links">
        {problem.leetcode && (
          <a href={problem.leetcode} target="_blank" rel="noreferrer" className="dsa-link-btn dsa-link-lc" title="LeetCode">
            <LinkIcon /> LC
          </a>
        )}
        {problem.practice && (
          <a href={problem.practice} target="_blank" rel="noreferrer" className="dsa-link-btn dsa-link-gfg" title="GFG">
            <LinkIcon /> GFG
          </a>
        )}
        {!problem.leetcode && !problem.practice && problem.striver && (
          <a href={problem.striver} target="_blank" rel="noreferrer" className="dsa-link-btn dsa-link-striver" title="TakeUForward">
            <LinkIcon /> TUF
          </a>
        )}
      </div>

      {/* Note + bookmark */}
      <div className="dsa-problem-actions">
        <button
          className={`dsa-icon-btn ${hasNote ? 'dsa-icon-active' : ''}`}
          onClick={() => onOpenNote(problem)}
          title="Add note"
        >
          <NoteIcon />
        </button>
        <button
          className={`dsa-icon-btn ${bookmarked ? 'dsa-icon-bookmarked' : ''}`}
          onClick={() => onToggleBookmark(problem.id, !bookmarked)}
          title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <BookmarkIcon filled={bookmarked} />
        </button>
      </div>
    </div>
  );
});

// ── Topic accordion ───────────────────────────────────────────────────────────
function TopicAccordion({ topic, progress, onToggleSolved, onToggleBookmark, onOpenNote }) {
  const [open, setOpen] = useState(true);
  const isTheory = topic.type === 'theory';
  const doneCount = topic.problems.filter(p => progress[p.id]?.solved).length;
  const pct = Math.round((doneCount / topic.problems.length) * 100);

  return (
    <div className="dsa-topic">
      <button className="dsa-topic-header" onClick={() => setOpen(o => !o)}>
        <div className="dsa-topic-left">
          <ChevronDown open={open} />
          <span className="dsa-topic-title">{topic.title}</span>
          {isTheory && (
            <span className="dsa-theory-tag">📖 Theory</span>
          )}
        </div>
        <div className="dsa-topic-right">
          <div className="dsa-topic-bar-wrap">
            <div className="dsa-topic-bar">
              <div
                className="dsa-topic-bar-fill"
                style={{ width: `${pct}%`, background: isTheory ? '#7c3aed' : '#0151e6' }}
              />
            </div>
          </div>
          <span className="dsa-topic-count">{doneCount}/{topic.problems.length}</span>
        </div>
      </button>

      {open && (
        <div className="dsa-topic-problems">
          <div className="dsa-problems-table-head">
            <span style={{ width: 28 }} />
            <span className="dsa-th-title">{isTheory ? 'Topic' : 'Problem'}</span>
            <span className="dsa-th-diff">{isTheory ? 'Type' : 'Difficulty'}</span>
            <span className="dsa-th-links">Links</span>
            <span className="dsa-th-actions">Actions</span>
          </div>
          {topic.problems.map(p => (
            <ProblemRow
              key={p.id}
              problem={p}
              isTheory={isTheory}
              data={progress[p.id]}
              onToggleSolved={onToggleSolved}
              onToggleBookmark={onToggleBookmark}
              onOpenNote={onOpenNote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Chapter accordion ─────────────────────────────────────────────────────────
function ChapterAccordion({ chapter, progress, chapterIdx, onToggleSolved, onToggleBookmark, onOpenNote }) {
  const [open, setOpen] = useState(chapterIdx === 0);

  const allProblems = chapter.topics.flatMap(t => t.problems);
  const solvedCount = allProblems.filter(p => progress[p.id]?.solved).length;
  const total = allProblems.length;

  return (
    <div className="dsa-chapter">
      <button className="dsa-chapter-header" onClick={() => setOpen(o => !o)}>
        <div className="dsa-chapter-left">
          <div className="dsa-chapter-num">{chapterIdx + 1}</div>
          <div>
            <div className="dsa-chapter-title">{chapter.title}</div>
            <div className="dsa-chapter-meta">{total} problems</div>
          </div>
        </div>
        <div className="dsa-chapter-right">
          <ProgressRing solved={solvedCount} total={total} size={56} />
          <span className="dsa-chapter-count">{solvedCount}/{total}</span>
          <ChevronDown open={open} />
        </div>
      </button>

      {open && (
        <div className="dsa-chapter-body">
          {chapter.topics.map(topic => (
            <TopicAccordion
              key={topic.id}
              topic={topic}
              progress={progress}
              onToggleSolved={onToggleSolved}
              onToggleBookmark={onToggleBookmark}
              onOpenNote={onOpenNote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DSASheet() {
  const [progress, setProgress] = useState({}); // { problemId: { solved, bookmarked, note } }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all'); // all | unsolved | bookmarked | easy | medium | hard
  const [search, setSearch] = useState('');
  const [noteModal, setNoteModal] = useState(null); // { problem }
  const [resetConfirm, setResetConfirm] = useState(false);

  // Load progress
  useEffect(() => {
    api.get('/dsa/progress')
      .then(res => setProgress(res.data.problems || {}))
      .catch(() => {}) // silently ignore if not logged in
      .finally(() => setLoading(false));
  }, []);

  // Debounced save
  const saveProgress = useCallback(async (problemId, data) => {
    setSaving(true);
    try {
      await api.patch(`/dsa/progress/${problemId}`, data);
    } catch {/* ignore */} finally {
      setSaving(false);
    }
  }, []);

  const handleToggleSolved = useCallback((problemId, solved) => {
    setProgress(prev => {
      const updated = { ...prev, [problemId]: { ...(prev[problemId] || {}), solved } };
      saveProgress(problemId, { solved });
      return updated;
    });
  }, [saveProgress]);

  const handleToggleBookmark = useCallback((problemId, bookmarked) => {
    setProgress(prev => {
      const updated = { ...prev, [problemId]: { ...(prev[problemId] || {}), bookmarked } };
      saveProgress(problemId, { bookmarked });
      return updated;
    });
  }, [saveProgress]);

  const handleSaveNote = useCallback((problemId, note) => {
    setProgress(prev => {
      const updated = { ...prev, [problemId]: { ...(prev[problemId] || {}), note } };
      saveProgress(problemId, { note });
      return updated;
    });
    setNoteModal(null);
  }, [saveProgress]);

  const handleReset = async () => {
    try {
      await api.delete('/dsa/progress');
      setProgress({});
      setResetConfirm(false);
    } catch {/* ignore */}
  };

  // Stats
  const stats = useMemo(() => {
    let easy = 0, medium = 0, hard = 0, totalEasy = 0, totalMedium = 0, totalHard = 0, bookmarked = 0;
    DSA_CHAPTERS.forEach(ch => ch.topics.forEach(t => t.problems.forEach(p => {
      if (p.difficulty === 'Easy') totalEasy++;
      else if (p.difficulty === 'Medium') totalMedium++;
      else totalHard++;
      const d = progress[p.id];
      if (d?.solved) {
        if (p.difficulty === 'Easy') easy++;
        else if (p.difficulty === 'Medium') medium++;
        else hard++;
      }
      if (d?.bookmarked) bookmarked++;
    })));
    const solved = easy + medium + hard;
    return { solved, easy, medium, hard, bookmarked, totalEasy, totalMedium, totalHard };
  }, [progress]);

  // Filtered chapters/topics/problems
  const filteredChapters = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DSA_CHAPTERS.map(ch => ({
      ...ch,
      topics: ch.topics.map(t => ({
        ...t,
        problems: t.problems.filter(p => {
          if (q && !p.title.toLowerCase().includes(q)) return false;
          if (filter === 'unsolved' && progress[p.id]?.solved) return false;
          if (filter === 'bookmarked' && !progress[p.id]?.bookmarked) return false;
          if (filter === 'easy' && p.difficulty !== 'Easy') return false;
          if (filter === 'medium' && p.difficulty !== 'Medium') return false;
          if (filter === 'hard' && p.difficulty !== 'Hard') return false;
          return true;
        }),
      })).filter(t => t.problems.length > 0),
    })).filter(ch => ch.topics.length > 0);
  }, [progress, filter, search]);

  if (loading) return (
    <>
      <Navbar />
      <div className="dsa-page"><div className="dsa-loading">Loading your progress...</div></div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <div className="dsa-page">
        {/* ── Hero banner ── */}
        <div className="dsa-hero">
          <div className="dsa-hero-left">
            <h1 className="dsa-hero-title">A2Z DSA Sheet</h1>
            <p className="dsa-hero-sub">
              A structured path to master Data Structures & Algorithms —<br />
              from basics to FAANG-level problems, all in one place.
            </p>
            <div className="dsa-hero-badges">
              <span className="dsa-hero-badge">📚 {TOTAL_PROBLEMS} Problems</span>
              <span className="dsa-hero-badge">📂 {DSA_CHAPTERS.length} Chapters</span>
              <span className="dsa-hero-badge">🎯 FAANG Ready</span>
            </div>
          </div>
          <div className="dsa-hero-right">
            <ProgressRing solved={stats.solved} total={TOTAL_PROBLEMS} size={110} />
            <div className="dsa-overall-label">
              <strong>{stats.solved}</strong> / {TOTAL_PROBLEMS}
              <span>Solved</span>
            </div>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="dsa-stats">
          <div className="dsa-stat-card">
            <div className="dsa-stat-val" style={{ color: '#1ca34e' }}>{stats.easy}</div>
            <div className="dsa-stat-label">Easy <span style={{ color: '#aaa' }}>/ {stats.totalEasy}</span></div>
          </div>
          <div className="dsa-stat-card">
            <div className="dsa-stat-val" style={{ color: '#d97706' }}>{stats.medium}</div>
            <div className="dsa-stat-label">Medium <span style={{ color: '#aaa' }}>/ {stats.totalMedium}</span></div>
          </div>
          <div className="dsa-stat-card">
            <div className="dsa-stat-val" style={{ color: '#d92d20' }}>{stats.hard}</div>
            <div className="dsa-stat-label">Hard <span style={{ color: '#aaa' }}>/ {stats.totalHard}</span></div>
          </div>
          <div className="dsa-stat-card">
            <div className="dsa-stat-val" style={{ color: '#0151e6' }}>{stats.bookmarked}</div>
            <div className="dsa-stat-label">Bookmarked</div>
          </div>
        </div>

        {/* ── Filters & search ── */}
        <div className="dsa-toolbar">
          <div className="dsa-search-wrap">
            <svg className="dsa-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="dsa-search"
              placeholder="Search problems..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="dsa-filters">
            {['all','unsolved','bookmarked','easy','medium','hard'].map(f => (
              <button
                key={f}
                className={`dsa-filter-btn ${filter === f ? 'dsa-filter-active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {saving && <span className="dsa-saving">Saving...</span>}
            <button className="dsa-reset-btn" onClick={() => setResetConfirm(true)}>Reset Progress</button>
          </div>
        </div>

        {/* ── Chapter list ── */}
        {filteredChapters.length === 0 ? (
          <div className="dsa-empty">
            <div style={{ fontSize: 40 }}>🔍</div>
            <p>No problems found for your current filter.</p>
            <button className="dsa-btn-outline" onClick={() => { setFilter('all'); setSearch(''); }}>Clear Filters</button>
          </div>
        ) : (
          <div className="dsa-chapters">
            {filteredChapters.map((ch, idx) => (
              <ChapterAccordion
                key={ch.id}
                chapter={ch}
                chapterIdx={DSA_CHAPTERS.findIndex(c => c.id === ch.id)}
                progress={progress}
                onToggleSolved={handleToggleSolved}
                onToggleBookmark={handleToggleBookmark}
                onOpenNote={(p) => setNoteModal({ problem: p })}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Note modal ── */}
      {noteModal && (
        <NoteModal
          problem={noteModal.problem}
          note={progress[noteModal.problem.id]?.note || ''}
          onSave={(note) => handleSaveNote(noteModal.problem.id, note)}
          onClose={() => setNoteModal(null)}
        />
      )}

      {/* ── Reset confirm ── */}
      {resetConfirm && (
        <div className="dsa-modal-overlay" onClick={() => setResetConfirm(false)}>
          <div className="dsa-modal" onClick={e => e.stopPropagation()}>
            <div className="dsa-modal-header">
              <h3>⚠️ Reset Progress</h3>
              <button className="dsa-modal-close" onClick={() => setResetConfirm(false)}>✕</button>
            </div>
            <p style={{ color: '#555', marginBottom: 20 }}>
              This will clear all your solved status, bookmarks, and notes. This cannot be undone.
            </p>
            <div className="dsa-modal-actions">
              <button className="dsa-btn-outline" onClick={() => setResetConfirm(false)}>Cancel</button>
              <button className="dsa-btn-danger" onClick={handleReset}>Yes, Reset Everything</button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        /* ══ Page ══════════════════════════════════════════════ */
        .dsa-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 36px 20px 80px;
          min-height: 80vh;
        }
        .dsa-loading {
          text-align: center;
          padding: 80px 20px;
          color: #888;
          font-size: 16px;
        }
        .dsa-empty {
          text-align: center;
          padding: 60px 20px;
          color: #888;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        /* ══ Hero ═══════════════════════════════════════════════ */
        .dsa-hero {
          background: linear-gradient(135deg, #0f1a3d 0%, #0151e6 100%);
          border-radius: 20px;
          padding: 36px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
          color: #fff;
        }
        .dsa-hero-title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 10px;
          line-height: 1.2;
        }
        .dsa-hero-sub {
          font-size: 15px;
          opacity: 0.85;
          margin-bottom: 18px;
          line-height: 1.6;
        }
        .dsa-hero-badges {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .dsa-hero-badge {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 20px;
          padding: 4px 14px;
          font-size: 13px;
          font-weight: 600;
        }
        .dsa-hero-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .dsa-overall-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: rgba(255,255,255,0.9);
        }
        .dsa-overall-label strong { font-size: 22px; font-weight: 800; }
        .dsa-overall-label span { font-size: 12px; opacity: 0.75; }

        /* ══ Stats ══════════════════════════════════════════════ */
        .dsa-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }
        .dsa-stat-card {
          background: #fff;
          border-radius: 14px;
          padding: 18px 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1.5px solid #eef1f8;
        }
        .dsa-stat-val {
          font-size: 26px;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .dsa-stat-label {
          font-size: 13px;
          color: #888;
        }

        /* ══ Toolbar ════════════════════════════════════════════ */
        .dsa-toolbar {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 22px;
          background: #fff;
          border-radius: 14px;
          padding: 14px 18px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1.5px solid #eef1f8;
        }
        .dsa-search-wrap {
          position: relative;
          flex: 1;
          min-width: 160px;
        }
        .dsa-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #aaa;
        }
        .dsa-search {
          width: 100%;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 12px 8px 34px;
          font-size: 14px;
          color: #0f1a3d;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        }
        .dsa-search:focus { border-color: #0151e6; }
        .dsa-filters {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .dsa-filter-btn {
          padding: 6px 14px;
          border-radius: 20px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-size: 13px;
          font-weight: 600;
          color: #555;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }
        .dsa-filter-btn:hover { border-color: #0151e6; color: #0151e6; }
        .dsa-filter-active {
          background: #0151e6 !important;
          color: #fff !important;
          border-color: #0151e6 !important;
        }
        .dsa-saving { font-size: 12px; color: #888; }
        .dsa-reset-btn {
          padding: 6px 14px;
          border-radius: 8px;
          border: 1.5px solid #fecdca;
          background: #fef3f2;
          color: #d92d20;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
          transition: all 0.18s;
        }
        .dsa-reset-btn:hover { background: #fee2e2; }

        /* ══ Chapters ═══════════════════════════════════════════ */
        .dsa-chapters { display: flex; flex-direction: column; gap: 14px; }
        .dsa-chapter {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06);
          border: 1.5px solid #eef1f8;
          overflow: hidden;
        }
        .dsa-chapter-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.18s;
          gap: 12px;
        }
        .dsa-chapter-header:hover { background: #f7faff; }
        .dsa-chapter-left {
          display: flex;
          align-items: center;
          gap: 14px;
          text-align: left;
        }
        .dsa-chapter-num {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #0151e6, #3f73d3);
          color: #fff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 15px;
          flex-shrink: 0;
        }
        .dsa-chapter-title {
          font-size: 17px;
          font-weight: 700;
          color: #0f1a3d;
        }
        .dsa-chapter-meta {
          font-size: 12px;
          color: #888;
          margin-top: 2px;
        }
        .dsa-chapter-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .dsa-chapter-count {
          font-size: 14px;
          color: #555;
          font-weight: 600;
          white-space: nowrap;
        }
        .dsa-chapter-body {
          border-top: 1.5px solid #eef1f8;
          padding: 0 0 8px;
        }

        /* ══ Topics ══════════════════════════════════════════════ */
        .dsa-topic { border-bottom: 1px solid #f0f4fb; }
        .dsa-topic:last-child { border-bottom: none; }
        .dsa-topic-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 22px 13px 16px;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
          gap: 10px;
        }
        .dsa-topic-header:hover { background: #f9fbff; }
        .dsa-topic-left {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #0f1a3d;
        }
        .dsa-topic-title {
          font-size: 14px;
          font-weight: 700;
          color: #0f1a3d;
          text-align: left;
        }
        .dsa-topic-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .dsa-topic-bar-wrap { width: 80px; }
        .dsa-topic-bar {
          height: 5px;
          background: #e5e9f5;
          border-radius: 99px;
          overflow: hidden;
        }
        .dsa-topic-bar-fill {
          height: 100%;
          background: #0151e6;
          border-radius: 99px;
          transition: width 0.4s ease;
        }
        .dsa-topic-count { font-size: 12px; color: #888; white-space: nowrap; }
        .dsa-topic-problems { padding: 0 0 6px; }

        /* ══ Table header ════════════════════════════════════════ */
        .dsa-problems-table-head {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 22px 7px 16px;
          background: #f7faff;
          border-bottom: 1px solid #eef1f8;
          border-top: 1px solid #eef1f8;
        }
        .dsa-th-title { flex: 1; font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
        .dsa-th-diff  { width: 76px; font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
        .dsa-th-links { width: 90px; font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
        .dsa-th-actions { width: 60px; font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }

        /* ══ Problem rows ════════════════════════════════════════ */
        .dsa-problem-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 22px 10px 16px;
          border-bottom: 1px solid #f4f6fb;
          transition: background 0.14s;
        }
        .dsa-problem-row:last-child { border-bottom: none; }
        .dsa-problem-row:hover { background: #fafbff; }
        .dsa-row-solved { background: #f0fdf4 !important; }
        .dsa-row-studied { background: #f5f3ff !important; }
        .dsa-row-studied:hover { background: #ede9fe !important; }
        .dsa-check-studied {
          background: #7c3aed !important;
          border-color: #7c3aed !important;
        }
        .dsa-theory-tag {
          font-size: 11px;
          font-weight: 600;
          color: #7c3aed;
          background: #ede9fe;
          padding: 2px 8px;
          border-radius: 20px;
          margin-left: 8px;
        }
        .dsa-link-striver { background: #f5f3ff; color: #6d28d9; border: 1px solid #c4b5fd; }
        .dsa-link-striver:hover { background: #ede9fe; }
        .dsa-row-solved:hover { background: #ecfdf5 !important; }

        /* Checkbox */
        .dsa-check-btn {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 2px solid #d0d9f0;
          background: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
          transition: all 0.18s;
        }
        .dsa-check-btn:hover { border-color: #0151e6; }
        .dsa-check-done {
          background: #0151e6 !important;
          border-color: #0151e6 !important;
        }

        /* Title */
        .dsa-problem-title {
          flex: 1;
          font-size: 14px;
          color: #0f1a3d;
          font-weight: 500;
          line-height: 1.4;
        }
        .dsa-title-done {
          text-decoration: line-through;
          color: #aaa !important;
        }

        /* Difficulty */
        .dsa-diff-badge {
          width: 76px;
          text-align: center;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 0;
          border-radius: 20px;
          flex-shrink: 0;
        }

        /* Links */
        .dsa-problem-links {
          width: 90px;
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }
        .dsa-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 7px;
          border-radius: 5px;
          text-decoration: none;
          transition: all 0.15s;
        }
        .dsa-link-lc  { background: #fff8f0; color: #e8891a; border: 1px solid #f6d0a0; }
        .dsa-link-lc:hover  { background: #feedd5; }
        .dsa-link-gfg { background: #f0fff4; color: #1ca34e; border: 1px solid #a0d4b4; }
        .dsa-link-gfg:hover { background: #dcfce7; }

        /* Icon actions */
        .dsa-problem-actions {
          width: 60px;
          display: flex;
          gap: 4px;
          flex-shrink: 0;
          justify-content: flex-end;
        }
        .dsa-icon-btn {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #aaa;
          transition: all 0.15s;
        }
        .dsa-icon-btn:hover { border-color: #0151e6; color: #0151e6; }
        .dsa-icon-active { color: #0151e6 !important; border-color: #0151e6 !important; background: #eef3ff !important; }
        .dsa-icon-bookmarked { color: #d97706 !important; border-color: #fbbf24 !important; background: #fffbeb !important; }

        /* ══ Buttons ════════════════════════════════════════════ */
        .dsa-btn-primary {
          background: #0151e6;
          color: #fff;
          border: none;
          padding: 10px 22px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.18s;
        }
        .dsa-btn-primary:hover { background: #0140c0; }
        .dsa-btn-outline {
          background: #fff;
          color: #0151e6;
          border: 1.5px solid #0151e6;
          padding: 10px 22px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.18s;
        }
        .dsa-btn-outline:hover { background: #eef3ff; }
        .dsa-btn-danger {
          background: #d92d20;
          color: #fff;
          border: none;
          padding: 10px 22px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.18s;
        }
        .dsa-btn-danger:hover { background: #b91c1c; }

        /* ══ Modal ══════════════════════════════════════════════ */
        .dsa-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .dsa-modal {
          background: #fff;
          border-radius: 18px;
          padding: 28px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        .dsa-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .dsa-modal-header h3 { font-size: 18px; color: #0f1a3d; font-weight: 700; }
        .dsa-modal-close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #aaa;
          line-height: 1;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .dsa-modal-close:hover { color: #555; background: #f0f0f0; }
        .dsa-modal-problem {
          font-size: 14px;
          color: #555;
          margin-bottom: 14px;
          padding: 10px 12px;
          background: #f7faff;
          border-radius: 8px;
          border-left: 3px solid #0151e6;
        }
        .dsa-note-textarea {
          width: 100%;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14px;
          font-family: inherit;
          color: #0f1a3d;
          resize: vertical;
          outline: none;
          margin-bottom: 18px;
          transition: border-color 0.2s;
        }
        .dsa-note-textarea:focus { border-color: #0151e6; }
        .dsa-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

        /* ══ Responsive ═════════════════════════════════════════ */
        @media (max-width: 768px) {
          .dsa-hero { flex-direction: column; padding: 26px 22px; text-align: center; }
          .dsa-hero-badges { justify-content: center; }
          .dsa-stats { grid-template-columns: repeat(2, 1fr); }
          .dsa-toolbar { flex-direction: column; align-items: stretch; }
          .dsa-filters { justify-content: center; }
          .dsa-th-links, .dsa-th-actions { display: none; }
          .dsa-problem-links, .dsa-problem-actions { display: none; }
          .dsa-chapter-right svg { display: none; }
          .dsa-chapter-count { display: none; }
        }
        @media (max-width: 480px) {
          .dsa-stats { grid-template-columns: repeat(2, 1fr); }
          .dsa-hero-title { font-size: 22px; }
          .dsa-chapter-title { font-size: 15px; }
          .dsa-chapter-num { width: 30px; height: 30px; font-size: 13px; }
        }
      `}</style>
    </>
  );
}
