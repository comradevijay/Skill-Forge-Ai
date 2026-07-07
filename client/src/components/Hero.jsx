import React from 'react';

const Hero = () => {
  return (
    <section id="hero">
      <div className="hero-text-box">
        <div className="empower">
          <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M128 320L24.5 320c-24.9 0-40.2-27.1-27.4-48.5L50 183.3C58.7 168.8 74.3 160 91.2 160l95 0c76.1-128.9 189.6-135.4 265.5-124.3 12.8 1.9 22.8 11.9 24.6 24.6 11.1 75.9 4.6 189.4-124.3 265.5l0 95c0 16.9-8.8 32.5-23.3 41.2l-88.2 52.9c-21.3 12.8-48.5-2.6-48.5-27.4L192 384c0-35.3-28.7-64-64-64l-.1 0zM400 160a48 48 0 1 0 -96 0 48 48 0 1 0 96 0z" />
          </svg>
          <span id="icon">Empower Your Future</span>
        </div>

        <div className="hero-h">Master <span id="special"> Tech Skills,</span></div>
        <span className="hero-h">At Your Convenience</span>
        <div className="hero-p">
          <p>Learn programming, Web Development, Cloud computing, AI</p>
          <p>and more through industry-focused courses designed for</p>
          <p>real-world success.</p>
        </div>
        <div id="btn">
          <a href="/#courses" className="btn" id="btn-fill">
            Get Started
            <svg className="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
            </svg>
          </a>
          <a href="/#courses" className="btn" id="btn-out">
            Explore Courses
            <svg className="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
            </svg>
          </a>
        </div>

        <div className="sucess">
          <div id="num">
            <span id="caps">
              <svg id="cap" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                <path d="M622.34 153.2L343.4 67.5c-15.2-4.67-31.6-4.67-46.79 0L17.66 153.2c-23.54 7.23-23.54 38.36 0 45.59l48.63 14.94c-10.67 13.19-17.23 29.28-17.88 46.9C38.78 266.15 32 276.11 32 288c0 10.78 5.68 19.85 13.86 25.65L20.33 428.53C18.11 438.52 25.71 448 35.94 448h56.11c10.24 0 17.84-9.48 15.62-19.47L82.14 313.65C90.32 307.85 96 298.78 96 288c0-11.57-6.47-21.25-15.66-26.87.76-15.02 8.44-28.3 20.69-36.72L296.6 284.5c9.06 2.78 26.44 6.25 46.79 0l278.95-85.7c23.55-7.24 23.55-38.36 0-45.6zM352.79 315.09c-28.53 8.76-52.84 3.92-65.59 0l-145.02-44.55L128 384c0 35.35 85.96 64 192 64s192-28.65 192-64l-14.18-113.47-145.03 44.56z" />
              </svg>
              <span className="stat-text">
                <strong className="stat-number">10,000+</strong>
                <span className="stat-label">Students</span>
              </span>
            </span>

            <span>
              <svg id="partners" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                <path d="M268.9 85.2L152.3 214.8c-4.6 5.1-4.4 13 .5 17.9 30.5 30.5 80 30.5 110.5 0l31.8-31.8c4.2-4.2 9.5-6.5 14.9-6.9 6.8-.6 13.8 1.7 19 6.9L505.6 376 576 320 576 32 464 96 440.2 80.1C424.4 69.6 405.9 64 386.9 64l-70.4 0c-1.1 0-2.3 0-3.4 .1-16.9 .9-32.8 8.5-44.2 21.1zM116.6 182.7L223.4 64 183.8 64c-25.5 0-49.9 10.1-67.9 28.1L112 96 0 32 0 320 156.4 450.3c23 19.2 52 29.7 81.9 29.7l15.7 0-7-7c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l41 41 9 0c19.1 0 37.8-4.3 54.8-12.3L359 441c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l32 32 17.5-17.5c8.9-8.9 11.5-21.8 7.6-33.1l-137.9-136.8-14.9 14.9c-49.3 49.3-129.1 49.3-178.4 0-23-23-23.9-59.9-2.2-84z" />
              </svg>
              <span className="stat-text">
                <strong className="stat-number">250+</strong>
                <span className="stat-label">Hiring Partners</span>
              </span>
            </span>

            <span>
              <svg id="star" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                <path d="M309.5 1.1c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 145.3 33.2 170.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 437.6 432.4 511c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 325.9 556.1 211.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 145.3 309.5 1.1z" />
              </svg>
              <span className="stat-text">
                <strong className="stat-number">4.9/5</strong>
                <span className="stat-label">Rating</span>
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="hero-right">
        <div className="float-card" id="card-video">
          <div className="float-icon icon-blue">
            <svg viewBox="0 0 384 512">
              <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
            </svg>
          </div>
          <div className="float-text">
            <strong className="float-title">Interactive</strong>
            <strong className="float-title">Video Lessons</strong>
            <div style={{ display: 'flex' }}>
              <div className="float-underline" style={{ background: '#0151e6' }}></div>
              <div className="float-underline" style={{ background: '#dde5f4' }}></div>
            </div>
          </div>
        </div>

        <div className="float-card" id="card-code">
          <div className="code-block">
            <div className="code-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green-dot"></span>
            </div>
            <pre><code><span className="c-keyword">function</span> <span className="c-fn-name">learn</span><span className="c-punc">()</span> <span className="c-brace">{'{'}</span>{'\n'}{'  '}<span className="c-fn-call">improve</span><span className="c-punc">()</span><span className="c-semi">;</span>{'\n'}{'  '}<span className="c-fn-call">succeed</span><span className="c-punc">()</span><span className="c-semi">;</span>{'\n'}<span className="c-brace">{'}'}</span></code></pre>
          </div>
        </div>

        <div className="float-card" id="card-hands">
          <div className="float-icon icon-green">
            <svg viewBox="0 0 640 512">
              <path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z" />
            </svg>
          </div>
          <div className="float-text">
            <strong className="float-title">Hands-on</strong>
            <strong className="float-title">Projects</strong>
            <div style={{ display: 'flex' }}>
              <div className="float-underline" style={{ background: '#22c55e' }}></div>
              <div className="float-underline" style={{ background: '#e0f8e9' }}></div>
            </div>
          </div>
        </div>

        <div className="float-card" id="card-cert">
          <div className="float-icon icon-purple">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M144.3 0l224 0c26.5 0 48.1 21.8 47.1 48.2-.2 5.3-.4 10.6-.7 15.8l49.6 0c26.1 0 49.1 21.6 47.1 49.8-7.5 103.7-60.5 160.7-118 190.5-15.8 8.2-31.9 14.3-47.2 18.8-20.2 28.6-41.2 43.7-57.9 51.8l0 73.1 64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-192 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0 0-73.1c-16-7.7-35.9-22-55.3-48.3-18.4-4.8-38.4-12.1-57.9-23.1-54.1-30.3-102.9-87.4-109.9-189.9-1.9-28.1 21-49.7 47.1-49.7l49.6 0c-.3-5.2-.5-10.4-.7-15.8-1-26.5 20.6-48.2 47.1-48.2zM101.5 112l-52.4 0c6.2 84.7 45.1 127.1 85.2 149.6-14.4-37.3-26.3-86-32.8-149.6zM380 256.8c40.5-23.8 77.1-66.1 83.3-144.8L411 112c-6.2 60.9-17.4 108.2-31 144.8z" />
            </svg>
          </div>
          <div className="float-text">
            <strong className="float-title">Earn</strong>
            <strong className="float-title">Certificates</strong>
            <div style={{ display: 'flex' }}>
              <div className="float-underline" style={{ background: '#9333ea' }}></div>
              <div className="float-underline" style={{ background: '#e8d8f7' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;