import React from 'react';
import { CourseIcon, CheckIcon, ClockIcon, StudentsIcon } from './CourseIcons.jsx';

const CourseCard = ({ course, isEnrolled, isEnrolling, onEnroll }) => {
  const fullStars = Math.round(course.rating);

  return (
    <div className="course-card">
      <div className={`card-icon ${course.iconTheme || 'icon-blue'}`}>
        <CourseIcon icon={course.icon} />
      </div>
      <h3 className="card-title">{course.title}</h3>
      <div className="card-features">
        {course.features.map((feature) => (
          <div className="feature-item" key={feature}>
            <CheckIcon />
            {feature}
          </div>
        ))}
      </div>
      <div className="card-meta">
        <div className="meta-item"><ClockIcon />{course.duration}</div>
        <div className="meta-item"><StudentsIcon />{course.studentsDisplay} Students</div>
      </div>
      <div className="card-footer">
        <div>
          <span className="stars">{'★'.repeat(fullStars)}{'☆'.repeat(5 - fullStars)}</span>
          <span className="rating-text">{course.rating} ({course.reviewsCount} Reviews)</span>
        </div>
        <button
          className="enroll-btn"
          disabled={isEnrolled || isEnrolling}
          onClick={() => onEnroll(course)}
        >
          {isEnrolled ? 'Enrolled ✓' : isEnrolling ? 'Enrolling...' : 'Enroll Now'}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
