import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import CourseCard from './CourseCard.jsx';

const FILTERS = ['All Courses', 'Development', 'AI & Data', 'Cloud', 'Design'];

const Courses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All Courses');
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [enrollingId, setEnrollingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    api
      .get('/courses')
      .then((res) => setCourses(res.data.courses))
      .catch(() => setFeedback('Could not load courses right now.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) {
      setEnrolledCourseIds(new Set());
      return;
    }
    api
      .get('/enrollments/me')
      .then((res) => {
        const ids = new Set(res.data.enrollments.map((e) => e.course._id));
        setEnrolledCourseIds(ids);
      })
      .catch(() => {});
  }, [user]);

  const handleEnroll = async (course) => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/' } } });
      return;
    }

    setEnrollingId(course._id);
    setFeedback('');
    try {
      await api.post('/enrollments', { courseId: course._id });
      setEnrolledCourseIds((prev) => new Set(prev).add(course._id));
      setFeedback(`You're enrolled in ${course.title}! Check your dashboard.`);
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Could not enroll right now.');
    } finally {
      setEnrollingId(null);
    }
  };

  const visibleCourses =
    activeFilter === 'All Courses'
      ? courses
      : courses.filter((c) => c.category === activeFilter);

  return (
    <section id="courses" className="courses-section">
      <p className="courses-label">Our Courses</p>
      <div className="courses-underline"><span></span><span></span></div>
      <h2 className="courses-heading">Explore Our <span>Popular Courses</span></h2>
      <p className="courses-sub">Master in-demand skills through expert-led,<br />project-based learning experiences.</p>

      <div className="filter-bar">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {feedback && <p className="course-feedback">{feedback}</p>}

      {loading ? (
        <p className="courses-sub">Loading courses...</p>
      ) : (
        <div className="course-grid">
          {visibleCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              isEnrolled={enrolledCourseIds.has(course._id)}
              isEnrolling={enrollingId === course._id}
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Courses;
