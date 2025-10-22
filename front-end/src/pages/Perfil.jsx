
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
	const [nome, setNome] = useState("");
	const [telefone, setTelefone] = useState("");
	const [email, setEmail] = useState("");
	const [senha, setSenha] = useState("");
	const [cpf, setCpf] = useState("");
	const [nomeUsuario, setNomeUsuario] = useState(sessionStorage.getItem("nomeUsuario") || "Usuário");
	const [carregando, setCarregando] = useState(true);
	const [erro, setErro] = useState("");

	// Recupera tipoUsuario do sessionStorage 
	const [tipoUsuario, setTipoUsuario] = useState("2");
	
	// Carregar dados do voluntário ao montar o componente
	React.useEffect(() => {
		const tipo = sessionStorage.getItem("tipoUsuario") || "2";
		setTipoUsuario(tipo);
		
		carregarDadosVoluntario();
	}, []);
	
	const carregarDadosVoluntario = async () => {
		try {
			setCarregando(true);
			setErro("");
			
			const userId = sessionStorage.getItem("userId");
			if (!userId) {
				setErro("ID do usuário não encontrado. Faça login novamente.");
				return;
			}
			
			console.log('Carregando dados do voluntário ID:', userId);
			const response = await voluntarioService.buscarPorId(userId);
			
			if (response.success) {
				console.log('✅ Dados do voluntário carregados:', response.data);
				const dados = response.data;
				
				// Backend pode retornar 'nome' ou 'nomeCompleto'
				const nomeUsuarioAtual = dados.nomeCompleto || dados.nome || "";
				
				// Preencher os campos com os dados do backend
				setNome(nomeUsuarioAtual);
				setNomeUsuario(nomeUsuarioAtual);
				setEmail(dados.email || "");
				
				// Formatar CPF e telefone (já podem vir formatados ou não)
				if (dados.cpf) {
					const cpfFormatado = formatCPF(dados.cpf);
					setCpf(cpfFormatado);
					console.log('📋 CPF carregado:', cpfFormatado);
				}
				if (dados.telefone) {
					const telefoneFormatado = formatPhone(dados.telefone);
					setTelefone(telefoneFormatado);
					console.log('📱 Telefone carregado:', telefoneFormatado);
				}
				
				// Atualizar sessionStorage com dados atualizados
				sessionStorage.setItem("nomeUsuario", nomeUsuarioAtual);
				sessionStorage.setItem("emailUsuario", dados.email || "");
			} else {
				console.error('Erro ao carregar dados:', response.error);
				setErro(response.error || "Erro ao carregar dados do perfil");
			}
		} catch (error) {
			console.error('Erro inesperado:', error);
			setErro("Erro inesperado ao carregar dados");
		} finally {
			setCarregando(false);
		}
	};

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
		
		// ⚠️ Validações apenas para telefone e email (campos que o backend aceita)
		if (!regexTelefone.test(telefone)) newErros.telefone = "Telefone inválido";
		if (!regexEmail.test(email)) newErros.email = "E-mail inválido";
		
		// Campos abaixo são apenas para exibição (não serão atualizados)
		if (!nome || nome.length > 200) {
			console.warn('⚠️ Nome não será atualizado (backend não suporta)');
		}
		if (!regexCPF.test(cpf)) {
			console.warn('⚠️ CPF não será atualizado (backend não suporta)');
		}
		if (senha && (senha.length < 5 || senha.length > 12)) {
			console.warn('⚠️ Senha não será atualizada (backend não suporta)');
		}
		
		setErros(newErros);
		
		if (Object.keys(newErros).length === 0) {
			const id = sessionStorage.getItem('userId');
			if (!id) {
				setModalMsg('ID do usuário não encontrado. Faça login novamente.');
				setModalOpen(true);
				return;
			}
			
			// ⚠️ IMPORTANTE: Backend atual só aceita TELEFONE e EMAIL
			// Nome, CPF e senha NÃO são atualizados pelo endpoint PATCH /voluntarios/{id}
			
			// Remover formatação do telefone
			const telefoneLimpo = telefone.replace(/\D/g, '');
			
			// Montar payload (APENAS telefone e email)
			const dados = {
				telefone: telefoneLimpo,  // sem formatação
				email: email.toLowerCase().trim()
			};
			
			console.log('📝 Dados para atualização (telefone e email apenas):', dados);
			console.log('⚠️ Aviso: Nome, CPF e senha não serão atualizados (backend não suporta)');
			
			try {
				const result = await voluntarioService.atualizar(id, dados);
				
				if (result.success) {
					setModalMsg('Informações alteradas com sucesso!');
					sessionStorage.setItem("emailUsuario", email);
					
					// Limpar senha após tentativa de atualização
					setSenha('');
					
					// Recarregar dados atualizados do backend
					await carregarDadosVoluntario();
				} else {
					setModalMsg(result.error || 'Erro ao atualizar informações.');
				}
			} catch (error) {
				console.error('Erro ao atualizar:', error);
				setModalMsg('Erro inesperado ao atualizar informações.');
			}
			
			setModalOpen(true);
		}
	};

	return (
		<div>
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
			<div className="perfil-container">
				<Voltar onClick={() => navigate("/home")} />
				<h1 className="perfil-title">Perfil</h1>
				
				{carregando && (
					<div style={{ textAlign: 'center', padding: '20px' }}>
						<p>Carregando seus dados...</p>
					</div>
				)}
				
				{erro && (
					<div style={{ textAlign: 'center', padding: '20px', color: '#e74c3c' }}>
						<p>{erro}</p>
						<button onClick={carregarDadosVoluntario} style={{ marginTop: '10px', padding: '8px 16px' }}>
							Tentar Novamente
						</button>
					</div>
				)}
				
				{!carregando && !erro && (
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
								disabled={true}
								style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', opacity: 0.7 }}
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
								disabled={true}
								style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', opacity: 0.7 }}
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
								disabled={true}
								style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', opacity: 0.7 }}
								placeholder="CPF"
							/>
							{erros.cpf && <span style={{ color: '#e74c3c', fontSize: 13 }}>{erros.cpf}</span>}
						</div>
					</div>
					<button className="perfil-btn" type="submit">
						Alterar Informações
					</button>
				</form>
				)}
				<Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} texto={modalMsg} />
			</div>
		</div>
	);
}
