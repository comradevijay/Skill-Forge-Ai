import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const Dashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEnrollments = () => {
    setLoading(true);
    api
      .get("/enrollments/me")
      .then((res) => setEnrollments(res.data.enrollments))
      .catch(() => setError("Could not load your courses."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const handleCancel = async (enrollmentId) => {
    if (!window.confirm("Cancel this enrollment?")) return;
    try {
      await api.delete(`/enrollments/${enrollmentId}`);
      setEnrollments((prev) => prev.filter((e) => e._id !== enrollmentId));
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel enrollment.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h2>
            Welcome back, <b>{user?.name?.split(" ")[0]}</b>
          </h2>
          {/* <p>{user?.email}</p> */}
          <Link
            to="/mock-interview"
            className="btn"
            id="btn-fill"
            style={{ marginTop: "12px", display: "inline-block" }}
          >
            🎯 Start AI Mock Interview
          </Link>

          <Link
          to="/dsa-sheet"
          className="btn"
          id="btn-fill"
          style={{ marginTop: "12px", display: "inline-block" }}
        >
          <h3>🧩 Problem Solving</h3>
        </Link>

        </div>
        
        <h2 className="dashboard-section-title">Your Enrolled Courses</h2>

        {error && <p className="form-error">{error}</p>}

        {loading ? (
          <p>Loading your courses...</p>
        ) : enrollments.length === 0 ? (
          <div className="empty-state">
            <p>You haven't enrolled in any courses yet.</p>
            <Link to="/#courses" className="btn" id="btn-fill">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="dashboard-grid">
            {enrollments.map((enrollment) => (
              <div className="dashboard-card" key={enrollment._id}>
                <h3>{enrollment.course?.title}</h3>
                <p className="dashboard-card-meta">
                  {enrollment.course?.category} · {enrollment.course?.duration}
                </p>
                <p className="dashboard-card-date">
                  Enrolled on{" "}
                  {new Date(enrollment.createdAt).toLocaleDateString()}
                </p>
                <div className="dashboard-card-actions">
                  <Link
                    to={`/learn/${enrollment.course?._id}`}
                    className="btn"
                    id="btn-fill"
                  >
                    Continue Learning
                  </Link>
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancel(enrollment._id)}
                  >
                    Cancel Enrollment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
