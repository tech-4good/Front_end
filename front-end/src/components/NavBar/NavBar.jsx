import React from "react";
import { FaHome, FaSignOutAlt } from "react-icons/fa";
import logo from "../../assets/logo.png";
import "./NavBar.css";

const NavBar = ({ userName = "Aline" }) => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <img src={logo} alt="Logo Tech For Good" className="logo-img" />
        </div>
        <span className="navbar-title">Tech For Good</span>
        <span className="navbar-user">Olá, {userName}!</span>
      </div>
      <div className="navbar-center"></div>
      <div className="navbar-right">
        <a href="/fila" className="navbar-link">
          Fila de Espera
        </a>
        <a href="/" className="navbar-link">
          <FaHome style={{ marginRight: 4 }} />
          Início
        </a>
        <a href="/perfil" className="navbar-link">
          Perfil
        </a>
        <a href="/logout" className="navbar-link">
          <FaSignOutAlt style={{ marginRight: 4 }} />
          Sair
        </a>
      </div>
    </nav>
  );
};

export default NavBar;
