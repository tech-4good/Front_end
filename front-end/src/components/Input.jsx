import React, { useState } from "react";
import "../styles/Input.css";
import { Eye, EyeOff } from "lucide-react";

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  isPassword = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <div className="input-container">
        {Icon && (
          <div className="input-icon">
            <Icon className="icon" />
          </div>
        )}
        <input
          type={isPassword && showPassword ? "text" : type}
          value={value}
          onChange={onChange}
          className={`input-personalizado${
            isPassword ? " password-field" : ""
          }`}
          placeholder={placeholder}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={handleTogglePassword}
            className="password-toggle"
            tabIndex={-1}
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

export default Input;
