import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "student",
    bio: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const user = await register(
        form.name,
        form.email,
        form.password,
        form.role,
        form.bio,
      );
      navigate(user.role === "instructor" ? "/instructor" : "/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          Skill<span className="logo-accent">Forge</span>
        </Link>
        <h2>Create your account</h2>
        <p className="auth-sub">Start learning in-demand skills today.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Jane Doe"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label htmlFor="confirm">Confirm Password</label>
          <input
            id="confirm"
            type="password"
            name="confirm"
            placeholder="Re-enter your password"
            value={form.confirm}
            onChange={handleChange}
            required
          />

          <label htmlFor="role">I want to join as</label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="student">Student — I want to learn</option>
            <option value="instructor">Instructor — I want to teach</option>
          </select>

          {form.role === "instructor" && (
            <>
              <label htmlFor="bio">
                Short Bio (tell us about your teaching experience)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows="3"
                placeholder="e.g. 5 years building backend systems, taught at..."
                value={form.bio}
                onChange={handleChange}
              />
              <p className="auth-hint">
                Instructor accounts need admin approval before you can publish
                courses. You can browse and set up your profile right away —
                publishing unlocks once approved.
              </p>
            </>
          )}

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn"
            id="btn-fill"
            disabled={submitting}
          >
            {submitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
