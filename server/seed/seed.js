// Run with: npm run seed
// Populates the database with your original 6 courses and creates the
// first admin account from the ADMIN_* values in your .env file. Also
// creates a demo approved instructor who owns all 6 courses, and seeds a
// small sample curriculum (sections/lessons) on the first course so the
// course details + lesson player pages have real data to show.
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Course from '../models/Course.js';
import Section from '../models/Section.js';
import Lesson from '../models/Lesson.js';
import User from '../models/User.js';

dotenv.config();

// Shared highlights and FAQs used across all courses (customise per course later from the instructor dashboard)
const sharedHighlights = [
  { icon: 'video', label: 'Structured Course', desc: 'Expert-designed curriculum meeting real industry needs' },
  { icon: 'mentor', label: 'Mentor Support', desc: 'Personal 1-on-1 mentors via chat, calls & screen sharing' },
  { icon: 'certificate', label: 'Certificate', desc: 'Industry-recognised certificate with a unique ID' },
  { icon: 'project', label: 'Projects', desc: 'Build real-world projects to strengthen your resume' },
  { icon: 'job', label: 'Job Assistance', desc: 'Resume review, mock interviews & placement guidance' },
  { icon: 'lifetime', label: 'Lifetime Access', desc: 'Watch any lesson anytime, forever — even after completing' },
];

const sharedFaqs = [
  {
    question: 'Is this course suitable for beginners?',
    answer: 'Absolutely. The course starts from the very basics and progressively covers advanced topics, so no prior experience is needed.',
  },
  {
    question: 'How long will I have access to the course?',
    answer: 'You get lifetime access to all course content. Once enrolled, you can watch lessons anytime, at your own pace.',
  },
  {
    question: 'Will I get a certificate after completing the course?',
    answer: 'Yes. On completing all lessons and assignments you receive an industry-recognised certificate with a unique ID that you can share on LinkedIn or add to your resume.',
  },
  {
    question: 'Do I get doubt-solving support?',
    answer: 'Yes. You can raise doubts through the in-app messaging system and our mentors will respond, typically within a few hours.',
  },
  {
    question: 'What if I am not satisfied with the course?',
    answer: 'We stand by the quality of our content. If you face any issue, reach out to our support team and we will work to resolve it promptly.',
  },
];

const courses = [
  {
    title: 'Java Full Stack Development',
    slug: 'java-full-stack-development',
    category: 'Development',
    icon: 'java',
    iconTheme: 'icon-blue',
    duration: '12 Weeks',
    price: 2999,
    originalPrice: 5999,
    features: ['Core Java', 'MySQL', 'Spring Boot', 'React JS', 'Hibernate', 'REST APIs'],
    rating: 4.8,
    reviewsCount: 320,
    studentsDisplay: '10,000+',
    description: 'Become a job-ready full stack developer with Core Java, Spring Boot, Hibernate and React. This course takes you from zero to building production-grade web applications with a Java backend and a React frontend.',
    requirements: ['Basic programming knowledge helps but is not required', 'A computer with at least 4GB RAM', 'Willingness to practice daily'],
    learnOutcomes: [
      'Build REST APIs with Spring Boot', 'Work confidently with Core Java and OOP',
      'Connect a React frontend to a Java backend', 'Use Hibernate/JPA for database access',
      'Deploy a full stack application', 'Write unit tests with JUnit',
    ],
    highlights: sharedHighlights,
    faqs: sharedFaqs,
    reviews: [
      { name: 'Arjun S.', rating: 5, text: 'Best Java Full Stack course I have taken. The Spring Boot + React combination is exactly what companies are hiring for. Landed a job within 2 months!' },
      { name: 'Priya M.', rating: 5, text: 'Very well structured. The projects made my resume stand out and I got multiple interview calls.' },
      { name: 'Karthik R.', rating: 4, text: 'Great content and clear explanations. The mentor support was super helpful whenever I got stuck.' },
    ],
  },
  {
    title: 'Python Development',
    slug: 'python-development',
    category: 'Development',
    icon: 'python',
    iconTheme: 'icon-green',
    duration: '10 Weeks',
    price: 2499,
    originalPrice: 4999,
    features: ['Python Basics', 'Database', 'Django Framework', 'Git & GitHub', 'REST APIs', 'Deployment'],
    rating: 4.7,
    reviewsCount: 280,
    studentsDisplay: '8,500+',
    description: 'Master Python and the Django framework, from core fundamentals to deploying production-ready web applications. Python is the most versatile language in tech — used in web, AI, data and automation.',
    requirements: ['No prior coding experience needed', 'A computer (Windows/Mac/Linux)'],
    learnOutcomes: [
      'Write clean, idiomatic Python', 'Build and deploy a Django web app',
      'Work with Git and GitHub', 'Design and consume REST APIs',
      'Use Python for automation and scripting', 'Connect apps to SQL databases',
    ],
    highlights: sharedHighlights,
    faqs: sharedFaqs,
    reviews: [
      { name: 'Sneha K.', rating: 5, text: 'I had zero coding experience and now I have deployed my own Django app. The course is incredibly beginner-friendly.' },
      { name: 'Rohit P.', rating: 5, text: 'Covers everything from basics to deployment. The hands-on projects are the best part.' },
      { name: 'Ananya T.', rating: 4, text: 'Clear, concise and practical. Exactly what I needed to switch into tech.' },
    ],
  },
  {
    title: 'AI & Machine Learning',
    slug: 'ai-machine-learning',
    category: 'AI & Data',
    icon: 'ai',
    iconTheme: 'icon-purple',
    duration: '14 Weeks',
    price: 3499,
    originalPrice: 6999,
    features: ['Python', 'TensorFlow', 'Machine Learning', 'NLP', 'Deep Learning', 'Computer Vision'],
    rating: 4.9,
    reviewsCount: 410,
    studentsDisplay: '7,200+',
    description: 'Dive deep into machine learning, deep learning and NLP using Python and TensorFlow. Build real AI models — from regression and classification to neural networks and computer vision pipelines.',
    requirements: ['Comfortable with Python basics', 'High-school level math (algebra, basic stats)'],
    learnOutcomes: [
      'Train and evaluate ML models', 'Build neural networks with TensorFlow',
      'Understand NLP and sentiment analysis', 'Work with Computer Vision using OpenCV',
      'Deploy ML models as APIs', 'Use Pandas and NumPy for data prep',
    ],
    highlights: sharedHighlights,
    faqs: sharedFaqs,
    reviews: [
      { name: 'Vikram N.', rating: 5, text: 'The best AI/ML course for Indian learners. Practical, project-based, and the instructor explains complex concepts very simply.' },
      { name: 'Divya L.', rating: 5, text: 'Completed my first ML project and it is now live. The curriculum is updated with the latest tools.' },
      { name: 'Suresh M.', rating: 5, text: 'Worth every rupee. Got placed in an AI startup after finishing this course.' },
    ],
  },
  {
    title: 'Cloud Computing',
    slug: 'cloud-computing',
    category: 'Cloud',
    icon: 'cloud',
    iconTheme: 'icon-sky',
    duration: '10 Weeks',
    price: 2999,
    originalPrice: 5999,
    features: ['AWS Basics', 'DevOps', 'Docker', 'CI/CD', 'Kubernetes', 'Cloud Security'],
    rating: 4.6,
    reviewsCount: 210,
    studentsDisplay: '6,800+',
    description: 'Learn AWS, DevOps practices, containerisation and cloud security fundamentals. Cloud skills are among the highest-paying in tech — this course gets you industry-ready with hands-on AWS labs.',
    requirements: ['Basic command-line familiarity', 'A free-tier AWS account (we will help you set one up)'],
    learnOutcomes: [
      'Deploy applications on AWS EC2 and S3', 'Containerise apps with Docker',
      'Set up CI/CD pipelines with GitHub Actions', 'Orchestrate containers with Kubernetes',
      'Apply cloud security best practices', 'Use IAM, VPC and Load Balancers',
    ],
    highlights: sharedHighlights,
    faqs: sharedFaqs,
    reviews: [
      { name: 'Rahul G.', rating: 5, text: 'Went from zero cloud knowledge to AWS certified in 10 weeks. The labs are excellent.' },
      { name: 'Meera J.', rating: 4, text: 'Very practical course. The Docker and Kubernetes sections alone are worth the price.' },
      { name: 'Aditya V.', rating: 5, text: 'Got a DevOps role after completing this. The CI/CD project I built was what impressed the interviewer.' },
    ],
  },
  {
    title: 'UI/UX Design',
    slug: 'ui-ux-design',
    category: 'Design',
    icon: 'design',
    iconTheme: 'icon-pink',
    duration: '8 Weeks',
    price: 1999,
    originalPrice: 3999,
    features: ['Figma Basics', 'User Research', 'Wireframing', 'Design Systems', 'Prototyping', 'UI Design'],
    rating: 4.8,
    reviewsCount: 190,
    studentsDisplay: '5,500+',
    description: 'Go from wireframes to polished, pixel-perfect interfaces using Figma and design systems. Learn the full UX process — research, wireframing, prototyping — and build a portfolio that gets you hired.',
    requirements: ['No design experience required', 'Figma free account'],
    learnOutcomes: [
      'Conduct basic user research and create personas', 'Wireframe and prototype in Figma',
      'Build a reusable design system', 'Design polished, accessible UIs',
      'Present designs with professional mockups', 'Build a portfolio of 3 real-world projects',
    ],
    highlights: sharedHighlights,
    faqs: sharedFaqs,
    reviews: [
      { name: 'Nisha R.', rating: 5, text: 'I switched careers from HR to UI/UX design after this course. The portfolio projects were exactly what companies were looking for.' },
      { name: 'Raj K.', rating: 5, text: 'Brilliant course. The design system module alone changed how I think about building interfaces.' },
      { name: 'Pooja S.', rating: 4, text: 'Very well structured and the Figma practice files are super helpful for hands-on learning.' },
    ],
  },
  {
    title: 'Data Science',
    slug: 'data-science',
    category: 'AI & Data',
    icon: 'data',
    iconTheme: 'icon-teal',
    duration: '12 Weeks',
    price: 2999,
    originalPrice: 5999,
    features: ['Python', 'Data Visualization', 'Pandas & NumPy', 'Machine Learning', 'SQL', 'Power BI'],
    rating: 4.7,
    reviewsCount: 350,
    studentsDisplay: '9,100+',
    description: 'Learn the complete data science toolkit — Python, SQL, Pandas, visualisation, ML, and Power BI. Work on real datasets and build dashboards and models that tell compelling data stories.',
    requirements: ['Basic Python helps but is not mandatory', 'Curiosity about data!'],
    learnOutcomes: [
      'Clean and analyse data with Pandas and NumPy', 'Write SQL queries confidently',
      'Build and evaluate ML models', 'Create interactive dashboards in Power BI',
      'Visualise data with Matplotlib and Seaborn', 'Work with real-world datasets end to end',
    ],
    highlights: sharedHighlights,
    faqs: sharedFaqs,
    reviews: [
      { name: 'Akash B.', rating: 5, text: 'The most comprehensive data science course I have seen. The SQL + Pandas combination is exactly what companies test in interviews.' },
      { name: 'Kavya N.', rating: 5, text: 'Got my first data analyst job 6 weeks after finishing. The Power BI projects were a big differentiator in interviews.' },
      { name: 'Harish T.', rating: 4, text: 'Really well explained and project-based. The mentor sessions helped me clear all my doubts quickly.' },
    ],
  },
];

// A couple of well-known, freely embeddable YouTube IDs used as placeholder
// lesson videos so the curriculum/player isn't empty. Swap these for your
// own content from the Instructor Dashboard once you're logged in.
const SAMPLE_VIDEO_IDS = ['rfscVS0vtbw', '8mAITcNt710', 'eIrMbAQSU34'];

const run = async () => {
  await connectDB();

  // Demo instructor - approved, owns all seeded courses
  const instructorEmail = 'instructor@skillforge.com';
  let instructor = await User.findOne({ email: instructorEmail });
  if (!instructor) {
    instructor = await User.create({
      name: 'Demo Instructor',
      email: instructorEmail,
      password: 'Instructor123',
      role: 'instructor',
      instructorStatus: 'approved',
      bio: 'Seed-generated demo instructor account that owns the starter courses.',
    });
    console.log(`Demo instructor created: ${instructorEmail} / Instructor123`);
  } else {
    console.log(`Demo instructor already exists: ${instructorEmail}`);
  }

  // Courses - upsert by slug so re-running the seed is safe
  const savedCourses = [];
  for (const courseData of courses) {
    const course = await Course.findOneAndUpdate(
      { slug: courseData.slug },
      { ...courseData, instructor: instructor._id, status: 'published' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    savedCourses.push(course);
  }
  console.log(`Seeded ${savedCourses.length} courses (published, owned by demo instructor).`);

  // Sample curriculum on the first course only, so there's something to click through
  const firstCourse = savedCourses[0];
  const existingSections = await Section.countDocuments({ course: firstCourse._id });
  if (existingSections === 0) {
    const section1 = await Section.create({ course: firstCourse._id, title: 'Getting Started', order: 0 });
    const section2 = await Section.create({ course: firstCourse._id, title: 'Core Concepts', order: 1 });

    await Lesson.create([
      {
        course: firstCourse._id,
        section: section1._id,
        title: 'Welcome to the Course',
        youtubeId: SAMPLE_VIDEO_IDS[0],
        durationSeconds: 600,
        order: 0,
        isPreview: true,
      },
      {
        course: firstCourse._id,
        section: section1._id,
        title: 'Setting Up Your Environment',
        youtubeId: SAMPLE_VIDEO_IDS[1],
        durationSeconds: 720,
        order: 1,
        isPreview: false,
      },
      {
        course: firstCourse._id,
        section: section2._id,
        title: 'Your First Project',
        youtubeId: SAMPLE_VIDEO_IDS[2],
        durationSeconds: 900,
        order: 0,
        isPreview: false,
      },
    ]);
    console.log(`Seeded sample curriculum on "${firstCourse.title}" (replace these placeholder videos from the Instructor Dashboard).`);
  } else {
    console.log('Sample curriculum already exists, skipping.');
  }

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
