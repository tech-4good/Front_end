import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import "../styles/CadastroBeneficiadoMenu.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeUsuarios from "../assets/icone-usuarios.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import iconeVoltar from "../assets/icone-voltar.png";

export default function CadastroBeneficiadoMenu() {
  const navigate = useNavigate();
  const [modalSucesso, setModalSucesso] = useState(false);
  const [nomeBeneficiado, setNomeBeneficiado] = useState("");

  useEffect(() => {
    if (localStorage.getItem("modalSucessoBeneficiado") === "true") {
      const nome = sessionStorage.getItem("nomeBeneficiado") || "";
      setNomeBeneficiado(nome);
      setModalSucesso(true);
      localStorage.removeItem("modalSucessoBeneficiado");
    }
  }, []);

  // Timeout automático para o modal de sucesso (5 segundos)
  useEffect(() => {
    if (modalSucesso) {
      const timeout = setTimeout(() => setModalSucesso(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [modalSucesso]);
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

  return (
    <div className="cadastrobeneficiado-container">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isCadastrarBeneficiadosPage={true} />
      <img 
        src={iconeVoltar} 
        alt="Voltar" 
        className="cadastrobeneficiado-voltar"
        onClick={() => navigate("/home")}
      />
      <div className="cadastrobeneficiado-content">
        <div className="cadastrobeneficiado-title">Cadastre um Beneficiado!</div>
        <div className="cadastrobeneficiado-grid">
          <div className="cadastrobeneficiado-card-item" onClick={() => navigate("/cadastro-beneficiado-simples1")}>
            <h3 className="cadastrobeneficiado-card-title">Simples</h3>
            <div className="cadastrobeneficiado-card-icon">
              <img src={iconeUsuario} alt="Cadastro Simples" />
            </div>
          </div>
          <div className="cadastrobeneficiado-card-item" onClick={() => navigate("/cadastro-beneficiado-completo1")}>
            <h3 className="cadastrobeneficiado-card-title">Completo</h3>
            <div className="cadastrobeneficiado-card-icon">
              <img src={iconeUsuarios} alt="Cadastro Completo" />
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={modalSucesso}
        onClose={() => setModalSucesso(false)}
        texto={`Beneficiado ${nomeBeneficiado} cadastrado com sucesso!`}
        showClose={false}
      />
    </div>
  );
}
