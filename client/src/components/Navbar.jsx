import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';


const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    navigate('/');
  };

  return (
    <header id="header">
      <nav className={`custom-nav ${menuOpen ? 'nav-open' : ''}`}>
        <div className="nav-left">
          <Link to="/">
            <img className="logo" src="/img/logo.png" alt="Logo" />
          </Link>
          <ul className="nav-ul">
            <li><a href="/">Home</a></li>
            <li><a href="/#about">About</a></li>
            <li><Link to="/courses">Courses</Link></li>
            <li><a href="/#companies">Hiring Partners</a></li>
            <li><a href="/#contact">Contact</a></li>
          </ul>
        </div>
        <div className="nav-right-controls">
          {!user && (
            <Link id="login" to="/login">Login</Link>
          )}

          {user && (
            <div className="account-menu">
              <button
                type="button"
                className="account-btn"
                onClick={() => setAccountOpen((o) => !o)}
              >
                Hi, {user.name.split(' ')[0]} ▾
              </button>
              {accountOpen && (
                <div className="account-dropdown">
                  {user.role === 'student' && (
                    <>
                      <Link to="/dashboard" onClick={() => setAccountOpen(false)}>Dashboard</Link>
                      <Link to="/mock-interview" onClick={() => setAccountOpen(false)}>🎤 Mock Interview</Link>
                      <Link to="/payment-history" onClick={() => setAccountOpen(false)}>💳 Payment History</Link>
                    </>
                  )}
                  {user.role === 'instructor' && (
                    <Link to="/instructor" onClick={() => setAccountOpen(false)}>
                      Instructor Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setAccountOpen(false)}>
                      Admin Panel
                    </Link>
                  )}
                  <button type="button" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          )}

          <button
            className="nav-toggle"
            id="navToggle"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;