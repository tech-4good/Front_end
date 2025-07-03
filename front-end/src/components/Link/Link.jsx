import React from 'react';
import './Link.css';

const Link = ({ 
  href, 
  children, 
  variant = "default", 
  onClick 
}) => {
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <a 
      href={href || "#"} 
      className={`link link-${variant}`}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

export default Link;