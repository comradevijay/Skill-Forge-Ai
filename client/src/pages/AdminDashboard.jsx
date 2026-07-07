import React, { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const TABS = ['Overview', 'Courses', 'Instructors', 'Enrollments', 'Leads'];

const emptyCourseForm = {
  title: '',
  category: 'Development',
  icon: 'java',
  iconTheme: 'icon-blue',
  duration: '',
  features: '',
  rating: 4.5,
  reviewsCount: 0,
  studentsDisplay: '0+',
  description: '',
};

const AdminDashboard = () => {
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [instructorFilter, setInstructorFilter] = useState('pending');

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, coursesRes, enrollRes, leadsRes, instructorsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/instructor/courses'), // admin sees ALL courses (draft + published) here
        api.get('/enrollments'),
        api.get('/contact'),
        api.get(`/admin/instructors?status=${instructorFilter}`),
      ]);
      setStats(statsRes.data.stats);
      setCourses(coursesRes.data.courses);
      setEnrollments(enrollRes.data.enrollments);
      setLeads(leadsRes.data.leads);
      setInstructors(instructorsRes.data.instructors);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructorFilter]);

  // --- Instructors ---
  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/instructors/${id}/approve`);
      setInstructors((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not approve instructor.');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this instructor application?')) return;
    try {
      await api.patch(`/admin/instructors/${id}/reject`);
      setInstructors((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reject instructor.');
    }
  };

  // --- Course CRUD ---
  const openNewCourseForm = () => {
    setEditingCourse(null);
    setCourseForm(emptyCourseForm);
    setShowCourseForm(true);
  };

  const openEditCourseForm = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      category: course.category,
      icon: course.icon,
      iconTheme: course.iconTheme,
      duration: course.duration,
      features: course.features.join(', '),
      rating: course.rating,
      reviewsCount: course.reviewsCount,
      studentsDisplay: course.studentsDisplay,
      description: course.description || '',
    });
    setShowCourseForm(true);
  };

  const handleCourseFormChange = (e) => {
    setCourseForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...courseForm,
      rating: Number(courseForm.rating),
      reviewsCount: Number(courseForm.reviewsCount),
      features: courseForm.features.split(',').map((f) => f.trim()).filter(Boolean),
      slug: courseForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    };

    try {
      if (editingCourse) {
        const res = await api.put(`/instructor/courses/${editingCourse._id}`, payload);
        setCourses((prev) => prev.map((c) => (c._id === editingCourse._id ? res.data.course : c)));
      } else {
        const res = await api.post('/instructor/courses', payload);
        setCourses((prev) => [...prev, res.data.course]);
      }
      setShowCourseForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save course.');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    try {
      await api.delete(`/instructor/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete course.');
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

  // --- Enrollments ---
  const handleCancelEnrollment = async (id) => {
    if (!window.confirm('Cancel this enrollment?')) return;
    try {
      await api.delete(`/enrollments/${id}`);
      setEnrollments((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel enrollment.');
    }
  };

  // --- Leads ---
  const toggleLeadStatus = async (id) => {
    try {
      const res = await api.patch(`/contact/${id}`);
      setLeads((prev) => prev.map((l) => (l._id === id ? res.data.lead : l)));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update lead.');
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/contact/${id}`);
      setLeads((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete lead.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-page admin-page">
        <div className="dashboard-header">
          <h1>Admin Panel</h1>
          <p>Manage courses, enrollments and contact leads.</p>
        </div>

        <div className="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`admin-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
              {t === 'Leads' && stats?.newLeads > 0 && (
                <span className="tab-badge">{stats.newLeads}</span>
              )}
              {t === 'Instructors' && stats?.pendingInstructors > 0 && (
                <span className="tab-badge">{stats.pendingInstructors}</span>
              )}
            </button>
          ))}
        </div>

        {error && <p className="form-error">{error}</p>}
        {loading && <p>Loading admin data...</p>}

        {!loading && tab === 'Overview' && stats && (
          <div className="stats-grid">
            <div className="admin-stat-card">
              <span className="admin-stat-value">{stats.totalStudents}</span>
              <span className="admin-stat-label">Registered Students</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-value">{stats.totalInstructors}</span>
              <span className="admin-stat-label">Approved Instructors {stats.pendingInstructors > 0 && `(${stats.pendingInstructors} pending)`}</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-value">{stats.totalCourses}</span>
              <span className="admin-stat-label">Active Courses</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-value">{stats.activeEnrollments}</span>
              <span className="admin-stat-label">Active Enrollments</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-value">{stats.totalLeads}</span>
              <span className="admin-stat-label">Contact Leads ({stats.newLeads} new)</span>
            </div>

            {stats.enrollmentsByCourse.length > 0 && (
              <div className="admin-table-wrap full-width">
                <h3>Enrollments by Course</h3>
                <table className="admin-table">
                  <thead><tr><th>Course</th><th>Enrollments</th></tr></thead>
                  <tbody>
                    {stats.enrollmentsByCourse.map((row) => (
                      <tr key={row.title}><td>{row.title}</td><td>{row.count}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!loading && tab === 'Courses' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h3>Courses ({courses.length})</h3>
              <button className="btn" id="btn-fill" onClick={openNewCourseForm}>+ Add Course</button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Title</th><th>Category</th><th>Duration</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c._id}>
                      <td>{c.title}</td>
                      <td>{c.category}</td>
                      <td>{c.duration}</td>
                      <td><span className={`status-pill ${c.status}`}>{c.status}</span></td>
                      <td>
                        <button className="link-btn" onClick={() => openEditCourseForm(c)}>Edit</button>
                        <button className="link-btn" onClick={() => handleTogglePublish(c)}>
                          {c.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button className="link-btn danger" onClick={() => handleDeleteCourse(c._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showCourseForm && (
              <div className="modal-overlay" onClick={() => setShowCourseForm(false)}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                  <h3>{editingCourse ? 'Edit Course' : 'New Course'}</h3>
                  <form onSubmit={handleCourseSubmit} className="auth-form">
                    <label>Title</label>
                    <input name="title" value={courseForm.title} onChange={handleCourseFormChange} required />

                    <label>Category</label>
                    <select name="category" value={courseForm.category} onChange={handleCourseFormChange}>
                      <option>Development</option>
                      <option>AI & Data</option>
                      <option>Cloud</option>
                      <option>Design</option>
                    </select>

                    <label>Icon</label>
                    <select name="icon" value={courseForm.icon} onChange={handleCourseFormChange}>
                      <option value="java">Java</option>
                      <option value="python">Python</option>
                      <option value="ai">AI</option>
                      <option value="cloud">Cloud</option>
                      <option value="design">Design</option>
                      <option value="data">Data</option>
                    </select>

                    <label>Duration (e.g. "10 Weeks")</label>
                    <input name="duration" value={courseForm.duration} onChange={handleCourseFormChange} required />

                    <label>Features (comma-separated)</label>
                    <input name="features" value={courseForm.features} onChange={handleCourseFormChange} />

                    <label>Rating (0-5)</label>
                    <input type="number" step="0.1" min="0" max="5" name="rating" value={courseForm.rating} onChange={handleCourseFormChange} />

                    <label>Reviews Count</label>
                    <input type="number" name="reviewsCount" value={courseForm.reviewsCount} onChange={handleCourseFormChange} />

                    <label>Students Display (e.g. "8,500+")</label>
                    <input name="studentsDisplay" value={courseForm.studentsDisplay} onChange={handleCourseFormChange} />

                    <label>Description</label>
                    <textarea name="description" rows="3" value={courseForm.description} onChange={handleCourseFormChange}></textarea>

                    <div className="modal-actions">
                      <button type="button" className="btn-outline" onClick={() => setShowCourseForm(false)}>Cancel</button>
                      <button type="submit" className="btn" id="btn-fill">{editingCourse ? 'Save Changes' : 'Create Course'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && tab === 'Instructors' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h3>Instructors</h3>
              <select value={instructorFilter} onChange={(e) => setInstructorFilter(e.target.value)}>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {instructors.length === 0 ? (
              <p className="courses-sub">No {instructorFilter} instructors.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Bio</th><th>Applied</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {instructors.map((i) => (
                      <tr key={i._id}>
                        <td>{i.name}</td>
                        <td>{i.email}</td>
                        <td className="message-cell">{i.bio || '—'}</td>
                        <td>{new Date(i.createdAt).toLocaleDateString()}</td>
                        <td>
                          {instructorFilter === 'pending' && (
                            <>
                              <button className="link-btn" onClick={() => handleApprove(i._id)}>Approve</button>
                              <button className="link-btn danger" onClick={() => handleReject(i._id)}>Reject</button>
                            </>
                          )}
                          {instructorFilter === 'rejected' && (
                            <button className="link-btn" onClick={() => handleApprove(i._id)}>Approve Anyway</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!loading && tab === 'Enrollments' && (
          <div className="admin-section">
            <h3>All Enrollments ({enrollments.length})</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Student</th><th>Email</th><th>Course</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => (
                    <tr key={e._id}>
                      <td>{e.user?.name}</td>
                      <td>{e.user?.email}</td>
                      <td>{e.course?.title}</td>
                      <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                      <td><span className={`status-pill ${e.status}`}>{e.status}</span></td>
                      <td>
                        {e.status === 'active' && (
                          <button className="link-btn danger" onClick={() => handleCancelEnrollment(e._id)}>
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && tab === 'Leads' && (
          <div className="admin-section">
            <h3>Contact Leads ({leads.length})</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l._id} className={l.status === 'new' ? 'unread-row' : ''}>
                      <td>{l.name}</td>
                      <td>{l.email}</td>
                      <td>{l.subject}</td>
                      <td className="message-cell">{l.message}</td>
                      <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                      <td><span className={`status-pill ${l.status}`}>{l.status}</span></td>
                      <td>
                        <button className="link-btn" onClick={() => toggleLeadStatus(l._id)}>
                          Mark {l.status === 'new' ? 'Read' : 'New'}
                        </button>
                        <button className="link-btn danger" onClick={() => deleteLead(l._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
