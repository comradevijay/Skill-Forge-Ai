import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import CourseCard from './CourseCard.jsx';

const FILTERS = [
  { label: 'All Courses', icon: null },
  { label: 'Development', icon: '</>' },
  { label: 'AI & Data',   icon: '🤖' },
  { label: 'Cloud',       icon: '☁️' },
  { label: 'Design',      icon: '✏️' },
];

const Courses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses]               = useState([]);
  const [activeFilter, setActiveFilter]     = useState('All Courses');
  const [enrolledIds, setEnrolledIds]       = useState(new Set());
  const [enrollingId, setEnrollingId]       = useState(null);
  const [feedback, setFeedback]             = useState('');
  const [loading, setLoading]               = useState(true);

  // Clear stale feedback whenever this component mounts
  useEffect(() => {
    setFeedback('');
  }, []);

  // Auto-dismiss feedback after 4 seconds
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(''), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    api.get('/courses')
      .then((res) => setCourses(res.data.courses))
      .catch(() => setFeedback('Could not load courses right now.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) { setEnrolledIds(new Set()); return; }
    api.get('/enrollments/me')
      .then((res) => setEnrolledIds(new Set(res.data.enrollments.map((e) => e.course._id))))
      .catch(() => {});
  }, [user]);

  const handleEnroll = async (course) => {
    if (!user) { navigate('/login', { state: { from: { pathname: '/' } } }); return; }

    // Paid course → redirect to checkout (never call enrollments API directly)
    if (course.price && course.price > 0) {
      navigate(`/checkout/${course._id}`);
      return;
    }

    // Free course → enroll directly
    setEnrollingId(course._id); setFeedback('');
    try {
      await api.post('/enrollments', { courseId: course._id });
      setEnrolledIds((prev) => new Set(prev).add(course._id));
      setFeedback(`Enrolled in ${course.title}! Check your dashboard.`);
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Could not enroll right now.');
    } finally {
      setEnrollingId(null);
    }
  };

  const visible = (activeFilter === 'All Courses'
    ? courses
    : courses.filter((c) => c.category === activeFilter)
  ).slice(0, 6);

  return (
    <section id="courses" className="courses-section">
      <p className="courses-label">Our Courses</p>
      <div className="courses-underline"><span></span><span></span></div>
      <h2 className="courses-heading">
        Explore Our <span>Popular Courses</span>
      </h2>
      <p className="courses-sub">
        Master in-demand skills through expert-led,<br />
        project-based learning experiences.
      </p>

      {/* Filter pills */}
      <div className="filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            className={`filter-btn ${activeFilter === f.label ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.label)}
          >
            {f.icon && <span style={{ marginRight: 6 }}>{f.icon}</span>}
            {f.label}
          </button>
        ))}
      </div>

      {feedback && <p className="course-feedback">{feedback}</p>}

      {loading ? (
        <p className="courses-sub">Loading courses...</p>
      ) : (
        <div className="cc-grid">
          {visible.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              isEnrolled={enrolledIds.has(course._id)}
              isEnrolling={enrollingId === course._id}
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      )}

      {/* View All button */}
      <div style={{ textAlign: 'center', marginTop: 36 }}>
        <Link to="/courses" className="view-all-btn">
          View All Courses →
        </Link>
      </div>
    </section>
  );
};

export default Courses;