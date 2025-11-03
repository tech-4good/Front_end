import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { useNavigate, useSearchParams } from "react-router-dom";
import Input from "../components/Input";
import Botao from "../components/Botao";
import { authService } from "../services/authService";
import "../styles/RedefinirSenha.css";

const RedefinirSenha = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [tokenValido, setTokenValido] = useState(null);
  const [email, setEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [modalErro, setModalErro] = useState({ open: false, mensagem: "" });
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalTimeout, setModalTimeout] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [validandoToken, setValidandoToken] = useState(true);

  // Validar token ao carregar a página
  useEffect(() => {
    const validarToken = async () => {
      const tokenUrl = searchParams.get('token');
      
      if (!tokenUrl) {
        setModalErro({ 
          open: true, 
          mensagem: "Token de recuperação não encontrado. Solicite um novo e-mail de recuperação." 
        });
        setTokenValido(false);
        setValidandoToken(false);
        setTimeout(() => navigate("/recuperar-senha"), 3000);
        return;
      }

      setToken(tokenUrl);

      try {
        const resultado = await authService.validarTokenRecuperacao(tokenUrl);
        
        if (resultado.sucesso) {
          setTokenValido(true);
        } else {
          setTokenValido(false);
          setModalErro({ 
            open: true, 
            mensagem: resultado.mensagem || "Token inválido ou expirado." 
          });
          setTimeout(() => navigate("/recuperar-senha"), 3000);
        }
      } catch (erro) {
        console.error("Erro ao validar token:", erro);
        setTokenValido(false);
        setModalErro({ 
          open: true, 
          mensagem: "Erro ao validar token. Por favor, solicite um novo e-mail de recuperação." 
        });
        setTimeout(() => navigate("/recuperar-senha"), 3000);
      } finally {
        setValidandoToken(false);
      }
    };

    validarToken();
  }, [searchParams, navigate]);

  const validarSenha = (senha) => {
    if (senha.length < 8) {
      return "A senha deve ter no mínimo 8 caracteres.";
    }
    return null;
  };

  const handleRedefinirClick = () => {
    if (!email.trim() || !senhaAtual.trim() || !novaSenha.trim() || !confirmarSenha.trim()) {
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

  const handleConfirmarRedefinicao = async () => {
    setModalConfirmacao(false);
    setCarregando(true);

    try {
      const resultado = await authService.redefinirSenha(email, senhaAtual, novaSenha);
      
      if (resultado.sucesso) {
        setModalSucesso(true);
      } else {
        setModalErro({ 
          open: true, 
          mensagem: resultado.mensagem || "Erro ao redefinir senha." 
        });
        if (modalTimeout) clearTimeout(modalTimeout);
        const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 8000);
        setModalTimeout(timeout);
      }
    } catch (erro) {
      console.error("Erro ao redefinir senha:", erro);
      // Usar a mensagem de erro que vem da exceção
      const mensagemErro = erro.message || "Erro inesperado ao redefinir senha. Tente novamente.";
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

  const handleFecharSucesso = () => {
    setModalSucesso(false);
    navigate("/");
  };

  // Exibir tela de carregamento enquanto valida o token
  if (validandoToken) {
    return (
      <div className="redefinir-container">
        <div className="redefinir-card">
          <div className="redefinir-content">
            <h2 className="redefinir-title">VALIDANDO<br />TOKEN...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Se o token for inválido, não renderizar o formulário
  if (tokenValido === false) {
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
        <div className="redefinir-card">
          <div className="redefinir-content">
            <h2 className="redefinir-title">TOKEN<br />INVÁLIDO</h2>
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
              Redirecionando para recuperação de senha...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              label="E-mail:"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
            <Input
              label="Senha Atual:"
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="Digite sua senha atual"
              isPassword={true}
            />
            <Input
              label="Nova Senha:"
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite sua nova senha (mín. 8 caracteres)"
              isPassword={true}
            />
            <Input
              label="Confirme a Nova Senha:"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Digite a senha novamente"
              isPassword={true}
            />
            <div className="botao-container">
              <Botao 
                texto={carregando ? "Redefinindo..." : "Redefinir senha"} 
                onClick={handleRedefinirClick}
                disabled={carregando}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedefinirSenha;