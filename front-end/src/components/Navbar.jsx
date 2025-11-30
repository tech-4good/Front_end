
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import Botao from "./Botao";

import brandAsa from "../assets/brand-asa.png";
import logoAsaEscuro from "../assets/logo-asa-escuro.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeSair from "../assets/icone-sair.png";
import iconeRelogio from "../assets/icone-relogio.png";

const Navbar = ({ nomeUsuario = "Usuário", showMenuBar = true, onUsuarioClick, tipoUsuario, isPerfilPage = false, isCestasPage = false, isFilaEsperaPage = false, isCadastroEnderecoPage = false, isEntregarCestaPage = false, isCadastrarBeneficiadosPage = false, isConsultaBeneficiadosPage = false, isVoluntariosPage = false, isHomePage = false }) => {
  const navigate = useNavigate();
  
  const allMenuItems = [
    { texto: "Entregar Cesta", onClick: () => navigate("/doar-cesta"), admin: true, comum: true },
    { texto: "Cadastrar Endereços", onClick: () => navigate("/cadastro-endereco-1"), admin: true, comum: true },
    { texto: "Cadastrar Beneficiados", onClick: () => navigate("/cadastro-beneficiado-menu"), admin: true, comum: true },
    { texto: "Histórico de Cestas", onClick: () => navigate("/historico-doacoes"), admin: true, comum: true },
    { texto: "Consultar Beneficiados", onClick: () => navigate("/consulta-beneficiados"), admin: true, comum: true },
    { texto: "Cestas", onClick: () => navigate("/controle-cestas"), admin: true, comum: true },
    { texto: "Relatórios", onClick: () => navigate("/painel-menu"), admin: true, comum: false },
    { texto: "Voluntários", onClick: () => navigate("/voluntarios-menu"), admin: true, comum: false },
    { texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), admin: true, comum: false }
  ];
  
  const tipo = tipoUsuario || sessionStorage.getItem("tipoUsuario") || "2";
  const menuItems = allMenuItems.filter(item => 
    tipo === "2" ? item.admin : item.comum
  );
  
  return (
    <>
      <nav className={`navbar ${isHomePage ? 'navbar-home' : ''}`}>
        <div className="navbar-esquerda">
          <img
            src={logoAsaEscuro}
            alt="ASA - Ação Solidária Adventista"
            className="navbar-logo"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/home")}
          />
          {isHomePage && tipoUsuario === "2" && (
            <Botao
              className={`navbar-botao ${isFilaEsperaPage ? 'navbar-botao-active' : ''}`}
              style={{
                background: isFilaEsperaPage ? "rgba(217, 194, 126, 0.2)" : "none",
                color: isFilaEsperaPage ? "#BF7E04" : "#264040",
                fontSize: 18,
                fontWeight: 500,
                boxShadow: "none",
                padding: "0 18px",
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginLeft: 20,
                transform: isFilaEsperaPage ? "translateY(-1px)" : "none"
              }}
              onClick={() => navigate("/fila-espera")}
              texto={null}
            >
              <img src={iconeRelogio} alt="Fila de Espera" className="navbar-icone" />
              Fila de Espera
            </Botao>
          )}
        </div>
        <div className="navbar-direita">
          <Botao
            className={`navbar-botao ${isPerfilPage ? 'navbar-botao-active' : ''}`}
            style={{
              background: isPerfilPage ? "rgba(217, 194, 126, 0.2)" : "none",
              color: isPerfilPage ? "#BF7E04" : "#F2F2F2",
              fontSize: 18,
              fontWeight: 500,
              boxShadow: "none",
              padding: "0 18px",
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transform: isPerfilPage ? "translateY(-1px)" : "none"
            }}
            onClick={() => navigate("/perfil")}
            texto={null}
          >
            <img src={iconeUsuario} alt="Usuário" className="navbar-icone" />
            Olá, {nomeUsuario}!
          </Botao>
          <Botao
            className="navbar-botao"
            style={{
              background: "none",
              color: "#F2F2F2",
              fontSize: 18,
              fontWeight: 500,
              boxShadow: "none",
              padding: "0 18px",
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
            onClick={() => navigate("/")}
            texto={null}
          >
            <img src={iconeSair} alt="Sair" className="navbar-icone" />
            Sair
          </Botao>
        </div>
      </nav>
      {showMenuBar && (
        <div className="navbar-menu-bar">
          {!isHomePage && menuItems.map((item, idx) => (
            <button
              key={idx}
              className={`navbar-menu-item ${
                (isCestasPage && item.texto === "Cestas") || 
                (isFilaEsperaPage && item.texto === "Fila de Espera") ||
                (isCadastroEnderecoPage && item.texto === "Cadastrar Endereços") ||
                (isEntregarCestaPage && item.texto === "Entregar Cesta") ||
                (isCadastrarBeneficiadosPage && item.texto === "Cadastrar Beneficiados") ||
                (isConsultaBeneficiadosPage && item.texto === "Consultar Beneficiados") ||
                (isVoluntariosPage && item.texto === "Voluntários") ? "navbar-menu-item-active" : ""
              }`}
              onClick={item.onClick}
            >
              {item.texto}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default Navbar;
