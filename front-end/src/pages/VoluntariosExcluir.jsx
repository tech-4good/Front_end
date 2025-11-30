import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import { voluntarioService } from "../services/voluntarioService";
import "../styles/VoluntariosExcluir.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import iconeVoltar from "../assets/icone-voltar.png";

export default function VoluntariosExcluir() {
  const navigate = useNavigate();
  const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";
  const tipoUsuario = sessionStorage.getItem("tipoUsuario") || "2";
  const usuarioLogadoId = sessionStorage.getItem("userId");

  const botoesNavbar = [
    { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
    { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
    ...(tipoUsuario === "2"
      ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }]
      : []),
    { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
  ];

  const [cpfBusca, setCpfBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [modalConfirm, setModalConfirm] = useState({ open: false, voluntario: null });
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErro, setModalErro] = useState({ open: false, mensagem: "" });
  const [carregando, setCarregando] = useState(false);

  // Auto-close modal de sucesso após 3 segundos e redirecionar para home
  React.useEffect(() => {
    if (modalSucesso) {
      const timer = setTimeout(() => {
        setModalSucesso(false);
        navigate("/home");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [modalSucesso, navigate]);

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

  async function handleCpfChange(e) {
    const raw = e.target.value;
    const formatted = formatCPF(raw);
    setCpfBusca(formatted);
    const valor = formatted.replace(/\D/g, "");
    
    if (valor.length >= 3) { // Buscar quando tiver pelo menos 3 dígitos
      setCarregando(true);
      try {
        const response = await voluntarioService.listarTodos();
        if (response.success) {
          const voluntariosFiltrados = response.data.filter(v => 
            v.cpf && v.cpf.replace(/\D/g, '').includes(valor)
          );
          setResultados(voluntariosFiltrados);
        } else {
          console.error('Erro ao buscar voluntários:', response.error);
          setResultados([]);
        }
      } catch (error) {
        console.error('Erro na busca:', error);
        setResultados([]);
      } finally {
        setCarregando(false);
      }
    } else {
      setResultados([]);
    }
  }

  function handleClickVoluntario(v) {
    const voluntarioId = v.idVoluntario || v.id || v.userId;
    
    // Verificar se está tentando excluir a si mesmo
    if (voluntarioId && usuarioLogadoId && voluntarioId.toString() === usuarioLogadoId.toString()) {
      setModalErro({ 
        open: true, 
        mensagem: "Você não pode excluir seu próprio cadastro!" 
      });
      return;
    }
    
    setModalConfirm({ open: true, voluntario: v });
  }

  async function handleExcluir() {
    const voluntarioId = modalConfirm.voluntario?.idVoluntario || modalConfirm.voluntario?.id || modalConfirm.voluntario?.userId;
    
    if (!voluntarioId) {
      setModalErro({ open: true, mensagem: "Erro: ID do voluntário não encontrado." });
      return;
    }

    setCarregando(true);
    try {
      const response = await voluntarioService.remover(voluntarioId);
      
      if (response.success) {
        setModalConfirm({ open: false, voluntario: null });
        setModalSucesso(true);
        setCpfBusca("");
        setResultados([]);
      } else {
        console.error('Erro na exclusão:', response.error);
        setModalErro({ open: true, mensagem: response.error || "Erro ao excluir voluntário." });
        setModalConfirm({ open: false, voluntario: null });
      }
    } catch (error) {
      console.error('Erro inesperado na exclusão:', error);
      setModalErro({ open: true, mensagem: "Erro inesperado. Tente novamente." });
      setModalConfirm({ open: false, voluntario: null });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div>
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isVoluntariosPage={true} />
      <div className="voluntarios-excluir-container">
        <img 
          src={iconeVoltar} 
          alt="Voltar" 
          className="voluntarios-excluir-icone-voltar"
          onClick={() => navigate("/voluntarios-menu")}
        />
        <h1 className="voluntarios-excluir-title">Excluir Voluntário</h1>
        
        <div className="voluntarios-excluir-form">
          {/* Campo de busca por CPF */}
          <div className="voluntarios-excluir-row voluntarios-excluir-row-single">
            <div className="voluntarios-excluir-field">
              <label className="voluntarios-excluir-label">CPF:</label>
              <input
                type="text"
                name="cpfBusca"
                value={cpfBusca}
                onChange={handleCpfChange}
                placeholder="Digite o CPF para buscar"
                autoComplete="off"
                maxLength={14}
                className="voluntarios-excluir-input"
              />
            </div>
          </div>

          {/* Resultados da busca */}
          {carregando && cpfBusca.length >= 3 && (
            <div className="voluntarios-excluir-resultados">
              <div className="voluntarios-excluir-resultado-loading">Buscando voluntários...</div>
            </div>
          )}
          
          {!carregando && cpfBusca && resultados.length > 0 && (
            <div className="voluntarios-excluir-resultados">
              <div className="voluntarios-excluir-resultados-header">Voluntários encontrados:</div>
              {resultados.map((v, idx) => (
                <div
                  className="voluntarios-excluir-resultado-item"
                  key={v.idVoluntario || v.id || idx}
                  onClick={() => handleClickVoluntario(v)}
                >
                  <div className="voluntarios-excluir-resultado-nome">{v.nomeCompleto || v.nome}</div>
                  <div className="voluntarios-excluir-resultado-cpf">CPF: {v.cpf}</div>
                </div>
              ))}
            </div>
          )}
          
          {!carregando && cpfBusca.length >= 3 && resultados.length === 0 && (
            <div className="voluntarios-excluir-resultados">
              <div className="voluntarios-excluir-resultado-vazio">Nenhum voluntário encontrado</div>
            </div>
          )}
        </div>
        
        {/* Modals */}
        <Modal
          isOpen={modalConfirm.open}
          onClose={() => setModalConfirm({ open: false, voluntario: null })}
          texto={modalConfirm.voluntario ? (
            `ATENÇÃO\n\nVocê tem certeza que deseja excluir o voluntário?\n\n${modalConfirm.voluntario?.nomeCompleto || modalConfirm.voluntario?.nome}`
          ) : ""}
          showClose={false}
          botoes={[
            {
              texto: carregando ? "Excluindo..." : "Sim",
              onClick: handleExcluir
            },
            {
              texto: "Não",
              onClick: () => setModalConfirm({ open: false, voluntario: null })
            }
            
          ]}
        />
        <Modal
          isOpen={modalSucesso}
          onClose={() => {
            setModalSucesso(false);
            navigate("/home");
          }}
          texto="Voluntário excluído com sucesso!"
          showClose={false}
        />
        <Modal
          isOpen={modalErro.open}
          onClose={() => setModalErro({ open: false, mensagem: "" })}
          texto={modalErro.mensagem}
          showClose={false}
        />
      </div>
    </div>
  );
}
