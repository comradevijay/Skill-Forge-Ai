import React from 'react';

const About = () => {
  return (
    <section id="about">
      <div className="about-left">
        <div className="left-card" id="card-mission">
          <div className="float-icon icon-mission">
            <svg viewBox="0 0 512 512">
              <path d="M448 256a192 192 0 1 0 -384 0 192 192 0 1 0 384 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zm256 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm0-224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zM224 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
            </svg>
          </div>
          <div className="float-text">
            <strong className="float-title">Our Mission</strong>
            <p>Empower learners with the right skills to succeed in a digital world.</p>
          </div>
        </div>

        <div className="left-card" id="card-qe">
          <div className="float-icon icon-qe">
            <svg viewBox="0 0 576 512">
              <path d="M321.8 54.1L298.2 6.3c-3.9-8.3-16.1-8.6-20.4 0l-23.6 47.8-52.3 7.5c-9.3 1.4-13.3 12.9-6.4 19.8l38 37-9 52.1c-1.4 9.3 8.2 16.5 16.8 12.2l46.9-24.8 46.6 24.4c8.6 4.3 18.3-2.9 16.8-12.2l-9-52.1 38-36.6c6.8-6.8 2.9-18.3-6.4-19.8l-52.3-7.5zM256 256c-26.5 0-48 21.5-48 48l0 160c0 26.5 21.5 48 48 48l64 0c26.5 0 48-21.5 48-48l0-160c0-26.5-21.5-48-48-48l-64 0zM48 320c-26.5 0-48 21.5-48 48l0 96c0 26.5 21.5 48 48 48l64 0c26.5 0 48-21.5 48-48l0-96c0-26.5-21.5-48-48-48l-64 0zM416 432l0 32c0 26.5 21.5 48 48 48l64 0c26.5 0 48-21.5 48-48l0-32c0-26.5-21.5-48-48-48l-64 0c-26.5 0-48 21.5-48 48z" />
            </svg>
          </div>
          <div className="float-text">
            <strong className="float-title">Quality Education</strong>
            <p>Industry-relevant courses designed by experts.</p>
          </div>
        </div>

        <div className="left-card" id="card-community">
          <div className="float-icon icon-community">
            <svg viewBox="0 0 640 512">
              <path d="M320 16a104 104 0 1 1 0 208 104 104 0 1 1 0-208zM96 88a72 72 0 1 1 0 144 72 72 0 1 1 0-144zM0 416c0-70.7 57.3-128 128-128 12.8 0 25.2 1.9 36.9 5.4-32.9 36.8-52.9 85.4-52.9 138.6l0 16c0 11.4 2.4 22.2 6.7 32L32 480c-17.7 0-32-14.3-32-32l0-32zm521.3 64c4.3-9.8 6.7-20.6 6.7-32l0-16c0-53.2-20-101.8-52.9-138.6 11.7-3.5 24.1-5.4 36.9-5.4 70.7 0 128 57.3 128 128l0 32c0 17.7-14.3 32-32 32l-86.7 0zM472 160a72 72 0 1 1 144 0 72 72 0 1 1 -144 0zM160 432c0-88.4 71.6-160 160-160s160 71.6 160 160l0 16c0 17.7-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32l0-16z" />
            </svg>
          </div>
          <div className="float-text">
            <strong className="float-title">Community</strong>
            <p>Industry-relevant courses designed by experts.</p>
          </div>
        </div>

        <div className="left-card" id="card-vision">
          <div className="float-icon icon-vision">
            <svg viewBox="0 0 640 512">
              <path d="M320 16a104 104 0 1 1 0 208 104 104 0 1 1 0-208zM96 88a72 72 0 1 1 0 144 72 72 0 1 1 0-144zM0 416c0-70.7 57.3-128 128-128 12.8 0 25.2 1.9 36.9 5.4-32.9 36.8-52.9 85.4-52.9 138.6l0 16c0 11.4 2.4 22.2 6.7 32L32 480c-17.7 0-32-14.3-32-32l0-32zm521.3 64c4.3-9.8 6.7-20.6 6.7-32l0-16c0-53.2-20-101.8-52.9-138.6 11.7-3.5 24.1-5.4 36.9-5.4 70.7 0 128 57.3 128 128l0 32c0 17.7-14.3 32-32 32l-86.7 0zM472 160a72 72 0 1 1 144 0 72 72 0 1 1 -144 0zM160 432c0-88.4 71.6-160 160-160s160 71.6 160 160l0 16c0 17.7-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32l0-16z" />
            </svg>
          </div>
          <div className="float-text">
            <strong className="float-title">Vision</strong>
            <p>To become the world's most trusted platform for skill development and lifelong learning.</p>
          </div>
        </div>
      </div>

      <div className="about-right">
        <div id="about-p">
          <p>About Us</p>
          <div style={{ display: 'flex' }}>
            <div className="float-underline" style={{ background: '#0151e6' }}></div>
            <div className="float-underline" style={{ background: '#dde5f4' }}></div>
          </div>
        </div>

        <div className="about-text">
          <h1 className="hero-h" id="about-h">Build Skills Today</h1>
          <span className="hero-h" id="about-h">For A <span id="special">Better Tomorrow</span></span>

          <div className="about-p">
            <p>At SkillForge, we believe that skills are the key to unlocking</p>
            <p>opportunities. Our mission is to provide high-quality,</p>
            <p>industry-relevant courses that empower learners to</p>
            <p>achieve their goals and build successful careers.</p>
          </div>
        </div>

        <div className="left-card" id="card-demand">
          <div className="float-icon icon-demand">
            <svg viewBox="0 0 640 640">
              <path d="M96 128C96 92.7 124.7 64 160 64L448 64C483.3 64 512 92.7 512 128L512 176L448 176L448 128L160 128L160 320L272 320L272 416L108.8 416C66.4 416 32 381.6 32 339.2C32 328.6 40.6 320 51.2 320L96 320L96 128zM561.9 321.9C570.9 330.9 576 343.1 576 355.8L576 528C576 554.5 554.5 576 528 576L368 576C341.5 576 320 554.5 320 528L320 272C320 245.5 341.5 224 368 224L444.1 224C456.8 224 469 229.1 478 238.1C498 258.1 525.9 286 561.9 322zM448 336C448 344.8 455.2 352 464 352L524.1 352L448 275.9L448 336z" />
            </svg>
          </div>
          <div className="float-text">
            <strong className="float-title">Learn In-Demand Skills</strong>
            <p className="card-p">Access expert-designed courses in programming, tech, AI, cloud and more.</p>
          </div>
        </div>

        <div className="left-card" id="card-learning">
          <div className="float-icon icon-learning">
            <svg viewBox="0 0 512 512">
              <path d="M128 320L24.5 320c-24.9 0-40.2-27.1-27.4-48.5L50 183.3C58.7 168.8 74.3 160 91.2 160l95 0c76.1-128.9 189.6-135.4 265.5-124.3 12.8 1.9 22.8 11.9 24.6 24.6 11.1 75.9 4.6 189.4-124.3 265.5l0 95c0 16.9-8.8 32.5-23.3 41.2l-88.2 52.9c-21.3 12.8-48.5-2.6-48.5-27.4L192 384c0-35.3-28.7-64-64-64l-.1 0zM400 160a48 48 0 1 0 -96 0 48 48 0 1 0 96 0z" />
            </svg>
          </div>
          <div className="float-text">
            <strong className="float-title">Hands-On Learning</strong>
            <p className="card-p">Work on real-world projects and build a strong portfolio that stands out.</p>
          </div>
        </div>

        <div className="left-card" id="card-achive">
          <div className="float-icon icon-achive">
            <svg viewBox="0 0 640 640">
              <path d="M96 128C96 92.7 124.7 64 160 64L448 64C483.3 64 512 92.7 512 128L512 176L448 176L448 128L160 128L160 320L272 320L272 416L108.8 416C66.4 416 32 381.6 32 339.2C32 328.6 40.6 320 51.2 320L96 320L96 128zM561.9 321.9C570.9 330.9 576 343.1 576 355.8L576 528C576 554.5 554.5 576 528 576L368 576C341.5 576 320 554.5 320 528L320 272C320 245.5 341.5 224 368 224L444.1 224C456.8 224 469 229.1 478 238.1C498 258.1 525.9 286 561.9 322zM448 336C448 344.8 455.2 352 464 352L524.1 352L448 275.9L448 336z" />
            </svg>
          </div>
          <div className="float-text">
            <strong className="float-title">Achieve Your Goals</strong>
            <p className="card-p">Earn certificates, boost your resume and advance your career.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
