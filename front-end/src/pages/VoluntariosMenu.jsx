
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import "../styles/VoluntariosMenu.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

export default function VoluntariosMenu() {
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
    <div className="voluntarios-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
      <div className="voluntarios-container">
        <Voltar onClick={() => navigate("/home")} />
        <h1 className="voluntarios-title">Voluntários</h1>
        <div className="voluntarios-botoes-row">
          <button className="voluntarios-botao" onClick={() => navigate("/voluntarios-cadastro")}>Cadastrar</button>
          <button className="voluntarios-botao" onClick={() => navigate("/voluntarios-excluir")}>Excluir</button>
        </div>
      </div>
    </div>
  );
}
