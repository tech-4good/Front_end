
import React from "react";
import "../styles/Navbar.css";
import Botao from "./Botao";

import logo from "../assets/icone-logo-tech.png";
import iconeUsuario from "../assets/icone-usuario.png";

const Navbar = ({ nomeUsuario = "Usuário", botoes = [], onUsuarioClick }) => {
	return (
		<nav className="navbar">
			<div className="navbar-esquerda">
				<img src={logo} alt="Logo" className="navbar-logo" />
				<span className="navbar-titulo">Tech For Good</span>
				<Botao
					className="navbar-usuario-botao"
					style={{
						background: "none",
						color: "#222",
						fontSize: 18,
						fontWeight: 500,
						boxShadow: "none",
						padding: 0,
						minWidth: 0,
						display: "flex",
						alignItems: "center",
						gap: 6
					}}
					onClick={onUsuarioClick}
					texto={null}
				>
					<img src={iconeUsuario} alt="Usuário" className="navbar-icone-usuario" />
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
