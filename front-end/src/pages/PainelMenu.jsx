import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/PainelMenu.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import iconeVoltar from "../assets/icone-voltar.png";
import iconeSetaSubindo from "../assets/icone-seta-subindo.png";

export default function PainelMenu() {
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

  return (
    <div className="painelmenu-container">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isRelatoriosPage={true} />
      <img 
        src={iconeVoltar} 
        alt="Voltar" 
        className="painelmenu-voltar"
        onClick={() => navigate("/home")}
      />
      <div className="painelmenu-content">
        <div className="painelmenu-title">Acompanhe a ASA de Perto!</div>
        <div className="painelmenu-grid">
          <div className="painelmenu-card-item" onClick={() => navigate("/dashboard")}>
            <h3 className="painelmenu-card-title">Painel</h3>
            <div className="painelmenu-card-icon">
              <img src={iconeSetaSubindo} alt="Painel" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
