import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/mockInterview.css';
import api from '../api/axios.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const TOPICS = ['Java', 'React', 'Node', 'MongoDB', 'SQL', 'HR'];

const TOPIC_ICONS = {
  Java: '☕',
  React: '⚛️',
  Node: '🟢',
  MongoDB: '🍃',
  SQL: '🗄️',
  HR: '🤝',
};

const TOPIC_DESC = {
  Java: 'OOP, Collections, Multithreading, JVM',
  React: 'Hooks, State, Performance, Patterns',
  Node: 'Event Loop, Async, Express, REST',
  MongoDB: 'Schema, Aggregation, Indexing, CRUD',
  SQL: 'Joins, Subqueries, Indexing, Transactions',
  HR: 'Behavioral, Situational, Soft Skills',
};

export default function MockInterview() {
  const [phase, setPhase] = useState('select'); // select | interview | result | history
  const [selectedTopic, setSelectedTopic] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [qas, setQas] = useState([]); // { question, answer, evaluation, score }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [viewSession, setViewSession] = useState(null);

  // ── Start interview ──────────────────────────────────────────────
  const handleStart = async () => {
    if (!selectedTopic) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/ai/interview/start', { topic: selectedTopic });
      setSessionId(data.sessionId);
      setCurrentQuestion(data.question);
      setQas([]);
      setPhase('interview');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  // ── Submit answer ────────────────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/ai/interview/answer', { sessionId, answer });

      const newQA = {
        question: currentQuestion,
        answer,
        evaluation: data.evaluation,
        score: data.score,
      };
      const updatedQas = [...qas, newQA];
      setQas(updatedQas);
      setAnswer('');

      if (data.isComplete) {
        setPhase('result');
      } else {
        setCurrentQuestion(data.nextQuestion);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  // ── Load history ─────────────────────────────────────────────────
  const loadHistory = async () => {
    setPhase('history');
    setHistoryLoading(true);
    setViewSession(null);
    try {
      const { data } = await api.get('/ai/interview/history');
      setHistory(data.sessions);
    } catch {
      setError('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadSession = async (id) => {
    try {
      const { data } = await api.get(`/ai/interview/session/${id}`);
      setViewSession(data.session);
    } catch {
      setError('Failed to load session');
    }
  };

  const avgScore = (qas) => {
    const scored = qas.filter((q) => q.score !== null);
    if (!scored.length) return null;
    return (scored.reduce((s, q) => s + q.score, 0) / scored.length).toFixed(1);
  };

  const scoreColor = (score) => {
    if (score >= 7) return '#1ca34e';
    if (score >= 4) return '#e6a817';
    return '#d92d20';
  };

  const resetAll = () => {
    setPhase('select');
    setSelectedTopic('');
    setSessionId(null);
    setCurrentQuestion('');
    setAnswer('');
    setQas([]);
    setError('');
    setViewSession(null);
  };

  return (
    <>
      <Navbar />
      <div className="mock-interview-page">
        {/* ── Header ── */}
        <div className="mi-header">
          <h1>🎯 AI Mock Interview</h1>
          <p>Practice technical & HR interviews with instant AI feedback</p>
          <div className="mi-header-actions">
            {phase !== 'select' && (
              <button className="mi-btn-outline" onClick={resetAll}>
                ← New Interview
              </button>
            )}
            {phase !== 'history' && (
              <button className="mi-btn-outline" onClick={loadHistory}>
                📋 History
              </button>
            )}
          </div>
        </div>

        {error && <p className="form-error mi-error">{error}</p>}

        {/* ══════════ SELECT TOPIC ══════════ */}
        {phase === 'select' && (
          <div className="mi-select-phase">
            <h2>Choose your interview topic</h2>
            <p className="mi-select-sub">5 questions · AI evaluation · Score out of 10</p>
            <div className="mi-topics-grid">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  className={`mi-topic-card ${selectedTopic === t ? 'mi-topic-selected' : ''}`}
                  onClick={() => setSelectedTopic(t)}
                >
                  <span className="mi-topic-icon">{TOPIC_ICONS[t]}</span>
                  <span className="mi-topic-name">{t}</span>
                  <span className="mi-topic-desc">{TOPIC_DESC[t]}</span>
                </button>
              ))}
            </div>
            <button
              className="mi-btn-primary mi-start-btn"
              disabled={!selectedTopic || loading}
              onClick={handleStart}
            >
              {loading ? 'Starting...' : `Start ${selectedTopic || ''} Interview →`}
            </button>
          </div>
        )}

        {/* ══════════ INTERVIEW ══════════ */}
        {phase === 'interview' && (
          <div className="mi-interview-phase">
            <div className="mi-progress-bar">
              <div className="mi-progress-label">
                <span className="mi-topic-badge">{TOPIC_ICONS[selectedTopic]} {selectedTopic}</span>
                <span>Question {qas.length + 1} / 5</span>
              </div>
              <div className="mi-progress-track">
                <div className="mi-progress-fill" style={{ width: `${(qas.length / 5) * 100}%` }} />
              </div>
            </div>

            {/* Previous Q&As */}
            {qas.length > 0 && (
              <div className="mi-prev-qas">
                {qas.map((qa, i) => (
                  <div className="mi-qa-card mi-qa-done" key={i}>
                    <div className="mi-qa-header">
                      <span className="mi-q-num">Q{i + 1}</span>
                      {qa.score !== null && (
                        <span className="mi-score-badge" style={{ background: scoreColor(qa.score) }}>
                          {qa.score}/10
                        </span>
                      )}
                    </div>
                    <p className="mi-question">{qa.question}</p>
                    <p className="mi-answer-text"><strong>Your answer:</strong> {qa.answer}</p>
                    <div className="mi-evaluation">
                      <strong>AI Feedback:</strong>
                      <p>{qa.evaluation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Current Question */}
            <div className="mi-qa-card mi-qa-active">
              <div className="mi-qa-header">
                <span className="mi-q-num">Q{qas.length + 1}</span>
                <span className="mi-active-badge">Current</span>
              </div>
              <p className="mi-question">{currentQuestion}</p>
              <textarea
                className="mi-answer-input"
                rows={5}
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={loading}
              />
              <button
                className="mi-btn-primary"
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || loading}
              >
                {loading ? 'Evaluating...' : 'Submit Answer →'}
              </button>
            </div>
          </div>
        )}

        {/* ══════════ RESULT ══════════ */}
        {phase === 'result' && (
          <div className="mi-result-phase">
            <div className="mi-result-header">
              <h2>Interview Complete! 🎉</h2>
              <div className="mi-overall-score">
                <span>Overall Score</span>
                <strong style={{ color: scoreColor(parseFloat(avgScore(qas))) }}>
                  {avgScore(qas)} / 10
                </strong>
              </div>
            </div>

            <div className="mi-result-qas">
              {qas.map((qa, i) => (
                <div className="mi-qa-card" key={i}>
                  <div className="mi-qa-header">
                    <span className="mi-q-num">Q{i + 1}</span>
                    {qa.score !== null && (
                      <span className="mi-score-badge" style={{ background: scoreColor(qa.score) }}>
                        {qa.score}/10
                      </span>
                    )}
                  </div>
                  <p className="mi-question">{qa.question}</p>
                  <p className="mi-answer-text"><strong>Your answer:</strong> {qa.answer}</p>
                  <div className="mi-evaluation">
                    <strong>AI Feedback:</strong>
                    <p>{qa.evaluation}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mi-result-actions">
              <button className="mi-btn-primary" onClick={resetAll}>
                Start New Interview
              </button>
              <button className="mi-btn-outline" onClick={loadHistory}>
                View History
              </button>
            </div>
          </div>
        )}

        {/* ══════════ HISTORY ══════════ */}
        {phase === 'history' && (
          <div className="mi-history-phase">
            {viewSession ? (
              <>
                <button className="mi-btn-outline mi-back-btn" onClick={() => setViewSession(null)}>
                  ← Back to History
                </button>
                <h2>{TOPIC_ICONS[viewSession.topic]} {viewSession.topic} Interview</h2>
                <p className="mi-history-meta">
                  {new Date(viewSession.createdAt).toLocaleDateString()} ·{' '}
                  <span style={{ color: viewSession.status === 'completed' ? '#1ca34e' : '#e6a817' }}>
                    {viewSession.status}
                  </span>
                </p>
                <div className="mi-result-qas">
                  {viewSession.qas.map((qa, i) => (
                    <div className="mi-qa-card" key={i}>
                      <div className="mi-qa-header">
                        <span className="mi-q-num">Q{i + 1}</span>
                        {qa.score !== null && (
                          <span className="mi-score-badge" style={{ background: scoreColor(qa.score) }}>
                            {qa.score}/10
                          </span>
                        )}
                      </div>
                      <p className="mi-question">{qa.question}</p>
                      {qa.answer && (
                        <p className="mi-answer-text"><strong>Your answer:</strong> {qa.answer}</p>
                      )}
                      {qa.evaluation && (
                        <div className="mi-evaluation">
                          <strong>AI Feedback:</strong>
                          <p>{qa.evaluation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2>Interview History</h2>
                {historyLoading ? (
                  <p className="mi-loading">Loading...</p>
                ) : history.length === 0 ? (
                  <div className="mi-empty">
                    <p>No interviews yet. Start your first one!</p>
                    <button className="mi-btn-primary" onClick={resetAll}>Start Interview</button>
                  </div>
                ) : (
                  <div className="mi-history-list">
                    {history.map((s) => {
                      const avg = avgScore(s.qas);
                      return (
                        <div className="mi-history-card" key={s._id} onClick={() => loadSession(s._id)}>
                          <div className="mi-history-card-left">
                            <span className="mi-topic-icon">{TOPIC_ICONS[s.topic]}</span>
                            <div>
                              <strong>{s.topic} Interview</strong>
                              <p>{new Date(s.createdAt).toLocaleDateString()} · {s.qas.length} questions</p>
                            </div>
                          </div>
                          <div className="mi-history-card-right">
                            {avg && (
                              <span className="mi-score-badge mi-score-lg" style={{ background: scoreColor(parseFloat(avg)) }}>
                                {avg}/10
                              </span>
                            )}
                            <span className={`mi-status-pill ${s.status}`}>{s.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}