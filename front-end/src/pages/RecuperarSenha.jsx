import React, { useState } from "react";
import { ArrowLeft, User } from "lucide-react";
import Botao from "../components/Botao";
import "../styles/RecuperarSenha.css";

const RecuperarSenha = ({ onNavigateToLogin, onNavigateToFeedback }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (email.trim()) {
      onNavigateToFeedback();
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="header-section">
          <button onClick={onNavigateToLogin} className="back-button">
            <ArrowLeft className="back-icon" />
            <span>Voltar</span>
          </button>
        </div>

        <div className="content-section">
          <h2 className="page-title">INSIRA O SEU E-MAIL</h2>
          
          <div>
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
                  placeholder="email@dominio.com"
                />
              </div>
            </div>

            <Botao onClick={handleSubmit}>
              Enviar
            </Botao>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecuperarSenha;