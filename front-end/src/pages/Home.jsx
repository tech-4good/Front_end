import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import "../styles/Home.css";

import iconeCasa from "../assets/icone-casa.png";
import iconeUsuarios from "../assets/icone-usuarios.png";
import iconeCaixaEnviando from "../assets/icone-caixa-enviando.png";
import iconeLupa from "../assets/icone-lupa.png";
import iconeSetaSubindo from "../assets/icone-seta-subindo.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeCaixaAberta from "../assets/icone-caixa-aberta.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeSair from "../assets/icone-sair.png";


const allCards = [
	{
		titulo: "Cadastrar Endereço",
		icone: <img src={iconeCasa} alt="Cadastrar Endereço" />,
		rota: "/cadastro-endereco",
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
		titulo: "Entregar Cesta",
		icone: <img src={iconeCaixaEnviando} alt="Entregar Cesta" />,
		rota: "/doar-cesta",
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
		titulo: "Relatório",
		icone: <img src={iconeSetaSubindo} alt="Relatório" />,
		rota: "/painel-menu",
		admin: true,
		comum: false,
	},
	{
		titulo: "Histórico de Cestas",
		icone: <img src={iconeRelogio} alt="Histórico de Cestas" />,
		rota: "/historico-doacoes",
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

	const cards = allCards.filter(card =>
		tipoUsuario === "2" ? card.admin : card.comum
	);

	const botoesNavbar = [
		{ texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
		{ texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
		...(tipoUsuario === "2" ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }] : []),
		{ texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
	];

		
		const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";
		return (
			<div className="home-page">
				<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
				<div className="home-content">
				<div className="home-title">Central de Acesso</div>
				<div className="home-subtitle">Escolha uma das opções abaixo para acessar as informações desejadas</div>
				   <div className={`card-grid${cards.length === 6 ? ' tres-colunas' : ''}`}>
					   {cards.map((card, idx) => (
						   <Card
							   key={idx}
							   titulo={card.titulo}
							   icone={card.icone}
							   textoBotao="Acessar"
							   onClickBotao={() => navigate(card.rota)}
						   />
					   ))}
				   </div>
			</div>
		</div>
	);
};

export default Home;

