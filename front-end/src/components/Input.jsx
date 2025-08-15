import React, { useState } from "react";
import "../styles/Input.css";

import olhoAberto from "../assets/icone-olho-aberto.png";
import olhoFechado from "../assets/icone-olho-fechado.png";

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  iconImg,
  isPassword = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <div className="input-container">
        {iconImg && (
          <div className="input-icon">
            <img src={iconImg} alt="ícone" className="icon" style={{ width: 28, height: 28 }} />
          </div>
        )}
        {!iconImg && icon && (
          <div className="input-icon">
            <icon className="icon" />
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
            <img
              src={showPassword ? olhoFechado : olhoAberto}
              alt={showPassword ? "Ocultar senha" : "Mostrar senha"}
              style={{ width: 28, height: 28 }}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
