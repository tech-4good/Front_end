import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Input from "../components/Input";
import Botao from "../components/Botao";
import "../styles/RecuperarSenha.css";

const RecuperarSenha = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("inserir-email");
  const [email, setEmail] = useState("");

  const handleVoltarLogin = () => {
    navigate("/");
  };

  const handleRetornarLogin = () => {
    navigate("/");
  };

  const handleEnviarEmail = () => {
    if (email.trim()) {
      setCurrentPage("feedback"); // colocar a logica para a validação e envio do email depois
    }
  };

  if (currentPage === "feedback") {
    return (
      <div className="recuperar-container">
        <div className="recuperar-card-feedback">
          <div className="feedback-content">
            <div className="feedback-message">
              <p>Você irá receber um e-mail com instruções para redefinir a sua senha!</p>
            </div>
            <div className="botao-container">
              <Botao texto="Retornar para tela de login" onClick={handleRetornarLogin} />  {/* colocar fora depois */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recuperar-container">
      <div className="voltar-section">
        <button onClick={handleVoltarLogin} className="voltar-button">
          <ArrowLeft className="voltar-icon" />
          <span>Voltar</span>
        </button>
      </div>

      <div className="recuperar-card">
        <div className="recuperar-content">
          <h2 className="recuperar-title">INSIRA O<br />SEU E-MAIL</h2>
          
          <div className="form-section">
            <Input
              label="E-mail:"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // arrumar futuramente
              placeholder="email@dominio.com"
            />
            <div className="botao-container">
              <Botao texto="Enviar" onClick={handleEnviarEmail} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecuperarSenha;