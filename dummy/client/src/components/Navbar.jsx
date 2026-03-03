import React from 'react';
import { Home, FileText, Gavel, Library, Scale } from 'lucide-react';

export const Navbar = () => {
  return (
    <>
      {/* Fixed Navbar matching landing page style */}
      <nav style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(3, 7, 18, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '1.5rem',
          background: 'linear-gradient(to right, #fff, #94a3b8)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Scale style={{ color: '#7c3aed', width: '1.4rem', height: '1.4rem', WebkitTextFillColor: 'initial' }} />
          ClauseCheck
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', gap: '2rem' }}>
          {[
            { href: 'http://localhost:8080', label: 'Home', Icon: Home },
            { href: 'http://localhost:5175', label: 'AI Analysis', Icon: FileText },
            { href: 'http://localhost:5174', label: 'Courtroom', Icon: Gavel },
            { href: 'http://localhost:3000', label: 'Case Files', Icon: Library, active: true },
          ].map(({ href, label, Icon, active }) => (
            <a
              key={href}
              href={href}
              style={{
                color: active ? 'white' : '#94a3b8',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                background: active ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
                border: active ? '1px solid rgba(124, 58, 237, 0.25)' : '1px solid transparent',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={16} />
              {label}
            </a>
          ))}
        </div>

        {/* AI Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.8rem',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '2rem',
          fontSize: '0.8rem',
          color: '#22c55e',
          fontWeight: 600,
        }}>
          <div style={{
            width: 8,
            height: 8,
            background: '#22c55e',
            borderRadius: '50%',
            animation: 'blink 1.5s infinite',
          }} />
          AI Engine Active
        </div>
      </nav>

      {/* Spacer so content doesn't go under fixed navbar */}
      <div style={{ height: '4.5rem' }} />

      <style>{`
        @keyframes blink {
          0%   { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          70%  { opacity: 0.7; box-shadow: 0 0 0 6px rgba(34,197,94,0); }
          100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>
    </>
  );
};
