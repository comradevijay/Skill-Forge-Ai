import React from 'react';
import { Link } from 'react-router-dom';
import { CourseIcon } from './CourseIcons.jsx';

const StarIcon = () => (
  <svg viewBox="0 0 576 512" style={{ width: 14, height: 14, fill: '#f59e0b', display: 'inline' }}>
    <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329l-24.6 145.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329l104.2-103.1c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
  </svg>
);

const ClockSvg = () => (
  <svg viewBox="0 0 512 512" style={{ width: 13, height: 13, fill: '#888' }}>
    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 120l48 0 0 136 104 0 0 48-152 0 0-184z" />
  </svg>
);

const PeopleSvg = () => (
  <svg viewBox="0 0 640 512" style={{ width: 13, height: 13, fill: '#888' }}>
    <path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z" />
  </svg>
);

const CheckCircle = () => (
  <svg viewBox="0 0 512 512" style={{ width: 14, height: 14, fill: '#0151e6', flexShrink: 0 }}>
    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
  </svg>
);

const CourseCard = ({ course, isEnrolled, isEnrolling, onEnroll }) => {
  const fullStars = Math.round(course.rating);
  // split features into 2 columns
  const half = Math.ceil((course.features || []).length / 2);
  const col1 = course.features.slice(0, half);
  const col2 = course.features.slice(half);

  // Button label logic
  const isPaid = course.price && course.price > 0;
  const btnLabel = isEnrolled
    ? 'Enrolled ✓'
    : isEnrolling
    ? '...'
    : isPaid
    ? 'Buy Now'
    : 'Enroll Now';

  return (
    <div className="cc-card">
      {/* Top: icon + title */}
      <div className="cc-top">
        <div className={`cc-icon-box ${course.iconTheme || 'icon-blue'}`}>
          <CourseIcon icon={course.icon} />
        </div>
        <Link to={`/courses/${course._id}`} className="cc-title-link">
          <h3 className="cc-title">{course.title}</h3>
        </Link>
      </div>

      {/* Features: 2 columns */}
      <div className="cc-features-grid">
        <div className="cc-features-col">
          {col1.map((f) => (
            <div className="cc-feature-item" key={f}>
              <CheckCircle /><span>{f}</span>
            </div>
          ))}
        </div>
        <div className="cc-features-col">
          {col2.map((f) => (
            <div className="cc-feature-item" key={f}>
              <CheckCircle /><span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Meta: duration + students */}
      <div className="cc-meta">
        <span className="cc-meta-item"><ClockSvg /> {course.duration}</span>
        <span className="cc-meta-item"><PeopleSvg /> {course.studentsDisplay} Students</span>
      </div>

      {/* Footer: stars + price + enroll */}
      <div className="cc-footer">
        <div className="cc-footer-left">
          <div className="cc-rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} />
            ))}
            <span className="cc-rating-text">{course.rating} ({course.reviewsCount} Reviews)</span>
          </div>
          <div className="cc-price">
            {isPaid
              ? <span className="cc-price-amount">₹{course.price.toLocaleString('en-IN')}</span>
              : <span className="cc-price-free">Free</span>
            }
          </div>
        </div>
        <button
          className="cc-enroll-btn"
          disabled={isEnrolled || isEnrolling}
          onClick={() => onEnroll(course)}
        >
          {btnLabel}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;