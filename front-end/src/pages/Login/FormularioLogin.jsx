import React, { useState } from "react";
import { Eye, EyeOff, User, Lock, Monitor } from "lucide-react";
import "./FormularioLogin.css";

const FormularioLogin = ({ onNavigateToCadastro, onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("alinef@hotmail.com");
  const [password, setPassword] = useState("****************");

  const handleNavigateToCadastro = () => {
    onNavigateToCadastro();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <div className="logo-icon">
            <Monitor className="monitor-icon" />
          </div>
          <h1 className="logo-title">TECH 4 GOOD</h1>
          <p className="logo-subtitle">QUALIDADE & CONFIANÇA</p>
        </div>

        <h2 className="login-title">LOGIN</h2>

        <div className="input-group">
          <label className="input-label">E-mail:</label>
          <div className="input-container">
            <div className="input-icon">
              <User className="icon" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="alinef@hotmail.com"
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Senha:</label>
          <div className="input-container">
            <div className="input-icon">
              <Lock className="icon" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field password-field"
              placeholder="****************"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? (
                <EyeOff className="icon" />
              ) : (
                <Eye className="icon" />
              )}
            </button>
          </div>
        </div>

        <div className="forgot-password">
          <a href="#" className="forgot-link">
            ESQUECI MINHA SENHA
          </a>
        </div>

        <button className="login-button" onClick={handleLogin}>
          Entrar
        </button>

        <div className="signup-section">
          <span className="signup-text">AINDA NÃO TEM CONTA? </span>
          <a
            href="#"
            className="signup-link"
            onClick={(e) => {
              e.preventDefault();
              handleNavigateToCadastro();
            }}
          >
            CLIQUE AQUI!
          </a>
        </div>
      </div>
    </div>
  );
};

export default FormularioLogin;
