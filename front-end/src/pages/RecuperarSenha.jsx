import React, { useState } from "react";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Input from "../components/Input";
import Botao from "../components/Botao";
import "../styles/RecuperarSenha.css";

const RecuperarSenha = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("inserir-email");
  const [email, setEmail] = useState("");
  const [modalErro, setModalErro] = useState({ open: false, mensagem: "" });
  const [modalTimeout, setModalTimeout] = useState(null);

  const handleVoltarLogin = () => {
    navigate("/");
  };

  const handleRetornarLogin = () => {
    navigate("/");
  };

  const handleEnviarEmail = () => {
    const emailCadastrado = "teste@teste.com";
    if (!email.trim()) {
      setModalErro({ open: true, mensagem: "Preencha o campo de e-mail." });
      if (modalTimeout) clearTimeout(modalTimeout);
      const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 8000);
      setModalTimeout(timeout);
      return;
    }
    if (email !== emailCadastrado) {
      setModalErro({ open: true, mensagem: "E-mail não cadastrado." });
      if (modalTimeout) clearTimeout(modalTimeout);
      const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 8000);
      setModalTimeout(timeout);
      return;
    }
    setCurrentPage("feedback");
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
      {/* Modal de erro */}
      <div style={{ position: "fixed", top: 24, right: 24, zIndex: 2000 }}>
        <Modal
          isOpen={modalErro.open}
          onClose={() => setModalErro({ open: false, mensagem: "" })}
          texto={modalErro.mensagem}
          showClose={true}
        />
      </div>
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
              onChange={(e) => setEmail(e.target.value)}
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