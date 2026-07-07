import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import Modal from '../components/Modal.jsx';

const CATEGORIES = ['Development', 'AI & Data', 'Cloud', 'Design'];
const ICONS = ['java', 'python', 'ai', 'cloud', 'design', 'data'];

const CourseEditor = () => {
  const { courseId } = useParams();

  const [course, setCourse]           = useState(null);
  const [sections, setSections]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [uploadingThumb, setUploadingThumb] = useState(false);

  // Modal state
  const [modal, setModal]             = useState(null);
  const [lessonDraft, setLessonDraft] = useState({});

  // ── Load course + curriculum ──
  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/instructor/courses').then((res) =>
        res.data.courses.find((c) => c._id === courseId)
      ),
      api.get(`/instructor/courses/${courseId}/sections`).then(
        (res) => res.data.sections
      ),
    ])
      .then(([courseData, sectionsData]) => {
        setCourse(courseData);
        setSections(sectionsData);
      })
      .catch(() => setError('Could not load this course.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // ── Course detail form helpers ──
  const handleFieldChange = (field, value) =>
    setCourse((prev) => ({ ...prev, [field]: value }));

  const handleListFieldChange = (field, index, value) => {
    setCourse((prev) => {
      const list = [...(prev[field] || [])];
      list[index] = value;
      return { ...prev, [field]: list };
    });
  };

  const handleAddListItem = (field) =>
    setCourse((prev) => ({ ...prev, [field]: [...(prev[field] || []), ''] }));

  const handleRemoveListItem = (field, index) =>
    setCourse((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));

  // ── Save course details ──
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { _id, instructor, createdAt, updatedAt, __v, status, ...payload } = course;
      payload.requirements  = (payload.requirements  || []).filter((r) => r.trim());
      payload.learnOutcomes = (payload.learnOutcomes || []).filter((r) => r.trim());
      payload.features      = (payload.features      || []).filter((r) => r.trim());

      const res = await api.put(`/instructor/courses/${courseId}`, payload);
      setCourse(res.data.course);
      setSuccess('Course details saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save course.');
    } finally {
      setSaving(false);
    }
  };

  // ── Thumbnail upload ──
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingThumb(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCourse((prev) => ({ ...prev, thumbnail: res.data.url }));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upload thumbnail.');
    } finally {
      setUploadingThumb(false);
    }
  };

  // ── Modal confirm handler ──
  const handleModalConfirm = async (value) => {
    const m = modal;
    setModal(null);

    if (m.type === 'addSection') {
      if (!value) return;
      try {
        const res = await api.post(`/instructor/courses/${courseId}/sections`, { title: value });
        setSections((prev) => [...prev, { ...res.data.section, lessons: [] }]);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not add section.');
      }
    }

    if (m.type === 'renameSection') {
      if (!value || value === m.section.title) return;
      try {
        const res = await api.put(`/instructor/sections/${m.section._id}`, { title: value });
        setSections((prev) =>
          prev.map((s) =>
            s._id === m.section._id ? { ...s, title: res.data.section.title } : s
          )
        );
      } catch (err) {
        setError(err.response?.data?.message || 'Could not rename section.');
      }
    }

    if (m.type === 'deleteSection') {
      try {
        await api.delete(`/instructor/sections/${m.section._id}`);
        setSections((prev) => prev.filter((s) => s._id !== m.section._id));
      } catch (err) {
        setError(err.response?.data?.message || 'Could not delete section.');
      }
    }

    if (m.type === 'addLesson' && m.step === 1) {
      if (!value) return;
      setLessonDraft({ title: value, section: m.section });
      setModal({ type: 'addLesson', section: m.section, step: 2 });
    }

    if (m.type === 'addLesson' && m.step === 2) {
      if (!value) return;
      setLessonDraft((prev) => ({ ...prev, videoUrl: value }));
      setModal({ type: 'addLesson', section: m.section, step: 3 });
    }

    if (m.type === 'addLesson' && m.step === 3) {
      const { title, videoUrl, section } = { ...lessonDraft };
      const isPreview = value === 'yes';
      try {
        const res = await api.post(`/instructor/sections/${section._id}/lessons`, {
          title,
          videoUrl,
          isPreview,
        });
        setSections((prev) =>
          prev.map((s) =>
            s._id === section._id
              ? { ...s, lessons: [...s.lessons, res.data.lesson] }
              : s
          )
        );
        setLessonDraft({});
      } catch (err) {
        setError(err.response?.data?.message || 'Could not add lesson.');
      }
    }

    if (m.type === 'deleteLesson') {
      try {
        await api.delete(`/instructor/lessons/${m.lesson._id}`);
        setSections((prev) =>
          prev.map((s) =>
            s._id === m.section._id
              ? { ...s, lessons: s.lessons.filter((l) => l._id !== m.lesson._id) }
              : s
          )
        );
      } catch (err) {
        setError(err.response?.data?.message || 'Could not delete lesson.');
      }
    }
  };

  // ── PDF resource upload ──
  const handleUploadResource = async (section, lesson, file) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/uploads/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newResources = [
        ...(lesson.resources || []),
        { title: file.name, url: uploadRes.data.url, type: 'pdf' },
      ];
      const res = await api.put(`/instructor/lessons/${lesson._id}`, {
        resources: newResources,
      });
      setSections((prev) =>
        prev.map((s) =>
          s._id === section._id
            ? {
                ...s,
                lessons: s.lessons.map((l) =>
                  l._id === lesson._id ? res.data.lesson : l
                ),
              }
            : s
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upload resource.');
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!course)
    return (
      <div className="page-loading">
        Course not found. <Link to="/instructor">Back to dashboard</Link>
      </div>
    );

  return (
    <div className="dashboard-page">

      {/* ══ MODALS ══ */}
      <Modal
        isOpen={modal?.type === 'addSection'}
        title="Add New Section"
        message="Sections group related lessons together — e.g. 'Getting Started', 'Core Concepts'."
        inputPlaceholder="e.g. Getting Started"
        confirmLabel="Add Section"
        onConfirm={handleModalConfirm}
        onCancel={() => setModal(null)}
      />

      <Modal
        isOpen={modal?.type === 'renameSection'}
        title="Rename Section"
        message="Enter a new title for this section."
        inputPlaceholder="Section title"
        defaultValue={modal?.section?.title || ''}
        confirmLabel="Save"
        onConfirm={handleModalConfirm}
        onCancel={() => setModal(null)}
      />

      <Modal
        isOpen={modal?.type === 'deleteSection'}
        title="Delete Section"
        message={`Are you sure you want to delete "${modal?.section?.title}"? All lessons inside this section will also be permanently deleted.`}
        confirmLabel="Yes, Delete Section"
        cancelLabel="Keep It"
        danger={true}
        onConfirm={handleModalConfirm}
        onCancel={() => setModal(null)}
      />

      <Modal
        isOpen={modal?.type === 'addLesson' && modal?.step === 1}
        title="Add Lesson — Step 1 of 3"
        message={`Adding to: "${modal?.section?.title}"`}
        inputPlaceholder="e.g. Introduction to Java"
        confirmLabel="Next →"
        onConfirm={handleModalConfirm}
        onCancel={() => { setModal(null); setLessonDraft({}); }}
      />

      <Modal
        isOpen={modal?.type === 'addLesson' && modal?.step === 2}
        title="Add Lesson — Step 2 of 3"
        message={`Lesson: "${lessonDraft.title}" — Paste the YouTube video URL.`}
        inputPlaceholder="https://www.youtube.com/watch?v=..."
        confirmLabel="Next →"
        onConfirm={handleModalConfirm}
        onCancel={() => { setModal(null); setLessonDraft({}); }}
      />

      <Modal
        isOpen={modal?.type === 'addLesson' && modal?.step === 3}
        title="Add Lesson — Step 3 of 3"
        message={`Should "${lessonDraft.title}" be a free preview? Free preview lessons are visible to anyone before enrolling.`}
        confirmLabel="Yes, Free Preview"
        cancelLabel="No, Enrolled Only"
        onConfirm={() => handleModalConfirm('yes')}
        onCancel={() => handleModalConfirm('no')}
      />

      <Modal
        isOpen={modal?.type === 'deleteLesson'}
        title="Delete Lesson"
        message={`Permanently delete "${modal?.lesson?.title}"? This cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Keep Lesson"
        danger={true}
        onConfirm={handleModalConfirm}
        onCancel={() => setModal(null)}
      />

      {/* ══ PAGE HEADER ══ */}
      <div className="dashboard-header">
        <div>
          <h1>Edit Course</h1>
          <p style={{ fontSize: 14, color: '#888', marginTop: 4 }}>
            {course.title}
            <span className={`status-pill ${course.status}`} style={{ marginLeft: 10 }}>
              {course.status}
            </span>
          </p>
        </div>
        <Link to="/instructor" className="player-back">← Back to dashboard</Link>
      </div>

      {/* ══ COURSE DETAILS FORM ══ */}
      <form className="course-editor-form" onSubmit={handleSaveCourse}>
        <h3 style={{ fontSize: 16, color: '#0f1a3d', marginBottom: 4 }}>Course Details</h3>

        <label>Title</label>
        <input
          value={course.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label>Category</label>
            <select
              value={course.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label>Icon</label>
            <select
              value={course.icon}
              onChange={(e) => handleFieldChange('icon', e.target.value)}
            >
              {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label>Duration (e.g. "12 Weeks")</label>
            <input
              value={course.duration}
              onChange={(e) => handleFieldChange('duration', e.target.value)}
              required
            />
          </div>
          <div>
            <label>Price (₹) — 0 for free</label>
            <input
              type="number"
              min="0"
              value={course.price || 0}
              onChange={(e) => handleFieldChange('price', Number(e.target.value))}
            />
          </div>
        </div>

        <label>Subtitle <span style={{fontSize:12,color:'#aaa',fontWeight:400}}>— shown below the title on the course page</span></label>
        <input
          value={course.subtitle || ''}
          placeholder="e.g. Master Java from scratch with hands-on projects"
          onChange={(e) => handleFieldChange('subtitle', e.target.value)}
        />

        <label>Description</label>
        <textarea
          rows="3"
          value={course.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
        />

        <label>Banner Image <span style={{fontSize:12,color:'#aaa',fontWeight:400}}>— wide hero banner (optional)</span></label>
        {course.banner && (
          <img src={course.banner} alt="banner" style={{ width:'100%', maxHeight:160, objectFit:'cover', borderRadius:10, marginBottom:8 }} />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
              const fd = new FormData();
              fd.append('file', file);
              const res = await api.post('/uploads/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
              handleFieldChange('banner', res.data.url);
            } catch { setError('Could not upload banner.'); }
          }}
        />

        <label>Thumbnail Image</label>
        {course.thumbnail && (
          <img src={course.thumbnail} alt="thumbnail" className="thumb-preview" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleThumbnailUpload}
          disabled={uploadingThumb}
        />
        {uploadingThumb && <p className="courses-sub">Uploading thumbnail...</p>}

        {/* Features */}
        <label>Features (shown on course card — 6 recommended)</label>
        {(course.features || []).map((f, i) => (
          <div className="list-input-row" key={i}>
            <input
              value={f}
              placeholder="e.g. Spring Boot"
              onChange={(e) => handleListFieldChange('features', i, e.target.value)}
            />
            <button type="button" onClick={() => handleRemoveListItem('features', i)}>✕</button>
          </div>
        ))}
        <button type="button" className="add-item-btn" onClick={() => handleAddListItem('features')}>
          + Add feature
        </button>

        {/* What You'll Learn */}
        <label>What You'll Learn</label>
        {(course.learnOutcomes || []).map((f, i) => (
          <div className="list-input-row" key={i}>
            <input
              value={f}
              placeholder="e.g. Build REST APIs with Spring Boot"
              onChange={(e) => handleListFieldChange('learnOutcomes', i, e.target.value)}
            />
            <button type="button" onClick={() => handleRemoveListItem('learnOutcomes', i)}>✕</button>
          </div>
        ))}
        <button type="button" className="add-item-btn" onClick={() => handleAddListItem('learnOutcomes')}>
          + Add learning outcome
        </button>

        {/* Requirements */}
        <label>Requirements</label>
        {(course.requirements || []).map((f, i) => (
          <div className="list-input-row" key={i}>
            <input
              value={f}
              placeholder="e.g. Basic programming knowledge"
              onChange={(e) => handleListFieldChange('requirements', i, e.target.value)}
            />
            <button type="button" onClick={() => handleRemoveListItem('requirements', i)}>✕</button>
          </div>
        ))}
        <button type="button" className="add-item-btn" onClick={() => handleAddListItem('requirements')}>
          + Add requirement
        </button>

        {error   && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <button type="submit" className="btn" id="btn-fill" disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Course Details'}
        </button>
      </form>

      {/* ══ CURRICULUM BUILDER ══ */}
      <div className="curriculum-builder">
        <div className="dashboard-header">
          <div>
            <h2>Curriculum</h2>
            <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
              {sections.length} section{sections.length !== 1 ? 's' : ''} ·{' '}
              {sections.reduce((sum, s) => sum + s.lessons.length, 0)} lessons
            </p>
          </div>
          <button className="btn" id="btn-out" onClick={() => setModal({ type: 'addSection' })}>
            + Add Section
          </button>
        </div>

        {sections.length === 0 ? (
          <div className="empty-state">
            <p>No sections yet</p>
            <p>Add your first section to start building the curriculum.</p>
            <button className="btn" id="btn-fill" onClick={() => setModal({ type: 'addSection' })}>
              + Add First Section
            </button>
          </div>
        ) : (
          sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div className="editor-section" key={section._id}>

                {/* Section header */}
                <div className="editor-section-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>📂</span>
                    <strong>{section.title}</strong>
                    <span style={{ fontSize: 12, color: '#aaa' }}>
                      {section.lessons.length} lesson{section.lessons.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="link-btn" onClick={() => setModal({ type: 'renameSection', section })}>
                      ✏️ Rename
                    </button>
                    <button className="link-btn danger" onClick={() => setModal({ type: 'deleteSection', section })}>
                      🗑 Delete
                    </button>
                  </div>
                </div>

                {/* Lessons list */}
                <ul className="editor-lesson-list">
                  {section.lessons
                    .sort((a, b) => a.order - b.order)
                    .map((lesson) => (
                      <li key={lesson._id}>
                        <div className="editor-lesson-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: '#888', fontSize: 13 }}>▶</span>
                            <span>{lesson.title}</span>
                            {lesson.isPreview && (
                              <span style={{
                                fontSize: 11, background: '#dcfce7', color: '#15803d',
                                padding: '1px 8px', borderRadius: 20, fontWeight: 700,
                              }}>
                                Free Preview
                              </span>
                            )}
                          </div>
                          <button
                            className="link-btn danger"
                            onClick={() => setModal({ type: 'deleteLesson', section, lesson })}
                          >
                            🗑 Delete
                          </button>
                        </div>

                        {/* Existing resources */}
                        {(lesson.resources || []).length > 0 && (
                          <div className="editor-lesson-resources">
                            {lesson.resources.map((r) => (
                              <a
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                key={r._id || r.url}
                              >
                                📄 {r.title}
                              </a>
                            ))}
                          </div>
                        )}

                        {/* PDF upload */}
                        <div className="editor-lesson-resources">
                          <label className="upload-resource-label">
                            + Attach PDF
                            <input
                              type="file"
                              accept="application/pdf"
                              style={{ display: 'none' }}
                              onChange={(e) =>
                                handleUploadResource(section, lesson, e.target.files[0])
                              }
                            />
                          </label>
                        </div>
                      </li>
                    ))}
                </ul>

                {/* Add lesson button */}
                <button
                  className="add-item-btn"
                  style={{ marginTop: 8 }}
                  onClick={() => setModal({ type: 'addLesson', section, step: 1 })}
                >
                  + Add Lesson
                </button>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default CourseEditor;