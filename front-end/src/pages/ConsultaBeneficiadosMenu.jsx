import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/ConsultaBeneficiadosMenu.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import iconeVoltar from "../assets/icone-voltar.png";
import iconeInformacoes from "../assets/icone-usuario.png";
import iconeEndereco from "../assets/icone-casa.png";
import iconeFilhos from "../assets/icone-usuarios.png";

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
		<div className="consulta-beneficiados-menu-container">
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isConsultaBeneficiadosPage={true} />
			<img 
				src={iconeVoltar} 
				alt="Voltar" 
				className="consulta-beneficiados-menu-voltar"
				onClick={() => navigate("/consulta-beneficiados-resultado", { state: { cpf: cpfSelecionado } })}
			/>
			<div className="consulta-beneficiados-menu-content">
				<div className="consulta-beneficiados-menu-title">Escolha uma Opção para ver os Detalhes!</div>
				<div className="consulta-beneficiados-menu-grid">
					<div className="consulta-beneficiados-menu-card-item" onClick={() => navigate("/consulta-informacoes-pessoais")}>
						<h3 className="consulta-beneficiados-menu-card-title">Informações Pessoais</h3>
						<div className="consulta-beneficiados-menu-card-icon">
							<img src={iconeInformacoes} alt="Informações Pessoais" />
						</div>
					</div>
					<div className="consulta-beneficiados-menu-card-item" onClick={() => navigate("/consulta-endereco")}>
						<h3 className="consulta-beneficiados-menu-card-title">Endereço</h3>
						<div className="consulta-beneficiados-menu-card-icon">
							<img src={iconeEndereco} alt="Endereço" />
						</div>
					</div>
					<div className="consulta-beneficiados-menu-card-item" onClick={() => navigate("/consulta-filhos")}>
						<h3 className="consulta-beneficiados-menu-card-title">Filhos</h3>
						<div className="consulta-beneficiados-menu-card-icon">
							<img src={iconeFilhos} alt="Filhos" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}







