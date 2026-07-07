import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');   // all | published | draft | unpublished
  const [analyticsFilter, setAnalyticsFilter] = useState('courses'); // courses | students
  const [studentSearch, setStudentSearch] = useState('');
  const [modal, setModal] = useState(null);

  const isPending = user?.role === 'instructor' && user?.instructorStatus === 'pending';
  const isRejected = user?.role === 'instructor' && user?.instructorStatus === 'rejected';

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/instructor/courses'),
      api.get('/instructor/analytics'),
      api.get('/instructor/students'),
    ])
      .then(([coursesRes, analyticsRes, studentsRes]) => {
        setCourses(coursesRes.data.courses);
        setAnalytics(analyticsRes.data);
        setStudents(studentsRes.data.students);
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load your dashboard.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isPending) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleCreateCourse = async (title) => {
  setModal(null);

  if (!title) return;

  try {
    const res = await api.post('/instructor/courses', {
      title,
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      category: 'Development',
      icon: 'java',
      duration: 'Self-paced',
      description: '',
    });

    navigate(`/instructor/courses/${res.data.course._id}`);
  } catch (err) {
    setError(err.response?.data?.message || 'Could not create course.');
  }
};



  const handleTogglePublish = async (course) => {
    try {
      const res = await api.patch(`/instructor/courses/${course._id}/publish`);
      setCourses((prev) => prev.map((c) => (c._id === course._id ? res.data.course : c)));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update course status.');
    }
  };


  const handleDeleteConfirmed = async (courseId) => {
  setModal(null);

  try {
    await api.delete(`/instructor/courses/${courseId}`);
    setCourses((prev) => prev.filter((c) => c._id !== courseId));
  } catch (err) {
    setError(err.response?.data?.message || 'Could not delete course.');
  }
};

  if (isPending) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Instructor Dashboard</h1>
        </div>
        <div className="empty-state">
          <p>Your instructor account is awaiting admin approval.</p>
          <p className="courses-sub">You'll be able to create and publish courses once approved.</p>
        </div>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Instructor Dashboard</h1>
        </div>
        <div className="empty-state">
          <p>Your instructor application wasn't approved.</p>
          <p className="courses-sub">Contact the SkillForge team if you think this was a mistake.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* ── Modals ── */}
      <Modal
        isOpen={modal?.type === 'create'}
        title="Create New Course"
        message="Give your course a title. You can change everything else in the editor."
        inputPlaceholder="e.g. Java Full Stack Development"
        confirmLabel="Create Course"
        onConfirm={handleCreateCourse}
        onCancel={() => setModal(null)}
      />

      <Modal
        isOpen={modal?.type === 'delete'}
        title="Delete Course"
        message={`Are you sure you want to delete "${modal?.courseTitle}"? This will permanently remove the course and all its lessons. This cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Keep Course"
        danger={true}
        onConfirm={() => handleDeleteConfirmed(modal.courseId)}
        onCancel={() => setModal(null)}
      />

      <div className="dashboard-header">
        <div>
          <h1>Instructor Dashboard</h1>
          <p>Welcome back, {user?.name} 👋</p>
        </div>
        <button className="btn" id="btn-fill" onClick={() => setModal({ type: 'create' })}> + New Course</button>
      </div>

      <div className="admin-tabs">
        <button className={tab === 'courses' ? 'active' : ''} onClick={() => setTab('courses')}>
          📊 My Courses {courses.length > 0 && <span className="tab-badge">{courses.length}</span>}
        </button>
        <button className={tab === 'analytics' ? 'active' : ''} onClick={() => setTab('analytics')}>
          📈 Analytics
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading ? (
        <p className="courses-sub">Loading...</p>
      ) : tab === 'courses' ? (
        <>
          {/* ── Course filter bar ── */}
          <div className="idash-filter-bar">
            {[
              { key: 'all',         label: '📚 All',         count: courses.length },
              { key: 'published',   label: '✅ Published',   count: courses.filter(c => c.status === 'published').length },
              { key: 'draft',       label: '📝 Draft',       count: courses.filter(c => c.status === 'draft').length },
            ].map(f => (
              <button
                key={f.key}
                className={`idash-filter-btn${courseFilter === f.key ? ' active' : ''}`}
                onClick={() => setCourseFilter(f.key)}
              >
                {f.label} <span className="idash-filter-count">{f.count}</span>
              </button>
            ))}
          </div>

          {courses.length === 0 ? (
            <div className="empty-state">
              <p>You haven't created any courses yet.</p>
              <button className="btn" id="btn-fill" onClick={() => setModal({ type: 'create' })}>Create your first course</button>
            </div>
          ) : (() => {
            const filtered = courseFilter === 'all' ? courses : courses.filter(c => c.status === courseFilter);
            return filtered.length === 0 ? (
              <div className="empty-state"><p>No courses match this filter.</p></div>
            ) : (
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead>
                    <tr><th>Title</th><th>Category</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c._id}>
                        <td><strong>{c.title}</strong></td>
                        <td>{c.category}</td>
                        <td><span className={`status-pill ${c.status}`}>{c.status}</span></td>
                        <td className="admin-actions">
                          <Link to={`/instructor/courses/${c._id}`}>✏️ Edit</Link>
                          <button onClick={() => handleTogglePublish(c)}>
                            {c.status === 'published' ? '📥 Unpublish' : '🚀 Publish'}
                          </button>
                          <Link to={`/instructor/courses/${c._id}/students`}>👥 Students</Link>
                          <button className="danger-link" onClick={() => setModal({ type: 'delete', courseId: c._id, courseTitle: c.title, })}> 🗑 Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </>
      ) : (
        <div>
          {/* ── Summary stat cards ── */}
          <div className="admin-stats-grid">
            <div
              className={`admin-stat-card idash-stat-clickable${analyticsFilter === 'courses' ? ' idash-stat-active' : ''}`}
              onClick={() => setAnalyticsFilter('courses')}
            >
              <span>{analytics?.summary.totalCourses}</span><p>Total Courses</p>
            </div>
            <div
              className={`admin-stat-card idash-stat-clickable${analyticsFilter === 'published' ? ' idash-stat-active' : ''}`}
              onClick={() => setAnalyticsFilter('published')}
            >
              <span>{analytics?.summary.publishedCourses}</span><p>Published</p>
            </div>
            <div
              className={`admin-stat-card idash-stat-clickable${analyticsFilter === 'drafts' ? ' idash-stat-active' : ''}`}
              onClick={() => setAnalyticsFilter('drafts')}
            >
              <span>{(analytics?.summary.totalCourses || 0) - (analytics?.summary.publishedCourses || 0)}</span><p>Drafts / Unpublished</p>
            </div>
            <div
              className={`admin-stat-card idash-stat-clickable${analyticsFilter === 'students' ? ' idash-stat-active' : ''}`}
              onClick={() => setAnalyticsFilter('students')}
            >
              <span>{analytics?.summary.totalEnrollments}</span><p>Total Enrollments</p>
            </div>
          </div>

          {/* ── Courses breakdown table ── */}
          {(analyticsFilter === 'courses' || analyticsFilter === 'published' || analyticsFilter === 'drafts') && (() => {
            const rows = (analytics?.courses || []).filter(c => {
              if (analyticsFilter === 'published') return c.status === 'published';
              if (analyticsFilter === 'drafts') return c.status !== 'published';
              return true;
            });
            return (
              <div className="admin-table-card" style={{ marginTop: 24 }}>
                <table className="admin-table">
                  <thead>
                    <tr><th>Course</th><th>Status</th><th>Enrollments</th><th>Avg. Completion</th></tr>
                  </thead>
                  <tbody>
                    {rows.map((c) => (
                      <tr key={c.courseId}>
                        <td><strong>{c.title}</strong></td>
                        <td><span className={`status-pill ${c.status}`}>{c.status}</span></td>
                        <td>{c.enrollments}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ flex: 1, background: '#eef2ff', borderRadius: 20, height: 8, overflow: 'hidden', minWidth: 80 }}>
                              <div style={{
                                width: `${c.avgCompletionPercent}%`,
                                height: '100%',
                                background: c.avgCompletionPercent >= 80 ? '#16a34a' : c.avgCompletionPercent >= 40 ? '#1a56db' : '#f97316',
                                borderRadius: 20,
                                transition: 'width 0.4s ease',
                              }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#0f1a3d', minWidth: 36 }}>{c.avgCompletionPercent}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}

          {/* ── Students table ── */}
          {analyticsFilter === 'students' && (() => {
            const filtered = students.filter(s =>
              s.studentName.toLowerCase().includes(studentSearch.toLowerCase()) ||
              s.studentEmail.toLowerCase().includes(studentSearch.toLowerCase()) ||
              s.courseTitle.toLowerCase().includes(studentSearch.toLowerCase())
            );
            return (
              <div style={{ marginTop: 24 }}>
                <input
                  className="idash-search"
                  placeholder="🔍 Search by student name, email or course..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                />
                {filtered.length === 0 ? (
                  <div className="empty-state"><p>No students found.</p></div>
                ) : (
                  <div className="admin-table-card">
                    <table className="admin-table">
                      <thead>
                        <tr><th>#</th><th>Student</th><th>Email</th><th>Enrolled Course</th><th>Enrolled On</th></tr>
                      </thead>
                      <tbody>
                        {filtered.map((s, i) => (
                          <tr key={s.enrollmentId}>
                            <td style={{ color: '#aaa', fontSize: 12 }}>{i + 1}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 32, height: 32, borderRadius: '50%',
                                  background: '#eef2ff', color: '#1a56db',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontWeight: 700, fontSize: 13, flexShrink: 0,
                                }}>
                                  {s.studentName.charAt(0).toUpperCase()}
                                </div>
                                <strong>{s.studentName}</strong>
                              </div>
                            </td>
                            <td style={{ color: '#666', fontSize: 13 }}>{s.studentEmail}</td>
                            <td>
                              <span style={{
                                background: '#eef2ff', color: '#1a56db',
                                padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                              }}>
                                {s.courseTitle}
                              </span>
                            </td>
                            <td style={{ color: '#888', fontSize: 13 }}>
                              {new Date(s.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );


};

export default InstructorDashboard;
