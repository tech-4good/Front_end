import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Input from '../components/Input';
import Select from '../components/Select';
import Botao from '../components/Botao';
import Modal from '../components/Modal';
import '../styles/CadastroBeneficiadoCompleto2.css';
import iconeCasa from '../assets/icone-casa.png';
import iconeUsuario from '../assets/icone-usuario.png';
import iconeRelogio from '../assets/icone-relogio.png';
import iconeSair from '../assets/icone-sair.png';
import iconeVoltar from '../assets/icone-voltar.png';


export default function CadastroBeneficiadoCompleto2() {
	const [form, setForm] = useState({
		nome: '',
		rg: '',
		telefone: '',
		escolaridade: '',
		cpf: '',
		nascimento: '',
		estadoCivil: '',
		religiao: '',
	});
	const [modalErro, setModalErro] = useState({ open: false, mensagem: '' });
	const [modalTimeout, setModalTimeout] = useState(null);
	const [tipoUsuario, setTipoUsuario] = useState('2');
	const navigate = useNavigate();

	useEffect(() => {
		const tipo = sessionStorage.getItem('tipoUsuario') || '2';
		setTipoUsuario(tipo);
	}, []);

	// Timeouts automáticos para modais (3 segundos)
	useEffect(() => {
		if (modalErro.open) {
			const timeout = setTimeout(() => setModalErro({ open: false, mensagem: '' }), 3000);
			return () => clearTimeout(timeout);
		}
	}, [modalErro.open]);

	const botoesNavbar = [
		{ texto: 'Início', onClick: () => navigate('/home'), icone: iconeCasa },
		{ texto: 'Perfil', onClick: () => navigate('/perfil'), icone: iconeUsuario },
		...(tipoUsuario === '2' ? [{ texto: 'Fila de Espera', onClick: () => navigate('/fila-espera'), icone: iconeRelogio }] : []),
		{ texto: 'Sair', onClick: () => navigate('/'), icone: iconeSair }
	];
	const nomeUsuario = sessionStorage.getItem('nomeUsuario') || 'Usuário';

	function handleChange(e) {
		const { name, value } = e.target;
		console.log('handleChange - name:', name, 'value:', value); // Debug
		
		// Validação especial para campos que devem ter apenas letras e espaços simples
		const textOnlyFields = ["nome", "escolaridade", "religiao"];
		if (textOnlyFields.includes(name)) {
			// Remove números e caracteres especiais, mantém apenas letras e espaços
			let newValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
			// Remove dois espaços seguidos
			newValue = newValue.replace(/\s{2,}/g, " ");
			setForm({ ...form, [name]: newValue });
		} else {
			setForm({ ...form, [name]: value });
		}
	}	function formatCPF(value) {
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

	function formatDate(value) {
		let numbers = value.replace(/\D/g, "");
		if (numbers.length > 8) numbers = numbers.slice(0, 8);
		if (numbers.length <= 2) return numbers;
		if (numbers.length <= 4) return numbers.replace(/(\d{2})(\d{0,2})/, "$1/$2");
		return numbers.replace(/(\d{2})(\d{2})(\d{0,4})/, "$1/$2/$3");
	}

	function formatRG(value) {
			let numbers = value.replace(/\D/g, "");
			if (numbers.length > 9) numbers = numbers.slice(0, 9);
			if (numbers.length <= 2) return numbers;
			if (numbers.length <= 5) return numbers.replace(/(\d{2})(\d{0,3})/, "$1.$2");
			if (numbers.length <= 8) return numbers.replace(/(\d{2})(\d{3})(\d{0,3})/, "$1.$2.$3");
			return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
		}

	function formatPhone(value) {
		let numbers = value.replace(/\D/g, "");
		if (numbers.length > 11) numbers = numbers.slice(0, 11);
		if (numbers.length === 0) return "";
		if (numbers.length < 3) return `(${numbers}`;
		if (numbers.length < 7)
			return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
		if (numbers.length <= 10) {
			return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`.replace(/-$/, "");
		}
		return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`.replace(/-$/, "");
	}

	function handleCPFChange(e) {
		const raw = e.target.value;
		setForm({ ...form, cpf: formatCPF(raw) });
	}

	function handlePhoneChange(e) {
		const raw = e.target.value;
		setForm({ ...form, telefone: formatPhone(raw) });
	}

	function handleDateChange(e) {
		const raw = e.target.value;
		setForm({ ...form, nascimento: formatDate(raw) });
	}

	function handleRGChange(e) {
		const raw = e.target.value;
		setForm({ ...form, rg: formatRG(raw) });
	}

	function validarNome(nome) {
		if (nome.length > 200) return "O nome deve ter no máximo 200 caracteres.";
		if (/(.)\1{2,}/.test(nome))
			return "O nome não pode ter mais de 3 caracteres iguais seguidos.";
		return null;
	}

	function validarCamposPreenchidos(obj) {
		for (const key in obj) {
			if (!obj[key] || String(obj[key]).trim() === "")
				return "Todos os campos devem estar preenchidos.";
		}
		return null;
	}

	function handleSubmit(e) {
		e.preventDefault();
		let erros = [];
		const camposMsg = validarCamposPreenchidos(form);
		if (camposMsg) erros.push(camposMsg);
		const nomeMsg = validarNome(form.nome);
		if (nomeMsg) erros.push(nomeMsg);
		// Bug 3 Fix: Validar CPF
		const cpfMsg = validarCPF(form.cpf);
		if (cpfMsg) erros.push(cpfMsg);
		if (erros.length > 0) {
			setModalErro({ open: true, mensagem: erros[0] }); // Mostrar primeiro erro
			if (modalTimeout) clearTimeout(modalTimeout);
			const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 7000);
			setModalTimeout(timeout);
			return;
		}
		
		// Salvar dados da etapa 2 para usar na etapa 3
		sessionStorage.setItem("dadosCompleto2", JSON.stringify(form));
		navigate('/cadastro-beneficiado-completo3');
	}

	return (
		<div className="cadastro-completo2-bg">
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isCadastrarBeneficiadosPage={true} />
			
			<div className="cadastro-completo2-container">
				<img 
					src={iconeVoltar} 
					alt="Voltar" 
					className="cadastro-completo2-icone-voltar"
					onClick={() => navigate("/cadastro-beneficiado-completo1")}
				/>
				
				<h1 className="cadastro-completo2-title">Cadastro de Beneficiado</h1>
				
				{/* Indicador de progresso */}
				<div className="cadastro-completo2-progress-container">
					<div className="cadastro-completo2-progress-step completed">
						<div className="cadastro-completo2-progress-circle"></div>
						<span className="cadastro-completo2-progress-label">Passo 1</span>
					</div>
					<div className="cadastro-completo2-progress-line completed"></div>
					<div className="cadastro-completo2-progress-step active">
						<div className="cadastro-completo2-progress-circle"></div>
						<span className="cadastro-completo2-progress-label">Passo 2</span>
					</div>
					<div className="cadastro-completo2-progress-line"></div>
					<div className="cadastro-completo2-progress-step">
						<div className="cadastro-completo2-progress-circle"></div>
						<span className="cadastro-completo2-progress-label">Passo 3</span>
					</div>
				</div>

			<form className="cadastro-completo2-form" onSubmit={handleSubmit} autoComplete="off">
				{/* Primeira linha - Nome, RG, CPF */}
				<div className="cadastro-completo2-row-triple">
					<div className="cadastro-completo2-field">
						<label className="cadastro-completo2-label">Nome Completo:</label>
						<Input
							name="nome"
							placeholder="Insira o nome completo"
							value={form.nome}
							onChange={handleChange}
							className="cadastro-completo2-input"
						/>
					</div>
					<div className="cadastro-completo2-field">
						<label className="cadastro-completo2-label">RG:</label>
						<Input
							name="rg"
							placeholder="Insira o RG"
							value={form.rg}
							onChange={handleRGChange}
							className="cadastro-completo2-input"
						/>
					</div>
					<div className="cadastro-completo2-field">
						<label className="cadastro-completo2-label">CPF:</label>
						<Input
							name="cpf"
							placeholder="000.000.000-00"
							value={form.cpf}
							onChange={handleCPFChange}
							className="cadastro-completo2-input"
							maxLength={14}
						/>
					</div>
				</div>

				{/* Segunda linha - Telefone, Data de Nascimento, Estado Civil */}
				<div className="cadastro-completo2-row-triple">
					<div className="cadastro-completo2-field">
						<label className="cadastro-completo2-label">Telefone:</label>
						<Input
							name="telefone"
							placeholder="(99) 99999-9999"
							value={form.telefone}
							onChange={handlePhoneChange}
							className="cadastro-completo2-input"
							maxLength={15}
						/>
					</div>
					<div className="cadastro-completo2-field">
						<label className="cadastro-completo2-label">Data de Nascimento:</label>
						<Input
							name="nascimento"
							placeholder="dd/mm/aaaa"
							value={form.nascimento}
							onChange={handleDateChange}
							className="cadastro-completo2-input"
						/>
					</div>
					<div className="cadastro-completo2-field">
						<label className="cadastro-completo2-label">Estado Civil:</label>
						<Select
							name="estadoCivil"
							value={form.estadoCivil}
							onChange={handleChange}
							placeholder="Selecione seu estado civil"
							className="cadastro-completo2-input"
							options={[
								{ value: 'SOLTEIRO', label: 'Solteiro(a)' },
								{ value: 'CASADO', label: 'Casado(a)' },
								{ value: 'DIVORCIADO', label: 'Divorciado(a)' },
								{ value: 'VIUVO', label: 'Viúvo(a)' },
								{ value: 'SEPARADO', label: 'Separado(a)' }
							]}
						/>
					</div>
				</div>

				{/* Terceira linha - Religião, Escolaridade */}
				<div className="cadastro-completo2-row-triple">
					<div className="cadastro-completo2-field">
						<label className="cadastro-completo2-label">Religião:</label>
						<Input
							name="religiao"
							placeholder="Insira sua Religião"
							value={form.religiao}
							onChange={handleChange}
							className="cadastro-completo2-input"
						/>
					</div>
					<div className="cadastro-completo2-field">
						<label className="cadastro-completo2-label">Escolaridade:</label>
						<Input
							name="escolaridade"
							placeholder="Insira seu nível de Escolaridade"
							value={form.escolaridade}
							onChange={handleChange}
							className="cadastro-completo2-input"
						/>
					</div>
					<div className="cadastro-completo2-field">
						{/* Campo vazio para manter o layout 3x3 */}
					</div>
				</div>

					<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-5px', width: 'calc(100% + 55px)' }}>
						<Botao 
							texto="Voltar" 
							onClick={() => navigate("/cadastro-beneficiado-completo1")}
							className="cadastro-simples-btn" 
							style={{ position: 'relative', left: '-275px' }}
						/>
						<Botao texto="Próximo" type="submit" className="cadastro-simples-btn" />
					</div>
				</form>
			</div>

			<Modal
				isOpen={modalErro.open}
				onClose={() => setModalErro({ open: false, mensagem: "" })}
				texto={modalErro.mensagem}
				showClose={false}
			/>
		</div>
	);
}
