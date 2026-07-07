import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';

const formatDuration = (s) => {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.round(s % 60)).padStart(2, '0')}`;
};

// ── AI Assistant (Anthropic API via proxy) ──────────────────────────────────
const AIAssistant = ({ lessonTitle, courseTitle }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm your AI tutor for **${lessonTitle}**. Ask me anything about this lesson or the course concepts.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        system: `You are a concise AI tutor for "${courseTitle}", lesson "${lessonTitle}". Rules: 1) Keep replies under 5 sentences. 2) Give one short, simple example only when it helps. 3) No long introductions or summaries. 4) If unrelated to the course, redirect in one sentence.`,
        messages: history
          .filter((m) => m.role !== 'assistant' || history.indexOf(m) > 0)
          .map((m) => ({ role: m.role, content: m.content })),
      });
      const reply = response.data?.reply || 'Sorry, I could not generate a response.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const renderText = (text) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');

  return (
    <div className="ai-panel">
      <div className="ai-messages">
        {messages.map((m, i) => (
          <div key={i} className={`ai-bubble ai-bubble--${m.role}`}>
            {m.role === 'assistant' && <span className="ai-avatar">✦</span>}
            <div
              className="ai-bubble-text"
              dangerouslySetInnerHTML={{ __html: renderText(m.content) }}
            />
          </div>
        ))}
        {loading && (
          <div className="ai-bubble ai-bubble--assistant">
            <span className="ai-avatar">✦</span>
            <div className="ai-typing"><span/><span/><span/></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="ai-input-row">
        <input
          className="ai-input"
          placeholder="Ask anything about this lesson..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={loading}
        />
        <button className="ai-send-btn" onClick={send} disabled={loading || !input.trim()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

// ── Notes panel ─────────────────────────────────────────────────────────────
const Notes = ({ lessonId }) => {
  const STORAGE_KEY = `sf_notes_${lessonId}`;
  const [text, setText] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [saved, setSaved] = useState(false);
  const timerRef = useRef(null);

  const handleChange = (val) => {
    setText(val);
    setSaved(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, val);
      setSaved(true);
    }, 800);
  };

  return (
    <div className="notes-panel">
      <div className="notes-header">
        <span>📝 Your notes for this lesson</span>
        {saved && <span className="notes-saved">✓ Saved</span>}
      </div>
      <textarea
        className="notes-textarea"
        placeholder="Type your notes here... They're saved automatically to your browser."
        value={text}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const LessonPlayer = () => {
  const { courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [courseData, setCourseData]       = useState(null);
  const [progress, setProgress]           = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(searchParams.get('lesson') || null);
  const [activeLesson, setActiveLesson]   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [marking, setMarking]             = useState(false);
  const [tab, setTab]                     = useState('video'); // video | resources | notes | ai
  const [autoNext, setAutoNext]           = useState(true);
  const [sidebarOpen, setSidebarOpen]     = useState(true);

  const resumeSavedRef = useRef(false);

  // ── Load course + progress ──
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/courses/${courseId}`),
      api.get(`/progress/${courseId}`).catch(() => ({ data: { progress: null } })),
    ])
      .then(([courseRes, progressRes]) => {
        setCourseData(courseRes.data);
        setProgress(progressRes.data.progress);
        const requested   = searchParams.get('lesson');
        const resumeLesson = progressRes.data.progress?.lastLesson;
        const firstLesson  = courseRes.data.curriculum[0]?.lessons[0]?._id;
        setActiveLessonId(requested || resumeLesson || firstLesson || null);
      })
      .catch(() => setError('Could not load this course.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // ── Load active lesson ──
  useEffect(() => {
    if (!activeLessonId) return;
    resumeSavedRef.current = false;
    api.get(`/lessons/${activeLessonId}`)
      .then((res) => setActiveLesson(res.data.lesson))
      .catch((err) => setError(err.response?.data?.message || 'Could not load lesson.'));
    setSearchParams({ lesson: activeLessonId }, { replace: true });
    setTab('video');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLessonId]);

  // ── Save resume point ──
  useEffect(() => {
    if (!activeLessonId || resumeSavedRef.current) return;
    const timer = setTimeout(() => {
      api.post(`/progress/${courseId}/resume`, { lessonId: activeLessonId, positionSeconds: 0 }).catch(() => {});
      resumeSavedRef.current = true;
    }, 4000);
    return () => clearTimeout(timer);
  }, [activeLessonId, courseId]);

  const isCompleted = useCallback(
    (lessonId) => progress?.completedLessons?.some((id) => id === lessonId || id?._id === lessonId),
    [progress]
  );

  const handleMarkComplete = async (toComplete) => {
    setMarking(true);
    try {
      const endpoint = toComplete ? 'complete' : 'uncomplete';
      const res = await api.post(`/progress/${courseId}/${endpoint}`, { lessonId: activeLessonId });
      setProgress(res.data.progress);
      if (toComplete && autoNext) goToNextLesson();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update progress.');
    } finally {
      setMarking(false);
    }
  };

  // ── Flat lesson list helpers ──
  const flatLessons = courseData?.curriculum.flatMap((s) => s.lessons) || [];
  const currentIndex = flatLessons.findIndex((l) => l._id === activeLessonId);

  const goToNextLesson = () => {
    if (currentIndex < flatLessons.length - 1) {
      setActiveLessonId(flatLessons[currentIndex + 1]._id);
    }
  };

  const goToPrevLesson = () => {
    if (currentIndex > 0) {
      setActiveLessonId(flatLessons[currentIndex - 1]._id);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error && !courseData) return <div className="page-loading">{error}</div>;
  if (!courseData) return null;

  const { course, curriculum, isEnrolled } = courseData;

  if (!isEnrolled) {
    return (
      <div className="page-loading">
        You're not enrolled.{' '}
        <Link to={`/courses/${courseId}`}>Go to course page</Link>
      </div>
    );
  }

  const totalLessons   = flatLessons.length;
  const completedCount = progress?.completedLessons?.length || 0;
  const percent        = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const completed      = activeLesson ? isCompleted(activeLesson._id) : false;

  const TABS = [
    { key: 'video',     label: '▶ Video' },
    { key: 'resources', label: '📎 Resources' },
    { key: 'notes',     label: '📝 Notes' },
    { key: 'ai',        label: '✦ AI Tutor' },
  ];

  return (
    <div className="player-page">

      {/* ── Top bar ── */}
      <div className="player-topbar">
        <div className="player-topbar-left">
          <button className="player-sidebar-toggle" onClick={() => setSidebarOpen((v) => !v)} title="Toggle sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <Link to={`/courses/${courseId}`} className="player-back">← {course.title}</Link>
        </div>
        <div className="player-progress-wrap">
          <div className="player-progress-bar"><div style={{ width: `${percent}%` }} /></div>
          <span>{completedCount}/{totalLessons} · {percent}%</span>
        </div>
        <label className="player-autonext-toggle">
          <input type="checkbox" checked={autoNext} onChange={(e) => setAutoNext(e.target.checked)} />
          <span>Auto-next</span>
        </label>
      </div>

      {/* ── Main layout ── */}
      <div className={`player-layout${sidebarOpen ? '' : ' sidebar-hidden'}`}>

        {/* ── Sidebar ── */}
        <aside className="player-sidebar">
          <div className="player-sidebar-head">
            <span>Course Content</span>
            <span className="player-sidebar-count">{completedCount}/{totalLessons}</span>
          </div>
          {curriculum.map((section, sIdx) => (
            <div className="player-section" key={section._id}>
              <div className="player-section-title">
                <span className="player-section-num">{sIdx + 1}</span>
                {section.title}
              </div>
              <ul>
                {section.lessons.map((lesson) => {
                  const done = isCompleted(lesson._id);
                  const active = activeLessonId === lesson._id;
                  return (
                    <li
                      key={lesson._id}
                      className={`player-lesson-item${active ? ' active' : ''}${done ? ' done' : ''}`}
                      onClick={() => setActiveLessonId(lesson._id)}
                    >
                      <span className="player-lesson-check">
                        {done
                          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          : <span className="player-lesson-circle" />
                        }
                      </span>
                      <span className="player-lesson-title">{lesson.title}</span>
                      {lesson.durationSeconds > 0 && (
                        <span className="player-lesson-duration">{formatDuration(lesson.durationSeconds)}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        {/* ── Main content ── */}
        <main className="player-main">
          {!activeLesson ? (
            <p className="courses-sub" style={{ textAlign: 'center', marginTop: 60 }}>Select a lesson to begin.</p>
          ) : (
            <>
              {/* Video */}
              <div className="player-video-wrap">
                {activeLesson.youtubeId ? (
                  <iframe
                    key={activeLesson._id}
                    src={`https://www.youtube.com/embed/${activeLesson.youtubeId}?rel=0&modestbranding=1`}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <div className="player-video-locked">Video not available for this lesson.</div>
                )}
              </div>

              {/* Lesson title + controls row */}
              <div className="player-lesson-header">
                <div className="player-lesson-nav">
                  <button
                    className="player-nav-btn"
                    onClick={goToPrevLesson}
                    disabled={currentIndex <= 0}
                  >← Prev</button>
                  <span className="player-nav-index">{currentIndex + 1} / {totalLessons}</span>
                  <button
                    className="player-nav-btn"
                    onClick={goToNextLesson}
                    disabled={currentIndex >= totalLessons - 1}
                  >Next →</button>
                </div>

                <h2 className="player-lesson-title-main">{activeLesson.title}</h2>

                <button
                  className={`player-complete-btn${completed ? ' completed' : ''}`}
                  disabled={marking}
                  onClick={() => handleMarkComplete(!completed)}
                >
                  {completed
                    ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Completed</>
                    : 'Mark Complete'
                  }
                </button>
              </div>

              {/* Tab bar */}
              <div className="player-tabs">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    className={`player-tab${tab === t.key ? ' active' : ''}`}
                    onClick={() => setTab(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab panels */}
              <div className="player-tab-panel">

                {tab === 'video' && (
                  <div className="player-video-info">
                    {activeLesson.description ? (
                      <p>{activeLesson.description}</p>
                    ) : (
                      <p className="player-no-content">No description for this lesson.</p>
                    )}
                    {currentIndex < totalLessons - 1 && (
                      <div className="player-up-next" onClick={goToNextLesson}>
                        <span className="player-up-next-label">Up Next</span>
                        <span className="player-up-next-title">{flatLessons[currentIndex + 1]?.title}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    )}
                    {currentIndex === totalLessons - 1 && percent === 100 && (
                      <div className="player-completed-banner">
                        🎉 You've completed this course! Your certificate is ready.
                      </div>
                    )}
                  </div>
                )}

                {tab === 'resources' && (
                  <div className="player-resources-panel">
                    {(activeLesson.resources || []).length === 0 ? (
                      <p className="player-no-content">No resources attached to this lesson.</p>
                    ) : (
                      <ul className="player-resources-list">
                        {activeLesson.resources.map((r) => (
                          <li key={r._id || r.url}>
                            <a href={r.url} target="_blank" rel="noopener noreferrer" className="player-resource-item">
                              <span className="player-resource-icon">📄</span>
                              <span className="player-resource-name">{r.title}</span>
                              <span className="player-resource-download">↓ Download</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {tab === 'notes' && <Notes lessonId={activeLesson._id} />}

                {tab === 'ai' && (
                  <AIAssistant
                    lessonTitle={activeLesson.title}
                    courseTitle={course.title}
                  />
                )}
              </div>

              {error && <p className="form-error" style={{ marginTop: 12 }}>{error}</p>}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default LessonPlayer;