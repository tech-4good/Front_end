
import React, { useState } from "react";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import "../styles/Perfil.css";
import Navbar from "../components/Navbar";
import iconeVoltar from "../assets/icone-voltar.png";
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
	
	// 📝 Variável para guardar o email original (quando entra na tela)
	const [emailOriginal, setEmailOriginal] = useState('');

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
				
				// 🔒 GUARDAR EMAIL ORIGINAL (só na primeira vez que entra na tela)
				setEmailOriginal(dados.email || "");
				console.log('🔒 Email original capturado:', dados.email || "");
				
				// Formatar CPF e telefone (já podem vir formatados ou não)
				if (dados.cpf) {
					const cpfFormatado = formatCPF(dados.cpf);
					setCpf(cpfFormatado);
					sessionStorage.setItem("cpfUsuario", cpfFormatado);
					console.log('📋 CPF carregado:', cpfFormatado);
				}
				if (dados.telefone) {
					const telefoneFormatado = formatPhone(dados.telefone);
					setTelefone(telefoneFormatado);
					sessionStorage.setItem("telefoneUsuario", telefoneFormatado);
					console.log('📱 Telefone carregado:', telefoneFormatado);
				}
				
				// Atualizar sessionStorage com dados atualizados
				sessionStorage.setItem("nomeUsuario", nomeUsuarioAtual);
				sessionStorage.setItem("emailUsuario", dados.email || "");
			} else {
				console.error('Erro ao carregar dados da API, usando dados do sessionStorage');
				// Se a API falhar, usar dados do sessionStorage como fallback
				carregarDadosDoSessionStorage();
			}
		} catch (error) {
			console.error('Erro inesperado ao carregar dados da API, usando sessionStorage como fallback');
			// Se houver erro, usar dados do sessionStorage como fallback
			carregarDadosDoSessionStorage();
		} finally {
			setCarregando(false);
		}
	};

	const carregarDadosDoSessionStorage = () => {
		console.log('📦 Carregando dados do sessionStorage como fallback');
		const nomeUsuarioAtual = sessionStorage.getItem("nomeUsuario") || "Usuário";
		const emailUsuario = sessionStorage.getItem("emailUsuario") || "";
		const telefoneUsuario = sessionStorage.getItem("telefoneUsuario") || "";
		const cpfUsuario = sessionStorage.getItem("cpfUsuario") || "";
		
		setNome(nomeUsuarioAtual);
		setNomeUsuario(nomeUsuarioAtual);
		setEmail(emailUsuario);
		
		// 🔒 GUARDAR EMAIL ORIGINAL (do sessionStorage também)
		setEmailOriginal(emailUsuario);
		console.log('🔒 Email original capturado do sessionStorage:', emailUsuario);
		
		// Carregar telefone e CPF do sessionStorage se disponíveis
		if (telefoneUsuario) {
			setTelefone(telefoneUsuario);
			console.log('📱 Telefone carregado do sessionStorage:', telefoneUsuario);
		}
		if (cpfUsuario) {
			setCpf(cpfUsuario);
			console.log('📋 CPF carregado do sessionStorage:', cpfUsuario);
		}
		
		console.log('✅ Dados carregados do sessionStorage');
	};

	const botoesNavbar = [
		{ texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
		{ texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario, destaque: true },

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
	const regexTelefone = /^\(\d{2}\) \d{5}-\d{4}$/;

	const [erros, setErros] = useState({});


	const [modalErro, setModalErro] = useState({ open: false, mensagem: "" });
	const [modalTimeout, setModalTimeout] = useState(null);

	const mostrarModal = (mensagem) => {
		setModalErro({ open: true, mensagem });
		if (modalTimeout) clearTimeout(modalTimeout);
		const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 3000);
		setModalTimeout(timeout);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		// ⚠️ Validações apenas para telefone e email (campos que o backend aceita)
		let newErros = {};
		
		// Validações apenas para telefone e email (campos que o backend aceita)
		const telefoneLimpoValidacao = telefone.replace(/\D/g, '');
		if (!regexTelefone.test(telefone) || telefoneLimpoValidacao.length !== 11) {
			mostrarModal("Telefone deve ter exatamente 11 dígitos no formato: (XX) XXXXX-XXXX");
			return;
		}
		if (!regexEmail.test(email)) {
			mostrarModal("E-mail deve ter o formato correto: exemplo@dominio.com (deve conter @ e .)");
			return;
		}
		
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
		
		const id = sessionStorage.getItem('userId');
		console.log('🔍 Verificando ID do usuário:', id);
		console.log('🔍 Todos os dados do sessionStorage:', {
			userId: sessionStorage.getItem('userId'),
			nomeUsuario: sessionStorage.getItem('nomeUsuario'),
			emailUsuario: sessionStorage.getItem('emailUsuario'),
			tipoUsuario: sessionStorage.getItem('tipoUsuario')
		});
		
		if (!id) {
			mostrarModal('ID do usuário não encontrado. Faça login novamente.');
			return;
		}
		
		// Remover formatação do telefone
		const telefoneLimpo = telefone.replace(/\D/g, '');
		
		// Montar payload (APENAS telefone e email)
		const dados = {
			telefone: telefoneLimpo,  // sem formatação
			email: email.toLowerCase().trim()
		};
		
		console.log('📤 Dados que serão enviados para a API:', dados);
		console.log('📤 Email original para identificar usuário:', emailOriginal);
		console.log('📤 Novo email (se diferente):', email);
		
		// 🚨 VERIFICAÇÃO: Email original não pode estar vazio
		if (!emailOriginal || emailOriginal.trim() === '') {
			console.error('❌ Email original está vazio! Usando email atual como fallback');
			console.error('❌ Isso pode indicar um problema no carregamento inicial');
			// Usar email atual como fallback
			const emailParaUsar = email || sessionStorage.getItem('emailUsuario') || '';
			if (!emailParaUsar) {
				mostrarModal('Erro: não foi possível identificar seu email. Faça login novamente.');
				return;
			}
			console.log('🔄 Usando email atual como fallback:', emailParaUsar);
		}
		
		try {
			// 🔒 Determinar qual email usar para identificação
			const emailParaIdentificacao = emailOriginal && emailOriginal.trim() !== '' 
				? emailOriginal 
				: email || sessionStorage.getItem('emailUsuario') || '';
			
			console.log('🎯 Email final usado para identificação:', emailParaIdentificacao);
			
			// 🔒 USANDO EMAIL ORIGINAL (ou fallback) como identificador
			const resultado = await voluntarioService.atualizarPorEmailOriginal(emailParaIdentificacao, dados);
			console.log('📥 Resultado da API:', resultado);
			
			if (resultado.success) {
				console.log('✅ API confirmou sucesso');
				
				// 🚨 Verificar se email foi alterado (limitação do backend)
				const emailTentouMudar = email.toLowerCase().trim() !== emailOriginal.toLowerCase();
				
				if (emailTentouMudar) {
					console.warn('⚠️ Email não pôde ser alterado devido a limitações do backend');
					mostrarModal('Telefone atualizado com sucesso! Nota: O email não pôde ser alterado devido a limitações do sistema.');
					
					// Reverter email para o original
					setEmail(emailOriginal);
					sessionStorage.setItem("emailUsuario", emailOriginal);
				} else {
					mostrarModal('Informações alteradas com sucesso!');
					// Atualizar sessionStorage com os novos dados
					sessionStorage.setItem("emailUsuario", email);
				}
				
				// Sempre atualizar telefone
				sessionStorage.setItem("telefoneUsuario", telefone);
				setTelefone(telefone);
			} else {
				console.error('❌ API retornou erro:', resultado.error);
				mostrarModal(resultado.error || 'Erro ao salvar as informações');
			}
		} catch (error) {
			console.error('❌ Erro inesperado na chamada da API:', error);
			mostrarModal('Erro inesperado. Tente novamente.');
		}
		
		// Limpar senha
		setSenha('');
		
		// Tentar atualizar no backend de forma mais robusta
		try {
			console.log('🔄 Enviando dados para o backend:', dados);
			console.log('🔄 ID do usuário:', id);
			
			const result = await voluntarioService.atualizar(id, dados);
			
			console.log('📋 Resultado da atualização:', result);
			
			if (result.success) {
				console.log('✅ Dados atualizados no backend com sucesso');
			} else {
				console.warn('⚠️ Backend retornou erro:', result.error);
			}
		} catch (error) {
			console.error('❌ Erro ao atualizar no backend:', error);
			console.error('❌ Status:', error.response?.status);
			console.error('❌ Dados do erro:', error.response?.data);
		}
	};

	return (
		<div>
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isPerfilPage={true} />
			<div className="perfil-container">
				<img 
					src={iconeVoltar} 
					alt="Voltar" 
					className="perfil-icone-voltar"
					onClick={() => navigate("/home")}
				/>
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
						{/* Primeira linha - Nome Completo */}
						<div className="perfil-row perfil-row-single">
							<div className="perfil-field">
								<label className="perfil-label">Nome Completo:</label>
								<input
									type="text"
									name="nome"
									value={nome}
									onChange={handleNomeChange}
									placeholder="Insira o seu nome completo"
									autoComplete="off"
									maxLength={200}
									disabled={true}
									className="perfil-input perfil-input-disabled"
								/>
							</div>
						</div>

						{/* Segunda linha - E-mail */}
						<div className="perfil-row perfil-row-single">
							<div className="perfil-field">
								<label className="perfil-label">E-mail:</label>
								<input
									type="text"
									name="email"
									value={email}
									onChange={handleEmailChange}
									placeholder="email@dominio.com"
									autoComplete="off"
									className="perfil-input"
								/>
							</div>
						</div>

						{/* Terceira linha - CPF, Telefone e Senha */}
						<div className="perfil-row perfil-row-triple">
							<div className="perfil-field">
								<label className="perfil-label">CPF:</label>
								<input
									type="text"
									name="cpf"
									value={cpf}
									onChange={handleCpfChange}
									placeholder="000.000.000-00"
									autoComplete="off"
									maxLength={14}
									disabled={true}
									className="perfil-input perfil-input-disabled"
								/>
							</div>
							<div className="perfil-field">
								<label className="perfil-label">Telefone:</label>
								<input
									type="text"
									name="telefone"
									value={telefone}
									onChange={handleTelefoneChange}
									placeholder="(00) 00000-0000"
									autoComplete="off"
									maxLength={15}
									className="perfil-input"
								/>
							</div>
							<div className="perfil-field">
								<label className="perfil-label">Senha:</label>
								<input
									type="password"
									name="senha"
									value={senha}
									onChange={handleSenhaChange}
									placeholder="***************"
									autoComplete="off"
									minLength={5}
									maxLength={12}
									disabled={true}
									className="perfil-input perfil-input-disabled"
								/>
							</div>
						</div>

						<button className="perfil-btn" type="submit">
							Alterar Informações
						</button>
					</form>
				)}
				<div style={{ position: "fixed", top: 24, right: 24, zIndex: 2000 }}>
					<Modal
						isOpen={modalErro.open}
						onClose={() => setModalErro({ open: false, mensagem: "" })}
						texto={modalErro.mensagem}
						showClose={false}
					/>
				</div>
			</div>
		</div>
	);
}
