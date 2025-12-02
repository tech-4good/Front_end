
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/VoluntariosMenu.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import iconeVoltar from "../assets/icone-voltar.png";
import iconeFechar from "../assets/icone-fechar.png";

export default function VoluntariosMenu() {
  const navigate = useNavigate();
  const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";
  const tipoUsuario = sessionStorage.getItem("tipoUsuario") || "2";

  const botoesNavbar = [
    { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
    { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
    ...(tipoUsuario === "2"
      ? []
      : []),
    { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
  ];

  return (
    <div className="voluntarios-container">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isVoluntariosPage={true} />
      <img 
        src={iconeVoltar} 
        alt="Voltar" 
        className="voluntarios-voltar"
        onClick={() => navigate("/home")}
      />
      <div className="voluntarios-content">
        <div className="voluntarios-title">Voluntários</div>
        <div className="voluntarios-grid">
          <div className="voluntarios-card-item" onClick={() => navigate("/voluntarios-cadastro")}>
            <h3 className="voluntarios-card-title">Cadastrar</h3>
            <div className="voluntarios-card-icon">
              <img src={iconeUsuario} alt="Cadastrar Voluntário" />
            </div>
          </div>
          <div className="voluntarios-card-item" onClick={() => navigate("/voluntarios-excluir")}>
            <h3 className="voluntarios-card-title">Excluir</h3>
            <div className="voluntarios-card-icon">
              <img src={iconeFechar} alt="Excluir Voluntário" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
