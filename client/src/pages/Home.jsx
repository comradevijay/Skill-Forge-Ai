import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Courses from '../components/Courses.jsx';
import Partners from '../components/Partners.jsx';
import Contact from '../components/Contact.jsx';
import Footer from '../components/Footer.jsx';

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Courses />
      <Partners />
      <Contact />
      <Footer />
    </>
  );
};

export default Home;
