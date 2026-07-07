import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const formatDuration = (s) => {
  const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
  return h === 0 ? `${m}m` : `${h}h ${m}m`;
};

const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [enrolling, setEnrolling]   = useState(false);
  const [openSections, setOpenSections] = useState({});
  const [openFaq, setOpenFaq]       = useState(null);

  const load = () => {
    setLoading(true);
    api.get(`/courses/${id}`)
      .then((res) => {
        setData(res.data);
        // open all sections by default
        const defaultOpen = {};
        res.data.curriculum.forEach((s) => { defaultOpen[s._id] = false; });
        setOpenSections(defaultOpen);
      })
      .catch(() => setError('Could not load this course.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const toggleSection = (id) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleEnroll = async () => {
    if (!user) { navigate('/login', { state: { from: { pathname: `/courses/${id}` } } }); return; }
    // Use data?.course so we always read the latest loaded value
    const courseData = data?.course;
    if (!courseData) return;
    // Paid course -> go to checkout
    if (courseData.price && courseData.price > 0) {
      navigate(`/checkout/${id}`);
      return;
    }
    // Free course -> enroll directly
    setEnrolling(true); setError('');
    try { await api.post('/enrollments', { courseId: id }); load(); }
    catch (err) { setError(err.response?.data?.message || 'Could not enroll right now.'); }
    finally { setEnrolling(false); }
  };

  if (loading) return <><Navbar /><div className="page-loading">Loading course...</div><Footer /></>;
  if (!data)   return <><Navbar /><div className="page-loading">{error || 'Course not found.'}</div><Footer /></>;

  const { course, curriculum, totalLessons, totalDurationSeconds, isEnrolled } = data;
  const stars = Math.round(course.rating);

  // pick a preview video from curriculum
  let previewVideoId = null;
  for (const section of curriculum) {
    const previewLesson = section.lessons.find((l) => l.isPreview && l.youtubeId);
    if (previewLesson) { previewVideoId = previewLesson.youtubeId; break; }
  }
  if (!previewVideoId && curriculum[0]?.lessons[0]?.youtubeId) {
    previewVideoId = curriculum[0].lessons[0].youtubeId;
  }

  const totalSections = curriculum.length;

  const featureStats = [
    { icon: '👤', stat: 'Anyone',              label: 'Can learn (IT / Non IT)' },
    { icon: '⭐', stat: `${course.rating}+`,   label: 'Course Rating' },
    { icon: '👥', stat: course.studentsDisplay, label: 'Learners' },
    { icon: '♾️', stat: 'Lifetime',            label: 'Course Access' },
    { icon: '💳', stat: course.price > 0 ? `₹${course.price.toLocaleString('en-IN')}` : 'Free', label: 'One-time Payment' },
    { icon: '🕐', stat: totalDurationSeconds > 0 ? formatDuration(totalDurationSeconds) : course.duration, label: 'Content Duration' },
    { icon: '🔤', stat: 'Simple English',      label: 'Language' },
    { icon: '🎬', stat: 'Self Paced',          label: 'Recorded Lectures' },
  ];

  return (
    <>
      <Navbar />

      {/* ══════════════════════════════════════════
          HERO — white bg, left text + right video
      ══════════════════════════════════════════ */}
      <section className="td-hero" style={course.banner ? { backgroundImage: `url(${course.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <div className="td-hero-inner">

          {/* LEFT */}
          <div className="td-hero-left">
            <div className="td-badge">A SkillForge Initiative</div>

            <h1 className="td-hero-title">
              Become a certified<br />
              <span className="td-hero-highlight">{course.title}</span><br />
              expert
            </h1>

            {course.subtitle && (
              <p className="td-hero-subtitle">{course.subtitle}</p>
            )}
            {course.subtitle && (
              <p className="td-hero-subtitle">{course.subtitle}</p>
            )}
            <p className="td-hero-sub">
              And get 1-on-1 Live Mentorship, Lifetime Course Access &amp; Job Assistance
            </p>

            <div className="td-price-row">
              {course.price > 0 ? (
                <>
                  <span className="td-price">₹{course.price.toLocaleString('en-IN')}</span>
                  {course.originalPrice > course.price && (
                    <span className="td-orig-price">₹{course.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                </>
              ) : (
                <span className="td-price">Free</span>
              )}
            </div>

            {error && <p className="form-error">{error}</p>}

            {isEnrolled ? (
              <Link to={`/learn/${course._id}`} className="td-enroll-btn">Continue Learning →</Link>
            ) : (
              <button className="td-enroll-btn" onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? 'Enrolling...' : 'Start Learning'}
              </button>
            )}

            <div className="td-rating-row">
              <span className="td-stars">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
              <span className="td-rating-num">{course.rating}</span>
              <span className="td-rating-count">({course.reviewsCount} ratings)</span>
            </div>
          </div>

          {/* RIGHT — video + learner count */}
          <div className="td-hero-right">
            <div className="td-video-wrap">
              {previewVideoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${previewVideoId}`}
                  title={`${course.title} preview`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="td-thumb-img" />
              ) : (
                <div className="td-video-placeholder">
                  <span>▶</span>
                  <p>Course Preview</p>
                </div>
              )}
            </div>

            <div className="td-learner-bar">
              <div className="td-avatar-stack">
                {['V','A','R','K'].map((l, i) => (
                  <div className="td-avatar" key={i} style={{ left: i * 24 }}>{l}</div>
                ))}
              </div>
              <div className="td-learner-text">
                <strong>{course.studentsDisplay} Learners</strong>
                <span>already enrolled</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          COURSE FEATURES — 2×4 stat grid card
      ══════════════════════════════════════════ */}
      <section className="td-features-section">
        <h2 className="td-section-heading">{course.title} Course Features</h2>
        <div className="td-features-card">
          {featureStats.map((f, i) => (
            <div className="td-feature-item" key={i}>
              <div className="td-feature-icon-wrap">
                <span>{f.icon}</span>
              </div>
              <div className="td-feature-text">
                <strong>{f.stat}</strong>
                <span>{f.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHAT YOU'LL LEARN
      ══════════════════════════════════════════ */}
      {course.learnOutcomes?.length > 0 && (
        <section className="td-body-section">
          <h2 className="td-section-heading">What You'll Learn</h2>
          <div className="td-outcomes-grid">
            {course.learnOutcomes.map((item, i) => (
              <div className="td-outcome-item" key={i}>
                <span className="td-check">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          REQUIREMENTS
      ══════════════════════════════════════════ */}
      {course.requirements?.length > 0 && (
        <section className="td-body-section">
          <h2 className="td-section-heading">Requirements</h2>
          <ul className="td-req-list">
            {course.requirements.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </section>
      )}

      {/* Description */}
      {course.description && (
        <section className="td-body-section">
          <h2 className="td-section-heading">About This Course</h2>
          <div className="td-description">
            {course.description.split('\n').map((para, i) =>
              para.trim() ? <p key={i}>{para}</p> : null
            )}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          CURRICULUM — stats bar + 2-col accordion
      ══════════════════════════════════════════ */}
      <section className="td-body-section">
        <h2 className="td-section-heading">{course.title} Course Curriculum</h2>

        {/* stats bar */}
        <div className="td-curr-stats">
          <div className="td-curr-stat">
            <span className="td-curr-stat-emoji">👥</span>
            <div>
              <strong>{course.studentsDisplay}</strong>
              <span>Learners</span>
            </div>
          </div>
          <div className="td-curr-divider" />
          <div className="td-curr-stat">
            <span className="td-curr-stat-emoji">🕐</span>
            <div>
              <strong>{totalDurationSeconds > 0 ? formatDuration(totalDurationSeconds) : course.duration}</strong>
              <span>Content</span>
            </div>
          </div>
          <div className="td-curr-divider" />
          <div className="td-curr-stat">
            <span className="td-curr-stat-emoji">🤝</span>
            <div>
              <strong>Simple</strong>
              <span>English</span>
            </div>
          </div>
        </div>

        {/* Curriculum header row */}
        {curriculum.length > 0 && (
          <div className="td-curr-header-row">
            <p className="td-curr-summary" style={{ margin: 0 }}>
              {totalSections} sections &middot; {totalLessons} lessons
              {totalDurationSeconds > 0 && ` · ${formatDuration(totalDurationSeconds)} total`}
            </p>
            <div className="td-curr-controls">
              <button className="td-curr-expand-btn" onClick={() => {
                const allOpen = {};
                curriculum.forEach(s => { allOpen[s._id] = true; });
                setOpenSections(allOpen);
              }}>Expand All</button>
              <button className="td-curr-expand-btn" onClick={() => {
                const allClosed = {};
                curriculum.forEach(s => { allClosed[s._id] = false; });
                setOpenSections(allClosed);
              }}>Collapse All</button>
            </div>
          </div>
        )}

        {/* Single-column accordion */}
        {curriculum.length === 0 ? (
          <p className="courses-sub" style={{ textAlign: 'center' }}>Curriculum coming soon.</p>
        ) : (
          <div className="td-curr-accordion">
            {curriculum.map((section, sIdx) => {
              const isOpen = openSections[section._id];
              return (
                <div className={`td-curr-section${isOpen ? ' open' : ''}`} key={section._id}>
                  {/* Section header */}
                  <button
                    className="td-curr-section-btn"
                    onClick={() => toggleSection(section._id)}
                  >
                    <div className="td-curr-section-left">
                      <span className="td-curr-section-num">{sIdx + 1}</span>
                      <div>
                        <span className="td-curr-section-title">{section.title}</span>
                        <span className="td-curr-section-meta">
                          {section.lessons.length} lesson{section.lessons.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <svg className="td-curr-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Lessons list — animated */}
                  {isOpen && section.lessons.length > 0 && (
                    <ul className="td-curr-lessons">
                      {section.lessons.map((lesson, lIdx) => (
                        <li key={lesson._id} className="td-curr-lesson">
                          <span className="td-lesson-num">{sIdx + 1}.{lIdx + 1}</span>
                          <span className="td-lesson-icon">
                            {lesson.isPreview || isEnrolled ? (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="#0151e6"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            ) : (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            )}
                          </span>
                          <span className="td-lesson-title">{lesson.title}</span>
                          <span className="td-lesson-right">
                            {lesson.isPreview && !isEnrolled && (
                              <Link to={`/learn/${course._id}?lesson=${lesson._id}`} className="td-preview-tag">
                                Preview
                              </Link>
                            )}
                            {lesson.durationSeconds > 0 && (
                              <span className="td-lesson-dur">
                                {Math.floor(lesson.durationSeconds / 60)}:{String(lesson.durationSeconds % 60).padStart(2, '0')}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════
          INSTRUCTOR
      ══════════════════════════════════════════ */}
      {course.instructor && (
        <section className="td-body-section">
          <h2 className="td-section-heading">Your Instructor</h2>
          <div className="td-instructor-card">
            <div className="td-instructor-avatar">
              {course.instructor.avatarUrl
                ? <img src={course.instructor.avatarUrl} alt={course.instructor.name} />
                : course.instructor.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h3 className="td-instructor-name">{course.instructor.name}</h3>
              <p className="td-instructor-bio">
                {course.instructor.bio || 'Experienced industry instructor at SkillForge.'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          REVIEWS
      ══════════════════════════════════════════ */}
      {course.reviews?.length > 0 && (
        <section className="td-body-section">
          <h2 className="td-section-heading">Student Reviews</h2>
          <div className="td-reviews-summary">
            <div className="td-big-rating">{course.rating}</div>
            <div>
              <div className="td-stars-row">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</div>
              <p>{course.reviewsCount} ratings</p>
            </div>
          </div>
          <div className="td-reviews-grid">
            {course.reviews.map((r, i) => (
              <div className="td-review-card" key={i}>
                <div className="td-review-header">
                  <div className="td-review-avatar">
                    {r.avatar ? <img src={r.avatar} alt={r.name} /> : r.name[0]}
                  </div>
                  <div>
                    <strong>{r.name}</strong>
                    <div className="td-review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  </div>
                </div>
                <p className="td-review-text">"{r.text}"</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      {course.faqs?.length > 0 && (
        <section className="td-body-section">
          <h2 className="td-section-heading">Frequently Asked Questions</h2>
          <div className="td-faq-list">
            {course.faqs.map((faq, i) => (
              <div className="td-faq-item" key={i}>
                <button className="td-faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.question}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {openFaq === i && <div className="td-faq-answer">{faq.answer}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════ */}
      <section className="td-bottom-cta">
        <h2>Ready to become a <span>{course.title}</span> expert?</h2>
        <p>Join {course.studentsDisplay} students already learning with SkillForge</p>
        {error && <p className="form-error">{error}</p>}
        {isEnrolled ? (
          <Link to={`/learn/${course._id}`} className="td-enroll-btn">Continue Learning →</Link>
        ) : (
          <button className="td-enroll-btn" onClick={handleEnroll} disabled={enrolling}>
            {enrolling ? 'Enrolling...' : 'Start Learning Now'}
          </button>
        )}
      </section>

      <Footer />
    </>
  );
};

export default CourseDetails;