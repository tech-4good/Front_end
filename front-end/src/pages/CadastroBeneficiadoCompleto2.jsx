import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Voltar from '../components/Voltar';
import Input from '../components/Input';
import Botao from '../components/Botao';
import '../styles/CadastroBeneficiadoCompleto2.css';
import iconeCasa from '../assets/icone-casa.png';
import iconeUsuario from '../assets/icone-usuario.png';
import iconeRelogio from '../assets/icone-relogio.png';
import iconeSair from '../assets/icone-sair.png';
import { Calendar } from 'lucide-react';

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

	const botoesNavbar = [
		{ texto: 'Início', onClick: () => navigate('/home'), icone: iconeCasa },
		{ texto: 'Perfil', onClick: () => navigate('/perfil'), icone: iconeUsuario },
		...(tipoUsuario === '2' ? [{ texto: 'Fila de Espera', onClick: () => navigate('/fila-espera'), icone: iconeRelogio }] : []),
		{ texto: 'Sair', onClick: () => navigate('/'), icone: iconeSair }
	];
	const nomeUsuario = sessionStorage.getItem('nomeUsuario') || 'Usuário';

		function handleChange(e) {
			const { name, value } = e.target;
			// Bloquear números nos campos texto
			const onlyTextFields = ["nome", "estadoCivil", "escolaridade", "religiao"];
			if (onlyTextFields.includes(name)) {
				// Remove números
				const newValue = value.replace(/[0-9]/g, "");
				setForm({ ...form, [name]: newValue });
			} else {
				setForm({ ...form, [name]: value });
			}
		}
		
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
		if (erros.length > 0) {
			setModalErro({ open: true, mensagem: "Todos os campos devem estar preenchidos." });
			if (modalTimeout) clearTimeout(modalTimeout);
			const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 7000);
			setModalTimeout(timeout);
			return;
		}
		navigate('/cadastro-beneficiado-completo3');
	}

	return (
		<div className="cadastro-beneficiado-bg">
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
			<div className="cadastro-beneficiado-container">
				<div className="cadastro-beneficiado-voltar">
					<Voltar onClick={() => navigate('/cadastro-beneficiado-completo1')} />
				</div>
				<div className="cadastro-beneficiado-header">
					<h1 className="cadastro-beneficiado-title">Cadastro de Beneficiado</h1>
					<span className="cadastro-beneficiado-passo">Passo: 2/3</span>
				</div>
				<form className="cadastro-beneficiado-form" onSubmit={handleSubmit} autoComplete="off">
				{/* Modal de erro */}
				<Modal
					isOpen={modalErro.open}
					onClose={() => setModalErro({ open: false, mensagem: "" })}
					texto={modalErro.mensagem}
					showClose={true}
				/>
					<div className="cadastro-beneficiado-grid">
						<div className="cadastro-beneficiado-col">
							<div className="cadastro-beneficiado-field">
								<label htmlFor="nome">Nome Completo:</label>
								<Input
									id="nome"
									name="nome"
									placeholder="Insira o nome completo"
									value={form.nome}
									onChange={handleChange}
									className="cadastro-beneficiado-input"
								/>
							</div>
							<div className="cadastro-beneficiado-field">
								<label htmlFor="rg">RG:</label>
								<Input
									id="rg"
									name="rg"
									placeholder="Insira o RG"
									value={form.rg}
									onChange={handleRGChange}
									className="cadastro-beneficiado-input"
								/>
							</div>
							<div className="cadastro-beneficiado-field">
								<label htmlFor="telefone">Telefone:</label>
								<Input
									id="telefone"
									name="telefone"
									placeholder="(99) 99999-9999"
									value={form.telefone}
									onChange={handlePhoneChange}
									className="cadastro-beneficiado-input"
									maxLength={15}
								/>
							</div>
							<div className="cadastro-beneficiado-field">
								<label htmlFor="escolaridade">Escolaridade:</label>
								<Input
									id="escolaridade"
									name="escolaridade"
									placeholder="Insira seu nível de Escolaridade"
									value={form.escolaridade}
									onChange={handleChange}
									className="cadastro-beneficiado-input"
								/>
							</div>
						</div>
						<div className="cadastro-beneficiado-col">
							<div className="cadastro-beneficiado-field">
								<label htmlFor="cpf">CPF:</label>
								<Input
									id="cpf"
									name="cpf"
									placeholder="000.000.000-00"
									value={form.cpf}
									onChange={handleCPFChange}
									className="cadastro-beneficiado-input"
									maxLength={14}
								/>
							</div>
							<div className="cadastro-beneficiado-field" style={{ position: 'relative' }}>
								<label htmlFor="nascimento">Data de Nascimento:</label>
								<Input
									id="nascimento"
									name="nascimento"
									placeholder="dd/mm/aaaa"
									value={form.nascimento}
									onChange={handleDateChange}
									className="cadastro-beneficiado-input"
								/>
								<span style={{ position: 'absolute', right: 18, top: 38 }}><Calendar size={24} /></span>
							</div>
							<div className="cadastro-beneficiado-field">
								<label htmlFor="estadoCivil">Estado Civil:</label>
								<Input
									id="estadoCivil"
									name="estadoCivil"
									placeholder="Solteiro"
									value={form.estadoCivil}
									onChange={handleChange}
									className="cadastro-beneficiado-input"
								/>
							</div>
							<div className="cadastro-beneficiado-field">
								<label htmlFor="religiao">Religião:</label>
								<Input
									id="religiao"
									name="religiao"
									placeholder="Insira sua Religião"
									value={form.religiao}
									onChange={handleChange}
									className="cadastro-beneficiado-input"
								/>
							</div>
						</div>
					</div>
					<div className="cadastro-beneficiado-btn-row">
						<Botao texto="Próximo" type="submit" className="cadastrobeneficiado-botao" />
					</div>
				</form>
			</div>
		</div>
	);
}
