import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import CourseCard from '../components/CourseCard.jsx';

const FILTERS = [
  { label: 'All Courses' },
  { label: 'Development' },
  { label: 'AI & Data' },
  { label: 'Cloud' },
  { label: 'Design' },
];

const CoursesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses]           = useState([]);
  const [activeFilter, setActiveFilter] = useState('All Courses');
  const [enrolledIds, setEnrolledIds]   = useState(new Set());
  const [enrollingId, setEnrollingId]   = useState(null);
  const [feedback, setFeedback]         = useState('');
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then((res) => setCourses(res.data.courses))
      .catch(() => setFeedback('Could not load courses.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) { setEnrolledIds(new Set()); return; }
    api.get('/enrollments/me')
      .then((res) => setEnrolledIds(new Set(res.data.enrollments.map((e) => e.course._id))))
      .catch(() => {});
  }, [user]);

  const handleEnroll = async (course) => {
    // Not logged in → redirect to login
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/courses' } } });
      return;
    }

    // Paid course → go to checkout page (do NOT call enrollments API directly)
    if (course.price && course.price > 0) {
      navigate(`/checkout/${course._id}`);
      return;
    }

    // Free course → enroll directly
    setEnrollingId(course._id);
    setFeedback('');
    try {
      await api.post('/enrollments', { courseId: course._id });
      setEnrolledIds((prev) => new Set(prev).add(course._id));
      setFeedback(`Successfully enrolled in ${course.title}!`);
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Could not enroll.');
    } finally {
      setEnrollingId(null);
    }
  };

  const visible = activeFilter === 'All Courses'
    ? courses
    : courses.filter((c) => c.category === activeFilter);

  return (
    <>
      <Navbar />
      <div className="courses-page-wrap">
        <div className="courses-page-header">
          <h1>All Courses</h1>
          <p>Master in-demand skills through expert-led, project-based learning experiences.</p>
        </div>

        <div className="filter-bar">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              className={`filter-btn ${activeFilter === f.label ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.label)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {feedback && <p className="course-feedback">{feedback}</p>}

        {loading ? (
          <p className="courses-sub" style={{ textAlign: 'center' }}>Loading...</p>
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
      </div>
      <Footer />
    </>
  );
};

export default CoursesPage;