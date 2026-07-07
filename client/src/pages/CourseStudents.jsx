import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';

const CourseStudents = () => {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/instructor/courses/${courseId}/students`)
      .then((res) => setStudents(res.data.students))
      .catch((err) => setError(err.response?.data?.message || 'Could not load students.'))
      .finally(() => setLoading(false));
  }, [courseId]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Enrolled Students</h1>
        <Link to="/instructor" className="player-back">← Back to dashboard</Link>
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading ? (
        <p className="courses-sub">Loading...</p>
      ) : students.length === 0 ? (
        <div className="empty-state"><p>No students enrolled yet.</p></div>
      ) : (
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Enrolled</th><th>Progress</th></tr></thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.enrollmentId}>
                <td>{s.user.name}</td>
                <td>{s.user.email}</td>
                <td>{new Date(s.enrolledAt).toLocaleDateString()}</td>
                <td>{s.progressPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CourseStudents;
