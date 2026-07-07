import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import CourseDetails from './pages/CourseDetails.jsx';
import LessonPlayer from './pages/LessonPlayer.jsx';
import InstructorDashboard from './pages/InstructorDashboard.jsx';
import CourseEditor from './pages/CourseEditor.jsx';
import CourseStudents from './pages/CourseStudents.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import InstructorRoute from './components/InstructorRoute.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import Checkout from './pages/Checkout.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import PaymentHistory from './pages/PaymentHistory.jsx';
import Invoice from './pages/Invoice.jsx';
import MockInterview from './pages/MockInterview.jsx';
import DSASheet from './pages/DSASheet.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/courses/:id" element={<CourseDetails />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/learn/:courseId"
        element={
          <ProtectedRoute>
            <LessonPlayer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/instructor"
        element={
          <InstructorRoute>
            <InstructorDashboard />
          </InstructorRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId"
        element={
          <InstructorRoute>
            <CourseEditor />
          </InstructorRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/students"
        element={
          <InstructorRoute>
            <CourseStudents />
          </InstructorRoute>
        }
      />

      <Route path="/courses" element={<CoursesPage />} />

      <Route path="/checkout/:courseId" element={
        <ProtectedRoute><Checkout /></ProtectedRoute>
      } />
      <Route path="/payment-success" element={
        <ProtectedRoute><PaymentSuccess /></ProtectedRoute>
      } />
      <Route path="/payment-history" element={
        <ProtectedRoute><PaymentHistory /></ProtectedRoute>
      } />
      <Route path="/invoice/:paymentId" element={
        <ProtectedRoute><Invoice /></ProtectedRoute>
      } />
      <Route path="/mock-interview" element={
        <ProtectedRoute><MockInterview /></ProtectedRoute>
      } />
      <Route path="/dsa-sheet" element={
        <ProtectedRoute><DSASheet /></ProtectedRoute>
      } />
    </Routes>
      
  );
};

export default App;