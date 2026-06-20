// Run with: npm run seed
// Populates the database with your original 6 courses and creates the
// first admin account from the ADMIN_* values in your .env file.
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

dotenv.config();

const courses = [
  {
    title: 'Java Full Stack Development',
    slug: 'java-full-stack-development',
    category: 'Development',
    icon: 'java',
    iconTheme: 'icon-blue',
    duration: '12 Weeks',
    features: ['Core Java', 'MySQL', 'Spring Boot', 'React JS', 'Hibernate', 'REST APIs'],
    rating: 4.8,
    reviewsCount: 320,
    studentsDisplay: '10,000+',
    description:
      'Become a job-ready full stack developer with Core Java, Spring Boot, Hibernate and React.',
  },
  {
    title: 'Python Development',
    slug: 'python-development',
    category: 'Development',
    icon: 'python',
    iconTheme: 'icon-green',
    duration: '10 Weeks',
    features: ['Python Basics', 'Database', 'Django Framework', 'Git & GitHub', 'REST APIs', 'Deployment'],
    rating: 4.7,
    reviewsCount: 280,
    studentsDisplay: '8,500+',
    description: 'Master Python and the Django framework, from fundamentals to deployment.',
  },
  {
    title: 'AI & Machine Learning',
    slug: 'ai-machine-learning',
    category: 'AI & Data',
    icon: 'ai',
    iconTheme: 'icon-purple',
    duration: '14 Weeks',
    features: ['Python', 'TensorFlow', 'Machine Learning', 'NLP', 'Deep Learning', 'Computer Vision'],
    rating: 4.9,
    reviewsCount: 410,
    studentsDisplay: '7,200+',
    description: 'Dive into machine learning, deep learning and NLP using Python and TensorFlow.',
  },
  {
    title: 'Cloud Computing',
    slug: 'cloud-computing',
    category: 'Cloud',
    icon: 'cloud',
    iconTheme: 'icon-sky',
    duration: '10 Weeks',
    features: ['AWS Basics', 'DevOps', 'Docker', 'CI/CD', 'Kubernetes', 'Cloud Security'],
    rating: 4.6,
    reviewsCount: 210,
    studentsDisplay: '6,800+',
    description: 'Learn AWS, DevOps practices, containerization and cloud security fundamentals.',
  },
  {
    title: 'UI/UX Design',
    slug: 'ui-ux-design',
    category: 'Design',
    icon: 'design',
    iconTheme: 'icon-pink',
    duration: '8 Weeks',
    features: ['Figma Basics', 'User Research', 'Wireframing', 'Design Systems', 'Prototyping', 'UI Design'],
    rating: 4.8,
    reviewsCount: 190,
    studentsDisplay: '5,500+',
    description: 'Go from wireframes to polished interfaces using Figma and design systems.',
  },
  {
    title: 'Data Science',
    slug: 'data-science',
    category: 'AI & Data',
    icon: 'data',
    iconTheme: 'icon-teal',
    duration: '12 Weeks',
    features: ['Python', 'Data Visualization', 'Pandas & NumPy', 'Machine Learning', 'SQL', 'Power BI'],
    rating: 4.7,
    reviewsCount: 350,
    studentsDisplay: '9,100+',
    description: 'Learn the full data science toolkit: Python, SQL, Pandas, ML and Power BI.',
  },
];

const run = async () => {
  await connectDB();

  // Courses - upsert by slug so re-running the seed is safe
  for (const courseData of courses) {
    await Course.findOneAndUpdate({ slug: courseData.slug }, courseData, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
  console.log(`Seeded ${courses.length} courses.`);

  // Admin account
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@skillforge.com').toLowerCase();
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    console.log(`Admin account already exists: ${adminEmail}`);
  } else {
    await User.create({
      name: process.env.ADMIN_NAME || 'Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'ChangeThisPassword123',
      role: 'admin',
    });
    console.log(`Admin account created: ${adminEmail}`);
    console.log('Log in with the password set in ADMIN_PASSWORD in your .env file.');
  }

  console.log('Seeding complete.');
  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
