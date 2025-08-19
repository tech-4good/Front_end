import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import logoTech from "../assets/icone-logo-tech.png";
import Input from "../components/Input";
import Botao from "../components/Botao";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeCadeado from "../assets/icone-cadeado.png";
import Modal from "../components/Modal";

const Login = () => {
  function validarEmail(email) {
    if (!email.includes("@") || !email.includes(".")) {
      return "O e-mail deve conter @ e pelo menos um ponto (.)";
    }
    return null;
  }
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modalErro, setModalErro] = useState({ open: false, mensagem: "" });
  const [modalTimeout, setModalTimeout] = useState(null);
  const [tentativas, setTentativas] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);
  const bloqueioTimeout = useRef(null);
  const [tipoUsuario, setTipoUsuario] = useState("2");

  const handleLogin = (e) => {
    e.preventDefault();
    if (bloqueado) {
      setModalErro({ open: true, mensagem: "Você excedeu o número de tentativas. Tente novamente em 10 minutos." });
      if (modalTimeout) clearTimeout(modalTimeout);
      const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 8000);
      setModalTimeout(timeout);
      return;
    }
    let erros = [];
    if (!email || !senha) {
      erros.push("Todos os campos devem ser preenchidos.");
    }
    const emailMsg = validarEmail(email);
    if (email && emailMsg) erros.push(emailMsg);
    // Simulação de dois usuários
    const usuarios = [
      { email: "teste@teste.com", senha: "123", tipo: "2", nome: "Aline" },
      { email: "usuario@comum.com", senha: "123", tipo: "1", nome: "Bruna" }
    ];
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    let erroLogin = false;
    if (erros.length === 0 && !usuario) {
      erroLogin = true;
      erros.push(`E-mail ou senha incorretos. Você ainda tem ${4 - tentativas} tentativa(s).`);
    }
    if (erros.length > 0) {
      setModalErro({ open: true, mensagem: erros.join("\n") });
      if (modalTimeout) clearTimeout(modalTimeout);
      const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 8000);
      setModalTimeout(timeout);
      if (erroLogin) {
        if (tentativas + 1 >= 5) {
          setBloqueado(true);
          setTentativas(5);
          setModalErro({ open: true, mensagem: "Você excedeu o número de tentativas. Tente novamente em 10 minutos." });
          bloqueioTimeout.current = setTimeout(() => {
            setBloqueado(false);
            setTentativas(0);
            setModalErro({ open: true, mensagem: "Você pode tentar novamente agora." });
            setTimeout(() => setModalErro({ open: false, mensagem: "" }), 8000);
          }, 10 * 60 * 1000); 
        } else {
          setTentativas(tentativas + 1);
        }
      }
      return;
    }
    setTentativas(0);
    if (usuario) {
      sessionStorage.setItem("tipoUsuario", usuario.tipo);
      sessionStorage.setItem("nomeUsuario", usuario.nome);
      navigate("/home");
    }
  };

  return (
    <div className="login-bg">
      {/* Modal de erro no centro */}
      <div style={{ position: "fixed", top: 24, right: 24, zIndex: 2000 }}>
        <Modal
          isOpen={modalErro.open}
          onClose={() => setModalErro({ open: false, mensagem: "" })}
          texto={modalErro.mensagem}
          showClose={true}
        />
      </div>
      <div className="login-card">
        <div className="login-logo-row">
          <img src={logoTech} alt="Tech4Good" className="login-logo" />
        </div>
        <h2 className="login-header">LOGIN</h2>
  <form onSubmit={handleLogin} className="login-form">
          <Input
            label="E-mail:"
            type="text"
            placeholder="email@dominio.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Input
            label="Senha:"
            type="password"
            placeholder="****************"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            isPassword
          />
          <button
            type="button"
            className="login-forgot login-link-btn"
            style={{ margin: 0, padding: 0, background: 'none', border: 'none' }}
            onClick={() => navigate("/recuperar-senha")}
          >
            ESQUECI MINHA SENHA
          </button>
          <Botao texto="Entrar" type="submit" disabled={bloqueado} />
        </form>
        <div className="login-link-row">
          <span>AINDA NÃO TEM CONTA? </span>
          <button className="login-link-btn" onClick={() => navigate("/cadastro")}>CLIQUE AQUI!</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
