import React, { useState } from "react";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Botao from "../components/Botao";
import "../styles/RedefinirSenha.css";

const RedefinirSenha = () => {
  const navigate = useNavigate();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [modalErro, setModalErro] = useState({ open: false, mensagem: "" });
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalTimeout, setModalTimeout] = useState(null);

  const validarSenha = (senha) => {
    if (senha.length < 5 || senha.length > 12) {
      return "A senha deve ter entre 5 e 12 caracteres.";
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha)) {
      return "A senha deve conter pelo menos 1 caractere especial.";
    }
    return null;
  };

  const handleRedefinirClick = () => {
    if (!novaSenha.trim() || !confirmarSenha.trim()) {
      setModalErro({ open: true, mensagem: "Preencha todos os campos." });
      if (modalTimeout) clearTimeout(modalTimeout);
      const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 8000);
      setModalTimeout(timeout);
      return;
    }

    const erroSenha = validarSenha(novaSenha);
    if (erroSenha) {
      setModalErro({ open: true, mensagem: erroSenha });
      if (modalTimeout) clearTimeout(modalTimeout);
      const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 8000);
      setModalTimeout(timeout);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setModalErro({ open: true, mensagem: "As senhas não coincidem." });
      if (modalTimeout) clearTimeout(modalTimeout);
      const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 8000);
      setModalTimeout(timeout);
      return;
    }

    setModalConfirmacao(true);
  };

  const handleConfirmarRedefinicao = () => {
    setModalConfirmacao(false);
    console.log("Senha redefinida:", novaSenha);
    setModalSucesso(true);
  };

  const handleFecharSucesso = () => {
    setModalSucesso(false);
    navigate("/");
  };

  return (
    <div className="redefinir-container">
      <div style={{ position: "fixed", top: 24, right: 24, zIndex: 2000 }}>
        <Modal
          isOpen={modalErro.open}
          onClose={() => setModalErro({ open: false, mensagem: "" })}
          texto={modalErro.mensagem}
          showClose={true}
        />
      </div>

      <Modal
        isOpen={modalConfirmacao}
        onClose={() => setModalConfirmacao(false)}
        texto="Tem certeza que deseja redefinir sua senha?"
        showClose={false}
        botoes={[
          {
            texto: "SIM",
            onClick: handleConfirmarRedefinicao,
            style: { background: "#d9d9d9", color: "#222", minWidth: 90 }
          },
          {
            texto: "NÃO",
            onClick: () => setModalConfirmacao(false),
            style: { background: "#111", color: "#fff", minWidth: 90 }
          }
        ]}
      />

      <Modal
        isOpen={modalSucesso}
        onClose={handleFecharSucesso}
        texto="Senha redefinida com sucesso!"
        showClose={true}
      />

      <div className="redefinir-card">
        <div className="redefinir-content">
          <h2 className="redefinir-title">REDEFINIR<br />SENHA</h2>
          <div className="form-section">
            <Input
              label="Informe a nova senha:"
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite sua nova senha"
              isPassword={true}
            />
            <Input
              label="Confirme a senha:"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Digite a senha novamente"
              isPassword={true}
            />
            <div className="botao-container">
              <Botao texto="Redefinir senha" onClick={handleRedefinirClick} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedefinirSenha;