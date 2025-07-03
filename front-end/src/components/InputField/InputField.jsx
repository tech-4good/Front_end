import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './InputField.css';

const InputField = ({ 
  label, 
  type, 
  value, 
  onChange, 
  placeholder, 
  icon: Icon,
  showPassword,
  onTogglePassword,
  isPassword = false
}) => {
  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <div className="input-container">
        <div className="input-icon">
          <Icon className="icon" />
        </div>
        <input
          type={isPassword && showPassword ? "text" : type}
          value={value}
          onChange={onChange}
          className={`input-field ${isPassword ? 'password-field' : ''}`}
          placeholder={placeholder}
        />
        {isPassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="password-toggle"
          >
            {showPassword ? (
              <EyeOff className="icon" />
            ) : (
              <Eye className="icon" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;