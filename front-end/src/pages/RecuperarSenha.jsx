import React, { useState } from "react";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Botao from "../components/Botao";
import { authService } from "../services/authService";
import iconeVoltar from "../assets/icone-voltar.png";
import "../styles/RecuperarSenha.css";

const RecuperarSenha = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("inserir-email");
  const [email, setEmail] = useState("");
  const [modalErro, setModalErro] = useState({ open: false, mensagem: "" });
  const [modalTimeout, setModalTimeout] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const mostrarModal = (mensagem) => {
    setModalErro({ open: true, mensagem });
    if (modalTimeout) clearTimeout(modalTimeout);
    const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 3000);
    setModalTimeout(timeout);
  };

  const handleVoltarLogin = () => {
    navigate("/");
  };

  const handleRetornarLogin = () => {
    navigate("/");
  };

  const handleEnviarEmail = async () => {
    // Validação básica
    if (!email.trim()) {
      mostrarModal("Preencha o campo de e-mail.");
      return;
    }

    // Validação de formato de e-mail
    const validacaoEmail = authService.validarEmail(email);
    if (!validacaoEmail.valido) {
      mostrarModal(validacaoEmail.erro);
      return;
    }

    setCarregando(true);

    try {
      const resultado = await authService.solicitarRecuperacaoSenha(email);
      
      if (resultado.sucesso) {
        setCurrentPage("feedback");
      } else {
        mostrarModal(resultado.mensagem || "Erro ao enviar e-mail de recuperação.");
      }
    } catch (erro) {
      console.error("Erro ao solicitar recuperação:", erro);
      // Usar a mensagem de erro que vem da exceção
      const mensagemErro = erro.message || "Erro inesperado ao processar solicitação. Tente novamente.";
      mostrarModal(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  if (currentPage === "feedback") {
    return (
      <div className="recuperar-container">
        <div className="recuperar-card">
          <div className="recuperar-content">
            <div className="feedback-message">
              <p>Você irá receber um e-mail com instruções para redefinir a sua senha!</p>
            </div>
            <div className="botao-container">
              <Botao texto="Retornar para tela de login" onClick={handleRetornarLogin} />
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
          showClose={false}
        />
      </div>
      <div className="voltar-section">
        <button onClick={handleVoltarLogin} className="voltar-button">
          <img src={iconeVoltar} alt="Voltar" className="voltar-icon" />
        </button>
      </div>

      <div className="recuperar-card">
        <div className="recuperar-content">
          <h2 className="recuperar-title">Insira o seu E-mail</h2>
          <div className="form-section">
            <Input
              label="E-mail:"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@dominio.com"
            />
            <div className="botao-container">
              <Botao 
                texto={carregando ? "Enviando..." : "Enviar"} 
                onClick={handleEnviarEmail}
                disabled={carregando}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecuperarSenha;