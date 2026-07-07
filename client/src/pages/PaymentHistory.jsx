import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import Navbar from '../components/Navbar.jsx';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/payments/history')
      .then(res => setPayments(res.data.payments))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1>Payment History</h1>
            <p>All your course purchases</p>
          </div>
          <Link to="/dashboard" className="player-back" style={{ color: '#0151e6' }}>← Dashboard</Link>
        </div>

        {loading ? (
          <p className="courses-sub">Loading...</p>
        ) : payments.length === 0 ? (
          <div className="empty-state">
            <p>No payments yet.</p>
            <Link to="/courses" className="btn" id="btn-fill">Browse Courses</Link>
          </div>
        ) : (
          <div className="admin-table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Course</th>
                  <th>Amount</th>
                  <th>Coupon</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p._id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#0151e6', fontWeight: 700 }}>
                        {p.invoiceNumber}
                      </span>
                    </td>
                    <td><strong>{p.course?.title}</strong></td>
                    <td>
                      <div>
                        <strong style={{ color: '#0f1a3d' }}>
                          ₹{(p.amount / 100).toLocaleString('en-IN')}
                        </strong>
                        {p.discountAmount > 0 && (
                          <span style={{ fontSize: 11, color: '#16a34a', marginLeft: 6 }}>
                            (saved ₹{(p.discountAmount / 100).toLocaleString('en-IN')})
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {p.couponCode
                        ? <span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{p.couponCode}</span>
                        : <span style={{ color: '#ccc' }}>—</span>
                      }
                    </td>
                    <td style={{ color: '#666', fontSize: 13 }}>
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="admin-actions">
                      <Link to={`/invoice/${p._id}`}>🧾 Invoice</Link>
                      <Link to={`/learn/${p.course?._id}`}>▶ Continue</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentHistory;