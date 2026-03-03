import React from 'react';
import { Scale, Home, FileText, Gavel, Library } from 'lucide-react';
import '../navbar.css';

export const Navbar = () => {
  return (
    <>
      {/* Navbar — pixel-perfect match to landing/index.html */}
      <nav className="cc-navbar">
        <a href="http://localhost:8080" className="cc-logo">
          <Scale size={22} strokeWidth={2} color="white" />
          ClauseCheck
        </a>

        <div className="cc-nav-links">
          <a href="http://localhost:8080" className="cc-nav-item">
            <Home size={16} /> Home
          </a>
          <a href="http://localhost:5175" className="cc-nav-item">
            <FileText size={16} /> AI Analysis
          </a>
          <a href="http://localhost:5174" className="cc-nav-item">
            <Gavel size={16} /> Courtroom
          </a>
          <a href="http://localhost:3000" className="cc-nav-item active">
            <Library size={16} /> Case Files
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
