import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import { voluntarioService } from "../services/voluntarioService";
import "../styles/VoluntariosCadastro.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import iconeVoltar from "../assets/icone-voltar.png";
import iconeOlhoAberto from "../assets/icone-olho-aberto.png";
import iconeOlhoFechado from "../assets/icone-olho-fechado.png";

const tipos = [
  { label: "Administrador", value: 2 },
  { label: "Voluntário Simples", value: 1 },
];

export default function VoluntariosCadastro() {
  const navigate = useNavigate();
  const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";
  const tipoUsuario = sessionStorage.getItem("tipoUsuario") || "2";

  const botoesNavbar = [
    { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
    { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
    ...(tipoUsuario === "2"
      ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }]
      : []),
    { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
  ];

  const [formData, setFormData] = useState({
    nomeCompleto: "",
    cpf: "",
    telefone: "",
    email: "",
    senha: "",
    tipo: 2,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [modalErro, setModalErro] = useState({ open: false, mensagem: "" });
  const [modalSucesso, setModalSucesso] = useState({ open: false, mensagem: "" });
  const [modalTimeout, setModalTimeout] = useState(null);

  // Auto-close modal de sucesso após 3 segundos e redirecionar para home
  React.useEffect(() => {
    if (modalSucesso.open) {
      const timer = setTimeout(() => {
        setModalSucesso({ open: false, mensagem: "" });
        navigate("/home");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [modalSucesso.open, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCPF = (value) => {
    let numbers = value.replace(/\D/g, "");
    if (numbers.length > 11) numbers = numbers.slice(0, 11);
    let formatted = numbers;
    if (numbers.length > 9) {
      formatted = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
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
    if (numbers.length < 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`.replace(/-$/, "");
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`.replace(/-$/, "");
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
    if (/(.)\1{2,}/.test(nome)) return "O nome não pode ter mais de 3 caracteres iguais seguidos.";
    return null;
  }

  function validarEmail(email) {
    if (!email.includes("@") || !email.includes(".")) return "O e-mail deve conter @ e pelo menos um ponto (.)";
    return null;
  }

  function validarSenha(senha) {
    if (senha.length < 5 || senha.length > 12) return "A senha deve ter entre 5 e 12 caracteres.";
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha)) return "A senha deve conter pelo menos 1 caractere especial.";
    return null;
  }

  function validarCamposPreenchidos(obj) {
    for (const key in obj) {
      if (!obj[key] || String(obj[key]).trim() === "") return "Todos os campos devem estar preenchidos.";
    }
    return null;
  }

  const handleCadastro = async (e) => {
    e.preventDefault();
    
    // Validação dos campos
    let erros = [];
    const campos = { ...formData };
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
      const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 10000);
      setModalTimeout(timeout);
      return;
    }

    try {
      // Preparar dados para o backend
      const dadosVoluntario = {
        nomeCompleto: formData.nomeCompleto,
        cpf: formData.cpf.replace(/\D/g, ''), // Remove formatação do CPF
        telefone: formData.telefone.replace(/\D/g, ''), // Remove formatação do telefone
        email: formData.email,
        senha: formData.senha,
        TipoUsuario: formData.tipo === 2 ? 1 : 0 // Conversão: Frontend 2=Admin -> Backend 1=Admin, Frontend 1=Voluntário -> Backend 0=Voluntário
      };

      console.log('Enviando dados para cadastro:', dadosVoluntario);

      // Chamada real à API
      const result = await voluntarioService.cadastrar(dadosVoluntario);
      
      if (result.success) {
        console.log('Voluntário cadastrado com sucesso:', result.data);
        setModalSucesso({ 
          open: true, 
          mensagem: `Voluntário ${formData.nomeCompleto} cadastrado com sucesso!` 
        });
        
        // Limpar o formulário após sucesso
        setFormData({
          nomeCompleto: "",
          cpf: "",
          telefone: "",
          email: "",
          senha: "",
          tipo: 1
        });
      } else {
        console.error('Erro no cadastro:', result.error);
        setModalErro({ open: true, mensagem: result.error });
        if (modalTimeout) clearTimeout(modalTimeout);
        const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 10000);
        setModalTimeout(timeout);
      }
    } catch (error) {
      console.error('Erro inesperado no cadastro:', error);
      setModalErro({ 
        open: true, 
        mensagem: "Erro interno do servidor. Tente novamente mais tarde." 
      });
      if (modalTimeout) clearTimeout(modalTimeout);
      const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 10000);
      setModalTimeout(timeout);
    }
  };

  return (
    <div>
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isVoluntariosPage={true} />
      <div className="voluntarios-cadastro-container">
        <img 
          src={iconeVoltar} 
          alt="Voltar" 
          className="voluntarios-cadastro-icone-voltar"
          onClick={() => navigate("/voluntarios-menu")}
        />
        <h1 className="voluntarios-cadastro-title">Cadastrar Voluntário</h1>
        
        <form className="voluntarios-cadastro-form" onSubmit={handleCadastro}>
          {/* Primeira linha - Nome Completo e E-mail (2 campos) */}
          <div className="voluntarios-cadastro-row voluntarios-cadastro-row-double">
            <div className="voluntarios-cadastro-field">
              <label className="voluntarios-cadastro-label">Nome Completo:</label>
              <input
                type="text"
                name="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={e => {
                  let nome = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''); // Somente letras e espaços
                  nome = nome.replace(/\s{2,}/g, ' '); // Não permitir espaços duplos
                  if (nome.startsWith(' ')) nome = nome.substring(1); // Não permitir espaço no início
                  handleInputChange("nomeCompleto", nome);
                }}
                placeholder="Digite seu nome completo"
                autoComplete="off"
                maxLength={200}
                className="voluntarios-cadastro-input"
              />
            </div>
            <div className="voluntarios-cadastro-field">
              <label className="voluntarios-cadastro-label">E-mail:</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={e => {
                  const email = e.target.value.replace(/\s/g, ''); // Remove todos os espaços
                  handleInputChange("email", email);
                }}
                placeholder="email@dominio.com"
                autoComplete="off"
                className="voluntarios-cadastro-input"
              />
            </div>
          </div>

          {/* Segunda linha - CPF, Telefone e Senha (3 campos) */}
          <div className="voluntarios-cadastro-row voluntarios-cadastro-row-triple">
            <div className="voluntarios-cadastro-field">
              <label className="voluntarios-cadastro-label">CPF:</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                autoComplete="off"
                maxLength={14}
                className="voluntarios-cadastro-input"
              />
            </div>
            <div className="voluntarios-cadastro-field">
              <label className="voluntarios-cadastro-label">Telefone:</label>
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                autoComplete="off"
                maxLength={15}
                className="voluntarios-cadastro-input"
              />
            </div>
            <div className="voluntarios-cadastro-field">
              <label className="voluntarios-cadastro-label">Senha:</label>
              <div className="voluntarios-cadastro-senha-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="senha"
                  value={formData.senha}
                  onChange={e => {
                    const senha = e.target.value.replace(/\s/g, ''); // Remove todos os espaços
                    handleInputChange("senha", senha);
                  }}
                  placeholder="******************"
                  autoComplete="off"
                  minLength={5}
                  maxLength={12}
                  className="voluntarios-cadastro-input voluntarios-cadastro-senha-input"
                />
                <img
                  src={showPassword ? iconeOlhoFechado : iconeOlhoAberto}
                  alt={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="voluntarios-cadastro-senha-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>
            </div>
          </div>

          {/* Terceira linha - Categoria de Voluntário (1 campo) */}
          <div className="voluntarios-cadastro-row voluntarios-cadastro-row-single">
            <div className="voluntarios-cadastro-field">
              <label className="voluntarios-cadastro-label">Categoria de Voluntário:</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={e => handleInputChange("tipo", Number(e.target.value))}
                className="voluntarios-cadastro-input"
              >
                {tipos.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button className="voluntarios-cadastro-btn" type="submit">
            Cadastrar Voluntário
          </button>
        </form>
        
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 2000 }}>
          <Modal
            isOpen={modalErro.open}
            onClose={() => setModalErro({ open: false, mensagem: "" })}
            texto={modalErro.mensagem}
            showClose={false}
          />
        </div>
        <div style={{ position: "fixed", top: 80, left: 0, right: 0, margin: "0 auto", zIndex: 2000, display: "flex", justifyContent: "center" }}>
          <Modal
            isOpen={modalSucesso.open}
            onClose={() => {
              setModalSucesso({ open: false, mensagem: "" });
              navigate("/home");
            }}
            texto={modalSucesso.mensagem}
            showClose={false}
          />
        </div>
      </div>
    </div>
  );
}
