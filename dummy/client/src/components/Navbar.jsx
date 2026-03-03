import React from 'react';
import '../navbar.css';

export const Navbar = () => {
  return (
    <>
      {/* Navbar — exact same structure & classes as landing/index.html */}
      <nav className="cc-navbar">
        <a href="http://localhost:8080" className="cc-logo">
          <i className="bx bxs-layer" />
          ClauseCheck
        </a>

        <div className="cc-nav-links">
          <a href="http://localhost:8080" className="cc-nav-item">
            <i className="bx bx-home" />
            Home
          </a>
          <a href="http://localhost:5175" className="cc-nav-item">
            <i className="bx bxs-analyse" />
            AI Analysis
          </a>
          <a href="http://localhost:5174" className="cc-nav-item">
            <i className="bx bx-gavel" />
            Courtroom
          </a>
          <a href="http://localhost:3000" className="cc-nav-item active">
            <i className="bx bx-library" />
            Case Files
          </a>
        </div>

        <div className="cc-ai-badge">
          <div className="cc-ai-dot" />
          AI Engine Active
        </div>
      </nav>

      {/* Spacer below fixed navbar */}
      <div className="cc-navbar-spacer" />
    </>
  );
};
