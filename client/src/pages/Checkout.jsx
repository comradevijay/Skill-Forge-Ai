import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import Navbar from '../components/Navbar.jsx';

const Checkout = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [coupon, setCoupon]           = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [paying, setPaying]           = useState(false);

  useEffect(() => {
    api.get(`/courses/${courseId}`)
      .then(res => setCourse(res.data.course))
      .catch(() => setError('Course not found.'))
      .finally(() => setLoading(false));
  }, [courseId]);

  // load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true); setCouponError(''); setCouponResult(null);
    try {
      const res = await api.post('/payments/validate-coupon', { couponCode: coupon, courseId });
      setCouponResult(res.data);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePay = async () => {
    setPaying(true); setError('');
    try {
      const orderRes = await api.post('/payments/order', {
        courseId,
        couponCode: couponResult ? coupon : undefined,
      });

      // Free course — redirect directly
      if (orderRes.data.free) {
        navigate(`/learn/${courseId}`);
        return;
      }

      const { orderId, amount, keyId, courseName, userName, userEmail } = orderRes.data;

      const options = {
        key:         keyId,
        amount,
        currency:    'INR',
        name:        'SkillForge',
        description: courseName,
        order_id:    orderId,
        prefill:     { name: userName, email: userEmail },
        theme:       { color: '#0151e6' },
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              courseId,
            });
            navigate(`/payment-success?course=${courseId}`);
          } catch {
            setError('Payment verification failed. Please contact support.');
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setError('Payment failed. Please try again.');
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not initiate payment.';
      const isJsError = !err.response && msg.includes('Cannot read');
      setError(isJsError ? 'Payment could not be initiated. Please try again.' : msg);
      setPaying(false);
    }
  };

  if (loading) return <><Navbar /><div className="page-loading">Loading...</div></>;
  if (!course)  return <><Navbar /><div className="page-loading">{error}</div></>;

  const displayPrice  = couponResult ? couponResult.finalPrice  : course.price;
  const originalPrice = couponResult ? couponResult.originalPrice : course.price;
  const discount      = couponResult ? couponResult.discountAmount : 0;

  return (
    <>
      <Navbar />
      <div className="checkout-page">
        <div className="checkout-container">

          {/* Left — Order summary */}
          <div className="checkout-card">
            <h2 className="checkout-title">Order Summary</h2>

            <div className="checkout-course-row">
              {course.thumbnail && (
                <img src={course.thumbnail} alt={course.title} className="checkout-thumb" />
              )}
              <div>
                <p className="checkout-course-title">{course.title}</p>
                <p className="checkout-course-cat">{course.category}</p>
              </div>
            </div>

            <div className="checkout-divider" />

            <div className="checkout-price-rows">
              <div className="checkout-price-row">
                <span>Original Price</span>
                <span>₹{originalPrice.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="checkout-price-row green">
                  <span>Discount ({couponResult.coupon.code})</span>
                  <span>− ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="checkout-divider" />
              <div className="checkout-price-row total">
                <span>Total</span>
                <span>₹{displayPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Right — Coupon + Pay */}
          <div className="checkout-card">
            <h2 className="checkout-title">Payment</h2>

            {/* Coupon */}
            <label className="checkout-label">Have a coupon?</label>
            <div className="checkout-coupon-row">
              <input
                className="checkout-input"
                placeholder="Enter coupon code"
                value={coupon}
                onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponResult(null); setCouponError(''); }}
              />
              <button
                className="checkout-coupon-btn"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !coupon.trim()}
              >
                {couponLoading ? '...' : 'Apply'}
              </button>
            </div>
            {couponError  && <p className="checkout-coupon-error">{couponError}</p>}
            {couponResult && (
              <p className="checkout-coupon-success">
                ✓ {couponResult.coupon.code} applied — you save ₹{couponResult.discountAmount.toLocaleString('en-IN')}
              </p>
            )}

            <div className="checkout-divider" style={{ margin: '20px 0' }} />

            <div className="checkout-total-big">
              <span>Amount to pay</span>
              <strong>₹{displayPrice.toLocaleString('en-IN')}</strong>
            </div>

            {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

            <button
              className="checkout-pay-btn"
              onClick={handlePay}
              disabled={paying}
            >
              {paying ? 'Opening Payment...' : `Pay ₹${displayPrice.toLocaleString('en-IN')} with Razorpay`}
            </button>

            <p className="checkout-secure">🔒 100% secure payment via Razorpay</p>

            <Link to={`/courses/${courseId}`} className="checkout-back">← Back to course</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;