import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import "../styles/Home.css";
import "../styles/PainelMenu.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

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
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
      <div className="painelmenu-voltar">
        <Voltar onClick={() => navigate("/home")} />
      </div>
      <div className="painelmenu-card">
        <div className="painelmenu-title">Acompanhe a ASA de Perto!</div>
        <div className="painelmenu-botoes">
          <button className="painelmenu-botao" onClick={() => navigate("/dashboard")}>Painel</button>
          <button className="painelmenu-botao" onClick={() => navigate("/relatorio")}>Relatório</button>
        </div>
      </div>
    </div>
  );
}
