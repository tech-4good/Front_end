import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import Modal from "../components/Modal";
import "../styles/VoluntariosExcluir.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

const voluntariosFake = [
  { cpf: "48763842135", nome: "Juliana Gomes Oliveira" },
  { cpf: "12345678901", nome: "Carlos Silva" },
  { cpf: "98765432100", nome: "Maria Souza" },
  { cpf: "45678912300", nome: "Ana Paula Lima" },
  { cpf: "11122233344", nome: "João Pedro Santos" },
];

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

  function handleCpfChange(e) {
    const valor = e.target.value.replace(/\D/g, "");
    setCpfBusca(valor);
    if (valor.length > 0) {
      setResultados(
        voluntariosFake.filter(v => v.cpf.includes(valor))
      );
    } else {
      setResultados([]);
    }
  }

  function handleClickVoluntario(v) {
    setModalConfirm({ open: true, voluntario: v });
  }

  function handleExcluir() {
    setModalConfirm({ open: false, voluntario: null });
    setModalSucesso(true);
    setCpfBusca("");
    setResultados([]);
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
          {cpfBusca && resultados.length > 0 && (
            <div className="voluntarios-excluir-resultados">
              {resultados.map((v, idx) => (
                <div
                  className="voluntarios-excluir-resultado"
                  key={idx}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleClickVoluntario(v)}
                >
                  {v.nome}
                </div>
              ))}
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
                  {modalConfirm.voluntario?.nome}
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
                texto: "SIM",
                style: { background: "#d9d9d9", color: "#222", minWidth: 90 },
                onClick: handleExcluir
              }
            ]}
          />
          <Modal
            isOpen={modalSucesso}
            onClose={() => setModalSucesso(false)}
            texto={"Voluntário excluído com sucesso!"}
            showClose={true}
          />
        </div>
      </div>
    </div>
  );
}
