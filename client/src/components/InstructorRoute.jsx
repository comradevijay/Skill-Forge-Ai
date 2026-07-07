import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const InstructorRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loading">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'instructor' && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default InstructorRoute;
