import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const courseId = params.get('course');
  const [count, setCount] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setCount(c => {
      if (c <= 1) { clearInterval(t); navigate(`/learn/${courseId}`); return 0; }
      return c - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [courseId, navigate]);

  return (
    <>
      <Navbar />
      <div className="success-page">
        <div className="success-card">
          <div className="success-icon">🎉</div>
          <h1>Payment Successful!</h1>
          <p>You're now enrolled. Redirecting to your course in <strong>{count}s</strong>...</p>
          <div className="success-actions">
            <Link to={`/learn/${courseId}`} className="btn" id="btn-fill">Start Learning Now</Link>
            <Link to="/dashboard" className="btn" id="btn-out">My Dashboard</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;