import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import "../styles/Cadastro.css";
import Botao from "../components/Botao";
import Input from "../components/Input";

const Cadastro = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [modalErro, setModalErro] = useState({ open: false, mensagem: "" });
  const [modalSucesso, setModalSucesso] = useState({
    open: false,
    mensagem: "",
  });
  const [modalTimeout, setModalTimeout] = useState(null);
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    cpf: "",
    telefone: "",
    email: "",
    senha: "",
    TipoUsuario: 1,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCPF = (value) => {
    let numbers = value.replace(/\D/g, "");
    if (numbers.length > 11) numbers = numbers.slice(0, 11);
    let formatted = numbers;
    if (numbers.length > 9) {
      formatted = numbers.replace(
        /(\d{3})(\d{3})(\d{3})(\d{0,2})/,
        "$1.$2.$3-$4"
      );
    } else if (numbers.length > 6) {
      formatted = numbers.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
    } else if (numbers.length > 3) {
      formatted = numbers.replace(/(\d{3})(\d{0,3})/, "$1.$2");
    }
    return formatted;
  };

  const formatPhone = (value) => {
    let numbers = value.replace(/\D/g, "");
    if (numbers.length > 11) numbers = numbers.slice(0, 11);
    if (numbers.length === 0) return "";
    if (numbers.length < 3) return `(${numbers}`;
    if (numbers.length < 7)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(
        6
      )}`.replace(/-$/, "");
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
      7
    )}`.replace(/-$/, "");
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const formatted = formatPhone(raw);
    handleInputChange("telefone", formatted);
  };

  const handleCPFChange = (e) => {
    const raw = e.target.value;
    const formatted = formatCPF(raw);
    handleInputChange("cpf", formatted);
  };

  function validarNome(nome) {
    if (nome.length > 200) return "O nome deve ter no máximo 200 caracteres.";
    if (/(.)\1{2,}/.test(nome))
      return "O nome não pode ter mais de 3 caracteres iguais seguidos.";
    return null;
  }

  function validarEmail(email) {
    if (!email.includes("@") || !email.includes("."))
      return "O e-mail deve conter @ e pelo menos um ponto (.)";
    return null;
  }

  function validarSenha(senha) {
    if (senha.length < 5 || senha.length > 12)
      return "A senha deve ter entre 5 e 12 caracteres.";
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha))
      return "A senha deve conter pelo menos 1 caractere especial.";
    return null;
  }

  const handleCadastro = (e) => {
    e.preventDefault();
    let erros = [];
    const campos = { ...formData, TipoUsuario: 1 };

    const camposMsg = validarCamposPreenchidos(campos);
    if (camposMsg) erros.push(camposMsg);

    const nomeMsg = validarNome(formData.nomeCompleto);
    if (nomeMsg) erros.push(nomeMsg);

    const emailMsg = validarEmail(formData.email);
    if (emailMsg) erros.push(emailMsg);

    const senhaMsg = validarSenha(formData.senha);
    if (senhaMsg) erros.push(senhaMsg);
    if (erros.length > 0) {
      setModalErro({ open: true, mensagem: erros.join("\n") });
      if (modalTimeout) clearTimeout(modalTimeout);
      const timeout = setTimeout(
        () => setModalErro({ open: false, mensagem: "" }),
        10000
      );
      setModalTimeout(timeout);
      return;
    }

    const cleanCPF = formData.cpf.replace(/\D/g, "");
    const cleanTelefone = formData.telefone.replace(/\D/g, "");
    const dadosParaEnviar = {
      ...formData,
      cpf: cleanCPF,
      telefone: cleanTelefone,
      TipoUsuario: 1,
    };
    console.log(dadosParaEnviar);

    setModalSucesso({
      open: true,
      mensagem: "Cadastro realizado com sucesso!",
    });
    if (modalTimeout) clearTimeout(modalTimeout);
    const timeout = setTimeout(() => {
      setModalSucesso({ open: false, mensagem: "" });
      navigate("/login");
    }, 3000);
    setModalTimeout(timeout);
  };

  function validarCamposPreenchidos(obj) {
    for (const key in obj) {
      if (!obj[key] || String(obj[key]).trim() === "")
        return "Todos os campos devem estar preenchidos.";
    }
    return null;
  }

  return (
    <div className="cadastro-container">
      {/* Modal de erro no centro */}
      <div style={{ position: "fixed", top: 24, right: 24, zIndex: 2000 }}>
        <Modal
          isOpen={modalErro.open}
          onClose={() => setModalErro({ open: false, mensagem: "" })}
          texto={modalErro.mensagem}
          showClose={true}
        />
      </div>
      {/* Modal de sucesso no centro */}
      <div
        style={{
          position: "fixed",
          top: 80,
          left: 0,
          right: 0,
          margin: "0 auto",
          zIndex: 2000,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Modal
          isOpen={modalSucesso.open}
          onClose={() => setModalSucesso({ open: false, mensagem: "" })}
          texto={modalSucesso.mensagem}
          showClose={false}
        />
      </div>
      <form
        className="cadastro-card"
        onSubmit={handleCadastro}
        autoComplete="off"
      >
        <h2 className="cadastro-title">CADASTRO</h2>

        <div className="input-group">
          <label className="input-label">Nome Completo:</label>
          <Input
            placeholder="Digite seu nome completo"
            value={formData.nomeCompleto}
            onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-col">
            <div className="input-group">
              <label className="input-label">CPF:</label>
              <Input
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={handleCPFChange}
              />
            </div>
          </div>
          <div className="form-col">
            <div className="input-group">
              <label className="input-label">Telefone:</label>
              <Input
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={handlePhoneChange}
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-col">
            <div className="input-group">
              <label className="input-label">E-mail:</label>
              <Input
                placeholder="email@dominio.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                type="text"
              />
            </div>
          </div>
          <div className="form-col">
            <div className="input-group">
              <label className="input-label">Senha:</label>
              <Input
                placeholder="******************"
                value={formData.senha}
                onChange={(e) => handleInputChange("senha", e.target.value)}
                type="password"
                isPassword={true}
                style={{ paddingRight: 40 }}
              />
            </div>
          </div>
        </div>

        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 24 }}
        >
          <Botao texto="Cadastrar" type="submit" />
        </div>

        <div className="login-section">
          <span className="login-text">JÁ TEM CONTA? </span>
          <a className="btn-link" href="/">
            CLIQUE AQUI!
          </a>
        </div>
      </form>
    </div>
  );
};

export default Cadastro;
