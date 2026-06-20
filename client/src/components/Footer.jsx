import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">
            <svg viewBox="0 0 512 512" className="logo-icon">
              <path d="M256 32L0 160l256 128 256-128L256 32zM48 224v96c0 8.8 7.2 16 16 16h32V224H48zm400 0v160c0 17.7-14.3 32-32 32H160c-17.7 0-32-14.3-32-32V224h-32v128c0 35.3 28.7 64 64 64h192c35.3 0 64-28.7 64-64V224h-32z" />
            </svg>
            <span className="logo-text">Skill<span className="logo-accent">Forge</span></span>
          </div>
          <p className="logo-sub">ONLINE LEARNING PLATFORM</p>
          <p className="footer-desc">
            Empowering learners with industry-relevant skills through expert-led courses and
            real-world projects.
          </p>

          <div className="social-icons">
            <a href="#" className="social-icon" aria-label="Facebook">
              <svg viewBox="0 0 320 512">
                <path d="M279.14 288l14.22-92.66h-88.91v-59.81c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="Twitter">
              <svg viewBox="0 0 512 512">
                <path d="M459.4 151.7c.3 4.5.3 9.1.3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 16.3 2.4 31 2.4 47.8-1.9-48.1-9.7-84.1-51.9-84.1-102.9v-1.3c14 7.8 30.3 12.6 47.4 13.3-28.3-18.9-46.8-51.1-46.8-87.6 0-19.6 5.2-37.5 14.3-53.1 51.4 63.4 128.4 104.9 215.4 109.1-12.9-62.4 33.6-113 89.6-113 26.4 0 50.1 11.1 66.8 28.9 20.7-3.9 40.1-11.4 57.6-21.7-6.8 21.1-21.1 38.9-39.8 50.1 18.3-1.9 35.8-6.8 52-13.9-12.1 18.3-27.7 34.2-45.4 47.1z" />
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="LinkedIn">
              <svg viewBox="0 0 448 512">
                <path d="M100.28 448H7.4V148.9h92.88zm-46.44-340a53.49 53.49 0 1 1 0-106.97 53.49 53.49 0 0 1 0 106.97zM447.9 448h-92.68V302.4c0-34.7-12.4-58.4-43.4-58.4-23.7 0-37.8 16-44 31.4-2.3 5.5-2.9 13.2-2.9 21v151.6h-92.7s1.3-245.8 0-271.1h92.7v38.4c-.2.3-.5.7-.7 1h.7v-1c12.3-19 34.4-46.1 83.7-46.1 61.1 0 106.9 39.9 106.9 125.6V448z" />
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="YouTube">
              <svg viewBox="0 0 576 512">
                <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6C16 167 16 256 16 256s0 89 10.3 131.9c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-12.3c23.5-6.3 42-24.2 48.3-47.8C560 345 560 256 560 256s0-89-10.3-131.9zM232 338V174l142 82-142 82z" />
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="Instagram">
              <svg viewBox="0 0 448 512">
                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/#hero">Home</a></li>
            <li><a href="/#about">About Us</a></li>
            <li><a href="/#courses">Courses</a></li>
            <li><a href="/#companies">Hiring Partners</a></li>
            <li><a href="/#contact">Contact Us</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Courses</h4>
          <ul>
            <li><a href="/#courses">Web Development</a></li>
            <li><a href="/#courses">Data Science</a></li>
            <li><a href="/#courses">Cloud Computing</a></li>
            <li><a href="/#courses">Artificial Intelligence</a></li>
            <li><a href="/#courses">UI/UX Design</a></li>
            <li><a href="/#courses">View All Courses</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Learning Paths</a></li>
            <li><a href="#">Certificates</a></li>
            <li><a href="#">Career Guide</a></li>
            <li><a href="#">FAQ's</a></li>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Community</a></li>
          </ul>
        </div>

        <div className="footer-col contact-col">
          <h4>Contact Info</h4>
          <ul className="contact-list">
            <li>
              <svg viewBox="0 0 384 512" className="contact-icon">
                <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 256a64 64 0 1 1 0-128 64 64 0 1 1 0 128z" />
              </svg>
              <span>123, Tech Park, Sector 62, Noida, Uttar Pradesh - 201309</span>
            </li>
            <li>
              <svg viewBox="0 0 512 512" className="contact-icon">
                <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
              </svg>
              <span>support@skillforge.com</span>
            </li>
            <li>
              <svg viewBox="0 0 512 512" className="contact-icon">
                <path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-88-37.5c-16.3-7.4-35.5-2.1-46.4 12.7l-26.1 35.7c-39.6-18.3-72.3-51-90.6-90.6l35.7-26.1c14.7-10.8 20-29.9 12.7-46.4L164.9 24.6z" />
              </svg>
              <span>+91 98765 43210</span>
            </li>
            <li>
              <svg viewBox="0 0 512 512" className="contact-icon">
                <path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />
              </svg>
              <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">© <span id="year">{year}</span> SkillForge. All rights reserved.</p>
        <div className="footer-legal">
          <a href="#">Privacy Policy</a>
          <span className="divider">|</span>
          <a href="#">Terms &amp; Conditions</a>
          <span className="divider">|</span>
          <a href="#">Refund Policy</a>
        </div>
        <p className="made-with">Made with <span className="heart">💙</span> for learners around the world.</p>
      </div>
    </footer>
  );
};

export default Footer;
