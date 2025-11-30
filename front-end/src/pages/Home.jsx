import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/Home.css";

import iconeCasa from "../assets/icone-casa.png";
import iconeUsuarios from "../assets/icone-usuarios.png";
import iconeCaixaEnviando from "../assets/icone-caixa-enviando.png";
import iconeLupa from "../assets/icone-lupa.png";
import iconeSetaSubindo from "../assets/icone-seta-subindo.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeCaixaAberta from "../assets/icone-caixa-aberta.png";
import iconeUsuario from "../assets/icone-usuario.png";


const allCards = [
	{
		titulo: "Entregar Cesta",
		icone: <img src={iconeCaixaEnviando} alt="Entregar Cesta" />,
		rota: "/doar-cesta",
		admin: true,
		comum: true,
	},
	{
		titulo: "Cadastrar Endereço",
		icone: <img src={iconeCasa} alt="Cadastrar Endereço" />,
		rota: "/cadastro-endereco-1",
		admin: true,
		comum: true,
	},
	{
		titulo: "Cadastrar Beneficiados",
		icone: <img src={iconeUsuarios} alt="Cadastrar Beneficiados" />,
		rota: "/cadastro-beneficiado-menu",
		admin: true,
		comum: true,
	},
	{
		titulo: "Histórico de Cestas",
		icone: <img src={iconeRelogio} alt="Histórico de Cestas" />,
		rota: "/historico-doacoes",
		admin: true,
		comum: true,
	},
	{
		titulo: "Consultar Beneficiados",
		icone: <img src={iconeLupa} alt="Consultar Beneficiados" />,
		rota: "/consulta-beneficiados",
		admin: true,
		comum: true,
	},
	{
		titulo: "Cestas",
		icone: <img src={iconeCaixaAberta} alt="Cestas" />,
		rota: "/controle-cestas",
		admin: true,
		comum: true,
	},
	{
		titulo: "Relatório",
		icone: <img src={iconeSetaSubindo} alt="Relatório" />,
		rota: "/painel-menu",
		admin: true,
		comum: false,
	},
	{
		titulo: "Voluntários",
		icone: <img src={iconeUsuario} alt="Voluntários" />,
		rota: "/voluntarios-menu",
		admin: true,
		comum: false,
	},
];


const Home = () => {
	const navigate = useNavigate();
	const [tipoUsuario, setTipoUsuario] = useState("2");

	useEffect(() => {
		const tipo = sessionStorage.getItem("tipoUsuario") || "2";
		setTipoUsuario(tipo);
	}, []);

	const cards = allCards.filter(card => {
		// Se for administrador (tipo "2"), mostra todos os cards que têm admin: true
		// Se for voluntário comum (outros tipos), mostra apenas os que têm comum: true
		return tipoUsuario === "2" ? card.admin : card.comum;
	});

		
	const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";
	return (
		<div className="home-page">
			<Navbar nomeUsuario={nomeUsuario} showMenuBar={true} tipoUsuario={tipoUsuario} isHomePage={true} />
			<div className="home-content">
				<h1 className="home-title">Central de Acesso</h1>
				<div className="home-grid">
					{cards.map((card, idx) => (
						<div key={idx} className="home-card-item" onClick={() => navigate(card.rota)}>
							<h3 className="home-card-title">{card.titulo}</h3>
							<div className="home-card-icon">
								{card.icone}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Home;

