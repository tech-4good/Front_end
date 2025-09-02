
import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/ConsultaBeneficiados.css';
import { FaSearch } from 'react-icons/fa';
import iconeCasa from '../assets/icone-casa.png';
import iconeUsuario from '../assets/icone-usuario.png';
import iconeRelogio from '../assets/icone-relogio.png';
import iconeSair from '../assets/icone-sair.png';
import Voltar from '../components/Voltar';

const beneficiadosFake = [
	{ cpf: "33344455566", nome: "Lucas Almeida" },
	{ cpf: "22233344455", nome: "Bruna Reginato" },
	{ cpf: "48763842135", nome: "Juliana Gomes Oliveira" },
	{ cpf: "12345678901", nome: "Carlos Silva" },
	{ cpf: "98765432100", nome: "Maria Souza" },
	{ cpf: "45678912300", nome: "Ana Paula Lima" },
	{ cpf: "11122233344", nome: "João Pedro Santos" },
];

export default function ConsultaBeneficiados() {
	const [cpf, setCpf] = useState('');
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
const [resultados, setResultados] = useState([]);
const [modalNaoEncontrado, setModalNaoEncontrado] = useState(false);
const [modalCampos, setModalCampos] = useState(false);

		function handleBuscar(e) {
			e.preventDefault();
			if (!cpf) {
				setModalCampos(true);
				return;
			}
			const existe = beneficiadosFake.some(v => v.cpf === cpf);
			if (existe) {
				navigate('/consulta-beneficiados-resultado');
			} else {
				setModalNaoEncontrado(true);
			}
		}

		function handleCpfChange(e) {
			const valor = e.target.value.replace(/\D/g, '');
			setCpf(valor);
			if (valor.length > 0) {
				const encontrados = beneficiadosFake.filter(v => v.cpf.includes(valor));
				setResultados(encontrados);
			} else {
				setResultados([]);
			}
		}

	return (
		<div className="consulta-beneficiados-bg">
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
			<div className="consulta-beneficiados-container">
				<div className="consulta-beneficiados-voltar">
					<Voltar onClick={() => navigate('/home')} />
				</div>
				<h1 className="consulta-beneficiados-title">Consulta de Beneficiados</h1>
				<form className="consulta-beneficiados-form" onSubmit={handleBuscar} autoComplete="off">
					<input
						className="consulta-beneficiados-input"
						type="text"
						placeholder="Insira o CPF"
						value={cpf}
						onChange={handleCpfChange}
						maxLength={11}
						autoFocus
					/>
					{cpf && cpf.length < 11 && resultados.length > 0 && (
						<div className="consulta-beneficiados-resultados">
							{resultados.map((v, idx) => (
								<div
									className="consulta-beneficiados-resultado"
									key={idx}
									style={{ cursor: "pointer" }}
									onClick={() => setCpf(v.cpf)}
								>
									{v.nome}
								</div>
							))}
						</div>
					)}
					<button className="consulta-beneficiados-buscar" type="submit">
						<FaSearch className="consulta-beneficiados-search-icon" /> Buscar
					</button>
				</form>
				<Modal
					isOpen={modalNaoEncontrado}
					onClose={() => setModalNaoEncontrado(false)}
					texto="Beneficiado com esse CPF não está cadastrado. Deseja cadastrar?"
					showClose={true}
					botoes={[{
						texto: 'Cadastrar',
						onClick: () => { setModalNaoEncontrado(false); navigate('/cadastro-beneficiado-menu'); }
					}]}
				/>
				<Modal
					isOpen={modalCampos}
					onClose={() => setModalCampos(false)}
					texto="Os campos devem estar preenchidos."
					showClose={true}
				/>
			</div>
		</div>
	);
}
