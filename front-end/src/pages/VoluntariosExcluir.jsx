import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import Modal from "../components/Modal";
import { voluntarioService } from "../services/voluntarioService";
import "../styles/VoluntariosExcluir.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

export default function VoluntariosExcluir() {
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

  const [cpfBusca, setCpfBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [modalConfirm, setModalConfirm] = useState({ open: false, voluntario: null });
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErro, setModalErro] = useState({ open: false, mensagem: "" });
  const [carregando, setCarregando] = useState(false);

  async function handleCpfChange(e) {
    const valor = e.target.value.replace(/\D/g, "");
    setCpfBusca(valor);
    
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
    <div className="voluntarios-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
      <div className="voluntarios-excluir-container">
        <Voltar onClick={() => navigate("/voluntarios-menu")} />
        <h1 className="voluntarios-excluir-title">Exclua um Voluntário</h1>
        <div className="voluntarios-excluir-subtitle">Exclua uma pessoa que vai sair do voluntariado!</div>
        <div className="voluntarios-excluir-form">
          <input
            className="voluntarios-excluir-input"
            type="text"
            placeholder="Insira o CPF"
            value={cpfBusca}
            onChange={handleCpfChange}
            maxLength={11}
          />
          {carregando && cpfBusca.length >= 3 && (
            <div className="voluntarios-excluir-resultados">
              <div className="voluntarios-excluir-resultado">Buscando...</div>
            </div>
          )}
          {!carregando && cpfBusca && resultados.length > 0 && (
            <div className="voluntarios-excluir-resultados">
              {resultados.map((v, idx) => (
                <div
                  className="voluntarios-excluir-resultado"
                  key={v.idVoluntario || v.id || idx}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleClickVoluntario(v)}
                >
                  {v.nomeCompleto || v.nome} - CPF: {v.cpf}
                </div>
              ))}
            </div>
          )}
          {!carregando && cpfBusca.length >= 3 && resultados.length === 0 && (
            <div className="voluntarios-excluir-resultados">
              <div className="voluntarios-excluir-resultado">Nenhum voluntário encontrado</div>
            </div>
          )}
          <Modal
            isOpen={modalConfirm.open}
            onClose={() => setModalConfirm({ open: false, voluntario: null })}
            texto={modalConfirm.voluntario ? (
              <>
                <div style={{ fontWeight: 600, fontSize: 24, marginBottom: 8 }}>ATENÇÃO</div>
                <div style={{ marginBottom: 12 }}>
                  Você tem certeza que deseja excluir o voluntário?
                </div>
                <div style={{ fontWeight: 600, fontSize: 28, textDecoration: "underline", marginBottom: 18 }}>
                  {modalConfirm.voluntario?.nomeCompleto || modalConfirm.voluntario?.nome}
                </div>
              </>
            ) : ""}
            showClose={false}
            botoes={[
              {
                texto: "NÃO",
                style: { background: "#111", color: "#fff", minWidth: 90 },
                onClick: () => setModalConfirm({ open: false, voluntario: null })
              },
              {
                texto: carregando ? "Excluindo..." : "SIM",
                style: { background: "#d9d9d9", color: "#222", minWidth: 90 },
                onClick: handleExcluir,
                disabled: carregando
              }
            ]}
          />
          <Modal
            isOpen={modalSucesso}
            onClose={() => setModalSucesso(false)}
            texto={"Voluntário excluído com sucesso!"}
            showClose={true}
          />
          <Modal
            isOpen={modalErro.open}
            onClose={() => setModalErro({ open: false, mensagem: "" })}
            texto={modalErro.mensagem}
            showClose={true}
          />
        </div>
      </div>
    </div>
  );
}
