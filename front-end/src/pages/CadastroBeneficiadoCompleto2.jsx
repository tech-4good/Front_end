import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Voltar from '../components/Voltar';
import Input from '../components/Input';
import Botao from '../components/Botao';
import '../styles/CadastroBeneficiadoSimples2.css';
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
		setForm({ ...form, [e.target.name]: e.target.value });
	}

	function handleSubmit(e) {
		e.preventDefault();
		// lógica de envio
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
									onChange={handleChange}
									className="cadastro-beneficiado-input"
								/>
							</div>
							<div className="cadastro-beneficiado-field">
								<label htmlFor="telefone">Telefone:</label>
								<Input
									id="telefone"
									name="telefone"
									placeholder="(99) 9999-99999"
									value={form.telefone}
									onChange={handleChange}
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
									onChange={handleChange}
									className="cadastro-beneficiado-input"
									maxLength={14}
								/>
							</div>
							<div className="cadastro-beneficiado-field" style={{ position: 'relative' }}>
								<label htmlFor="nascimento">Data de Nascimento:</label>
								<Input
									id="nascimento"
									name="nascimento"
									placeholder="dia/mês/ano"
									value={form.nascimento}
									onChange={handleChange}
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
