
import React from 'react';
import { Monitor } from 'lucide-react';
import './Logo.css';

const Logo = () => {
  return (
    <div className="logo-section">
      <div className="logo-icon">
        <Monitor className="monitor-icon" />
      </div>
      <h1 className="logo-title">TECH 4 GOOD</h1>
      <p className="logo-subtitle">QUALIDADE & CONFIANÇA</p>
    </div>
  );
};

export default Logo;