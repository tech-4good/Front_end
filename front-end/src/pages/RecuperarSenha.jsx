import React, { useState } from "react";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Input from "../components/Input";
import Botao from "../components/Botao";
import { authService } from "../services/authService";
import "../styles/RecuperarSenha.css";

const RecuperarSenha = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("inserir-email");
  const [email, setEmail] = useState("");
  const [modalErro, setModalErro] = useState({ open: false, mensagem: "" });
  const [modalTimeout, setModalTimeout] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const handleVoltarLogin = () => {
    navigate("/");
  };

  const handleRetornarLogin = () => {
    navigate("/");
  };

  const handleEnviarEmail = async () => {
    // Validação básica
    if (!email.trim()) {
      setModalErro({ open: true, mensagem: "Preencha o campo de e-mail." });
      if (modalTimeout) clearTimeout(modalTimeout);
      const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 8000);
      setModalTimeout(timeout);
      return;
    }

    // Validação de formato de e-mail
    const validacaoEmail = authService.validarEmail(email);
    if (!validacaoEmail.valido) {
      setModalErro({ open: true, mensagem: validacaoEmail.erro });
      if (modalTimeout) clearTimeout(modalTimeout);
      const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 8000);
      setModalTimeout(timeout);
      return;
    }

    setCarregando(true);

    try {
      const resultado = await authService.solicitarRecuperacaoSenha(email);
      
      if (resultado.sucesso) {
        setCurrentPage("feedback");
      } else {
        setModalErro({ 
          open: true, 
          mensagem: resultado.mensagem || "Erro ao enviar e-mail de recuperação." 
        });
        if (modalTimeout) clearTimeout(modalTimeout);
        const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 8000);
        setModalTimeout(timeout);
      }
    } catch (erro) {
      console.error("Erro ao solicitar recuperação:", erro);
      // Usar a mensagem de erro que vem da exceção
      const mensagemErro = erro.message || "Erro inesperado ao processar solicitação. Tente novamente.";
      setModalErro({ 
        open: true, 
        mensagem: mensagemErro
      });
      if (modalTimeout) clearTimeout(modalTimeout);
      const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 8000);
      setModalTimeout(timeout);
    } finally {
      setCarregando(false);
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