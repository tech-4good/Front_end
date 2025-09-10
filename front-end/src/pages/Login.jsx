import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import logoTech from "../assets/icone-logo-tech.png";
import Input from "../components/Input";
import Botao from "../components/Botao";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeCadeado from "../assets/icone-cadeado.png";
import Modal from "../components/Modal";
import { voluntarioService } from "../services/voluntarioService";

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
  const [carregando, setCarregando] = useState(false);
  const bloqueioTimeout = useRef(null);
  const [tipoUsuario, setTipoUsuario] = useState("2");

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (bloqueado || carregando) {
      if (bloqueado) {
        setModalErro({ open: true, mensagem: "Você excedeu o número de tentativas. Tente novamente em 10 minutos." });
        if (modalTimeout) clearTimeout(modalTimeout);
        const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 8000);
        setModalTimeout(timeout);
      }
      return;
    }
    
    let erros = [];
    if (!email || !senha) {
      erros.push("Todos os campos devem ser preenchidos.");
    }
    
    const emailMsg = validarEmail(email);
    if (email && emailMsg) erros.push(emailMsg);
    
    if (erros.length > 0) {
      setModalErro({ open: true, mensagem: erros.join("\n") });
      if (modalTimeout) clearTimeout(modalTimeout);
      const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 8000);
      setModalTimeout(timeout);
      return;
    }

    setCarregando(true);

    try {
      const resultado = await voluntarioService.login(email, senha);
      
      if (resultado.success) {
        // Reset tentativas em caso de sucesso
        setTentativas(0);
        
        // Redirecionar para home
        navigate("/home");
      } else {
        // Incrementar tentativas de login
        const novasTentativas = tentativas + 1;
        setTentativas(novasTentativas);
        
        let mensagem = resultado.error;
        
        if (novasTentativas >= 5) {
          setBloqueado(true);
          mensagem = "Você excedeu o número de tentativas. Tente novamente em 10 minutos.";
          
          // Timeout para desbloquear após 10 minutos
          bloqueioTimeout.current = setTimeout(() => {
            setBloqueado(false);
            setTentativas(0);
            setModalErro({ open: true, mensagem: "Você pode tentar novamente agora." });
            setTimeout(() => setModalErro({ open: false, mensagem: "" }), 8000);
          }, 10 * 60 * 1000);
        } else {
          mensagem += ` Você ainda tem ${5 - novasTentativas} tentativa(s).`;
        }
        
        setModalErro({ open: true, mensagem });
        if (modalTimeout) clearTimeout(modalTimeout);
        const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 8000);
        setModalTimeout(timeout);
      }
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      setModalErro({ 
        open: true, 
        mensagem: "Erro inesperado. Tente novamente." 
      });
      if (modalTimeout) clearTimeout(modalTimeout);
      const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 8000);
      setModalTimeout(timeout);
    } finally {
      setCarregando(false);
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
          <Botao 
            texto={carregando ? "Entrando..." : "Entrar"} 
            type="submit" 
            disabled={bloqueado || carregando} 
          />
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
