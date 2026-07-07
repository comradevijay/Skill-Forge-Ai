import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import Navbar from '../components/Navbar.jsx';

const Invoice = () => {
  const { paymentId } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/payments/invoice/' + paymentId)
      .then(res => setPayment(res.data.payment))
      .catch(() => setError('Invoice not found.'))
      .finally(() => setLoading(false));
  }, [paymentId]);

  const handlePrint = () => window.print();

  if (loading) return React.createElement(React.Fragment, null, React.createElement(Navbar, null), React.createElement('div', { className: 'page-loading' }, 'Loading...'));
  if (error) return React.createElement(React.Fragment, null, React.createElement(Navbar, null), React.createElement('div', { className: 'page-loading' }, error));

  const finalAmount = payment.amount / 100;
  const discountAmount = payment.discountAmount / 100;
  const originalAmount = finalAmount + discountAmount;
  const date = new Date(payment.createdAt);
  const inr = (n) => 'Rs. ' + n.toLocaleString('en-IN');
  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div>
      <Navbar />
      <div className="invoice-page">
        <div className="invoice-controls">
          <Link to="/payment-history" className="player-back" style={{ color: '#0151e6' }}>Back to Payment History</Link>
          <button className="btn" id="btn-fill" onClick={handlePrint}>Print / Save PDF</button>
        </div>
        <div className="invoice-doc">
          <div className="invoice-header">
            <div>
              <h1 className="invoice-brand">SkillForge</h1>
              <p className="invoice-brand-sub">Online Learning Platform</p>
            </div>
            <div className="invoice-meta">
              <p><strong>INVOICE</strong></p>
              <p className="invoice-num">{payment.invoiceNumber}</p>
              <p className="invoice-date">{dateStr}</p>
            </div>
          </div>
          <div className="invoice-divider" />
          <div className="invoice-parties">
            <div>
              <p className="invoice-section-label">BILL TO</p>
              <p className="invoice-party-name">{payment.user.name}</p>
              <p className="invoice-party-detail">{payment.user.email}</p>
            </div>
            <div>
              <p className="invoice-section-label">FROM</p>
              <p className="invoice-party-name">SkillForge Education Pvt. Ltd.</p>
              <p className="invoice-party-detail">support@skillforge.in</p>
            </div>
          </div>
          <div className="invoice-divider" />
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>{payment.course.title}</strong><br /><span style={{ fontSize: 12, color: '#888' }}>Lifetime Course Access</span></td>
                <td>{payment.course.category}</td>
                <td style={{ textAlign: 'right' }}>{inr(originalAmount)}</td>
              </tr>
              {discountAmount > 0 && (
                <tr>
                  <td colSpan="2" style={{ color: '#16a34a' }}>Coupon Discount ({payment.couponCode})</td>
                  <td style={{ textAlign: 'right', color: '#16a34a' }}>- {inr(discountAmount)}</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="invoice-divider" />
          <div className="invoice-total-row">
            <span>Total Paid</span>
            <strong className="invoice-total-amount">{inr(finalAmount)}</strong>
          </div>
          <div className="invoice-payment-info">
            <div><span>Payment ID</span><strong>{payment.razorpayPaymentId}</strong></div>
            <div><span>Order ID</span><strong>{payment.razorpayOrderId}</strong></div>
            <div><span>Status</span><span className="status-pill published">Paid</span></div>
          </div>
          <div className="invoice-footer">
            <p>Thank you for learning with SkillForge!</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;