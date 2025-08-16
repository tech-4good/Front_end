
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import Botao from "./Botao";

import logo from "../assets/icone-logo-tech.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeTextoTech from "../assets/icone-texto-tech.png";

const Navbar = ({ nomeUsuario = "Usuário", botoes = [], onUsuarioClick }) => {
       const navigate = useNavigate();
       return (
	       <nav className="navbar">
		       <div className="navbar-esquerda">
			       <img
				       src={iconeTextoTech}
				       alt="Ícone de texto tech4good"
				       className="navbar-logo"
				       style={{ cursor: "pointer" }}
				       onClick={() => navigate("/home")}
			       />
			       <span
				       className="navbar-titulo"
				       style={{ cursor: "pointer" }}
				       onClick={() => navigate("/home")}
			       >
				       Tech For Good
			       </span>
			       <Botao
				       className="navbar-botao"
				       style={{
					       background: "none",
					       color: "#111",
					       fontSize: 24,
					       fontWeight: 500,
					       boxShadow: "none",
					       padding: "0 18px",
					       minWidth: 0,
					       display: "flex",
					       alignItems: "center",
					       gap: 8
				       }}
				       onClick={() => navigate("/perfil")}
				       texto={null}
			       >
				       <img src={iconeUsuario} alt="Usuário" className="navbar-icone" />
				       Olá, {nomeUsuario}
			       </Botao>
		       </div>
		       <div className="navbar-direita">
			       {botoes.map((btn, idx) => (
				       <Botao
					       key={idx}
					       texto={btn.texto}
					       onClick={btn.onClick}
					       className="navbar-botao"
					       style={{
						       background: "none",
						       color: "#111",
						       fontSize: 24,
						       fontWeight: btn.destaque ? 700 : 500,
						       boxShadow: "none",
						       padding: "0 18px",
						       minWidth: 0,
						       display: "flex",
						       alignItems: "center",
						       gap: 8
					       }}
					       {...(btn.icone && { children: <img src={btn.icone} alt="" className="navbar-icone" /> })}
				       />
			       ))}
		       </div>
	       </nav>
       );
};

export default Navbar;
