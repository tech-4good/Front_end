import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import "../styles/Home.css"; 
import "../styles/ConsultaBeneficiadosMenu.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

export default function ConsultaBeneficiadosMenu() {
	const navigate = useNavigate();
	const location = useLocation();
	const [tipoUsuario, setTipoUsuario] = useState("2");
	
	const cpfSelecionado = location.state?.cpf;
	useEffect(() => {
		if (cpfSelecionado) {
			sessionStorage.setItem('cpfSelecionado', cpfSelecionado);
		}
	}, [cpfSelecionado]);

	useEffect(() => {
		const tipo = sessionStorage.getItem("tipoUsuario") || "2";
		setTipoUsuario(tipo);
	}, []);

	const botoesNavbar = [
		{ texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
		{ texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
		...(tipoUsuario === "2" ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }] : []),
		{ texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
	];

	const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";

	return (
		<div className="consulta-beneficiados-menu-bg">
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
			<div className="consulta-beneficiados-menu-container">
				<div className="consulta-beneficiados-menu-voltar">
					<Voltar onClick={() => navigate("/consulta-beneficiados-resultado", { state: { cpf: cpfSelecionado } })} />
				</div>
				<h1 className="consulta-beneficiados-menu-title">Escolha uma Opção para ver os Detalhes!</h1>
				<div className="consulta-beneficiados-menu-botoes">
					<button className="consulta-beneficiados-menu-botao" onClick={() => navigate("/consulta-informacoes-pessoais")}>Informações Pessoais</button>
					<button className="consulta-beneficiados-menu-botao" onClick={() => navigate("/consulta-endereco")}>Endereço</button>
					<button className="consulta-beneficiados-menu-botao" onClick={() => navigate("/consulta-filhos")}>Filhos</button>
				</div>
			</div>
		</div>
	);
}







