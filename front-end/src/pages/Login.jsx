import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

import logoTech from "../assets/icone-logo-tech.png";
import Input from "../components/Input";
import Botao from "../components/Botao";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeCadeado from "../assets/icone-cadeado.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  // Não precisa de showPassword aqui, pois o Input já gerencia isso

  const handleLogin = (e) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica de autenticação
    // Se sucesso:
    navigate("/perfil");
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo-row">
          <img src={logoTech} alt="Tech4Good" className="login-logo" />
        </div>
        <h2 className="login-header">LOGIN</h2>
        <form onSubmit={handleLogin} className="login-form">
          <Input
            label="E-mail:"
            type="text"
            placeholder="alinea@hotmail.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            iconImg={iconeUsuario}
            required
          />
          <Input
            label="Senha:"
            type="password"
            placeholder="****************"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            iconImg={iconeCadeado}
            isPassword
            required
          />
          <button
            type="button"
            className="login-forgot login-link-btn"
            style={{ margin: 0, padding: 0, background: 'none', border: 'none' }}
            onClick={() => navigate("/recuperar-senha")}
          >
            ESQUECI MINHA SENHA
          </button>
          <Botao texto="Entrar" type="submit" />
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
