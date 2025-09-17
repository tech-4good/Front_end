
import React, { useState } from "react";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import "../styles/Perfil.css";
import Voltar from "../components/Voltar";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import iconeOlhoAberto from "../assets/icone-olho-aberto.png";
import iconeOlhoFechado from "../assets/icone-olho-fechado.png";
import iconeCasa from "../assets/icone-casa.png";
import iconeRelogio from "../assets/icone-relogio.png";
import { voluntarioService } from "../services/voluntarioService";

import iconeUsuario from "../assets/icone-usuario.png";
import iconeSair from "../assets/icone-sair.png";

function formatCPF(value) {
	let numbers = value.replace(/\D/g, "");
	if (numbers.length > 11) numbers = numbers.slice(0, 11);
	let formatted = numbers;
	if (numbers.length > 9) {
		formatted = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
	} else if (numbers.length > 6) {
		formatted = numbers.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
	} else if (numbers.length > 3) {
		formatted = numbers.replace(/(\d{3})(\d{0,3})/, "$1.$2");
	}
	return formatted;
}

function formatPhone(value) {
	let numbers = value.replace(/\D/g, "");
	if (numbers.length > 11) numbers = numbers.slice(0, 11);
	if (numbers.length === 0) return "";
	if (numbers.length < 3) return `(${numbers}`;
	if (numbers.length < 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
	if (numbers.length <= 10) {
		return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`.replace(/-$/, "");
	}
	return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`.replace(/-$/, "");
}


export default function Perfil() {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [nome, setNome] = useState(sessionStorage.getItem("nomeUsuario") || "");
	const [telefone, setTelefone] = useState(sessionStorage.getItem("telefoneUsuario") || "");
	const [email, setEmail] = useState(sessionStorage.getItem("emailUsuario") || "");
	const [senha, setSenha] = useState("");
	const [cpf, setCpf] = useState(sessionStorage.getItem("cpfUsuario") || "");
	const [nomeUsuario, setNomeUsuario] = useState(sessionStorage.getItem("nomeUsuario") || "Usuário");

	// Recupera tipoUsuario do sessionStorage 
	const [tipoUsuario, setTipoUsuario] = useState("2");
	React.useEffect(() => {
		const tipo = sessionStorage.getItem("tipoUsuario") || "2";
		setTipoUsuario(tipo);
	}, []);

	const botoesNavbar = [
		{ texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
		{ texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario, destaque: true },
		...(tipoUsuario === "2" ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }] : []),
		{ texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
	];

	const handleNomeChange = (e) => setNome(e.target.value);
	const handleTelefoneChange = (e) => {
		setTelefone(formatPhone(e.target.value));
	};
	const handleEmailChange = (e) => setEmail(e.target.value);
	const handleSenhaChange = (e) => setSenha(e.target.value);
	const handleCpfChange = (e) => {
		setCpf(formatCPF(e.target.value));
	};

	const handleTogglePassword = () => {
		setShowPassword((prev) => !prev);
	};

	const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const regexCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
	const regexTelefone = /^\(\d{2}\) \d{4,5}-\d{4}$/;

	const [erros, setErros] = useState({});


	const [modalOpen, setModalOpen] = useState(false);
	const [modalMsg, setModalMsg] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		let newErros = {};
		if (!nome || nome.length > 200) newErros.nome = "Nome obrigatório (máx 200)";
		if (!regexCPF.test(cpf)) newErros.cpf = "CPF inválido";
		if (!regexTelefone.test(telefone)) newErros.telefone = "Telefone inválido";
		if (!regexEmail.test(email)) newErros.email = "E-mail inválido";
		if (senha.length < 5 || senha.length > 12) newErros.senha = "Senha 5-12 caracteres";
		setErros(newErros);
		if (Object.keys(newErros).length === 0) {
			const id = sessionStorage.getItem('userId');
			if (!id) {
				setModalMsg('ID do usuário não encontrado. Faça login novamente.');
				setModalOpen(true);
				return;
			}
			const dados = {
				nome,
				telefone,
				email,
				senha,
				cpf
			};
			console.log('Dados para atualização:', dados); // Debug log
			const result = await voluntarioService.atualizar(id, dados);
			if (result.success) {
				setModalMsg('Informações alteradas com sucesso!');
				setNome(nome);
				setNomeUsuario(nome); // Update nomeUsuario state for navbar
				sessionStorage.setItem("nomeUsuario", nome);
				setEmail(email);
				sessionStorage.setItem("emailUsuario", email);
			} else {
				setModalMsg(result.error || 'Erro ao atualizar informações.');
			}
			setModalOpen(true);
		}
	};

	// Removido: const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";
	return (
		<div>
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
			<div className="perfil-container">
				<Voltar onClick={() => navigate("/home")} />
				<h1 className="perfil-title">Perfil</h1>
				<form className="perfil-form" onSubmit={handleSubmit}>
					<div className="perfil-row">
						<div className="perfil-field">
							<Input
								label="Nome Completo:"
								type="text"
								name="nome"
								value={nome}
								onChange={handleNomeChange}
								autoComplete="off"
								maxLength={200}
								style={erros.nome ? { border: '2px solid #e74c3c' } : {}}
								placeholder="Nome Completo"
							/>
							{erros.nome && <span style={{ color: '#e74c3c', fontSize: 13 }}>{erros.nome}</span>}
						</div>
						<div className="perfil-field">
							<Input
								label="Telefone:"
								type="text"
								name="telefone"
								value={telefone}
								onChange={handleTelefoneChange}
								autoComplete="off"
								maxLength={15}
								style={erros.telefone ? { border: '2px solid #e74c3c' } : {}}
								placeholder="(00) 00000-0000"
							/>
							{erros.telefone && <span style={{ color: '#e74c3c', fontSize: 13 }}>{erros.telefone}</span>}
						</div>
					</div>
					<div className="perfil-row">
						<div className="perfil-field">
							<Input
								label="E-mail:"
								type="email"
								name="email"
								value={email}
								onChange={handleEmailChange}
								autoComplete="off"
								style={erros.email ? { border: '2px solid #e74c3c' } : {}}
								placeholder="E-mail"
							/>
							{erros.email && <span style={{ color: '#e74c3c', fontSize: 13 }}>{erros.email}</span>}
						</div>
						<div className="perfil-field perfil-senha-field">
							<Input
								label="Senha:"
								type="password"
								name="senha"
								value={senha}
								onChange={handleSenhaChange}
								autoComplete="off"
								minLength={5}
								maxLength={12}
								style={erros.senha ? { border: '2px solid #e74c3c' } : {}}
								placeholder="Senha"
								isPassword={true}
							/>
							{erros.senha && <span style={{ color: '#e74c3c', fontSize: 13 }}>{erros.senha}</span>}
						</div>
					</div>
					<div className="perfil-row">
						<div className="perfil-field">
							<Input
								label="CPF:"
								type="text"
								name="cpf"
								value={cpf}
								onChange={handleCpfChange}
								autoComplete="off"
								maxLength={14}
								style={erros.cpf ? { border: '2px solid #e74c3c' } : {}}
								placeholder="CPF"
							/>
							{erros.cpf && <span style={{ color: '#e74c3c', fontSize: 13 }}>{erros.cpf}</span>}
						</div>
					</div>
					<button className="perfil-btn" type="submit">
						Alterar Informações
					</button>
				</form>
				<Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} texto={modalMsg} />
			</div>
		</div>
	);
}
