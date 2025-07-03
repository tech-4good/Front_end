import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary", 
  fullWidth = true 
}) => {
  return (
    <button 
      type={type}
      onClick={onClick}
      className={`btn btn-${variant} ${fullWidth ? 'btn-full-width' : ''}`}
    >
      {children}
    </button>
  );
};

export default Button;