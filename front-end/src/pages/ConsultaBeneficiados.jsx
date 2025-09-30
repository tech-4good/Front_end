
import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { beneficiadoService } from '../services/beneficiadoService';
import '../styles/ConsultaBeneficiados.css';
import { FaSearch } from 'react-icons/fa';
import iconeCasa from '../assets/icone-casa.png';
import iconeUsuario from '../assets/icone-usuario.png';
import iconeRelogio from '../assets/icone-relogio.png';
import iconeSair from '../assets/icone-sair.png';
import Voltar from '../components/Voltar';

export default function ConsultaBeneficiados() {
	const [cpf, setCpf] = useState('');
	const [tipoUsuario, setTipoUsuario] = useState('2');
	const [beneficiados, setBeneficiados] = useState([]);
	const [resultados, setResultados] = useState([]);
	const [modalNaoEncontrado, setModalNaoEncontrado] = useState(false);
	const [modalCampos, setModalCampos] = useState(false);
	const [carregando, setCarregando] = useState(false);
	const [carregandoBusca, setCarregandoBusca] = useState(false);
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

	// Carregar lista de beneficiados ao montar o componente
	useEffect(() => {
		carregarBeneficiados();
	}, []);

	async function carregarBeneficiados() {
		setCarregando(true);
		try {
			const resultado = await beneficiadoService.listarBeneficiados();
			if (resultado.success) {
				setBeneficiados(resultado.data);
			} else {
				console.error('Erro ao carregar beneficiados:', resultado.error);
			}
		} catch (error) {
			console.error('Erro inesperado:', error);
		} finally {
			setCarregando(false);
		}
	}

	async function handleBuscar(e) {
		e.preventDefault();
		if (!cpf) {
			setModalCampos(true);
			return;
		}

		setCarregandoBusca(true);
		try {
			const resultado = await beneficiadoService.buscarPorCpf(cpf);
			if (resultado.success) {
				// Passar os dados do beneficiado para a página de resultado
				navigate('/consulta-beneficiados-resultado', { 
					state: { 
						beneficiado: resultado.data 
					} 
				});
			} else {
				setModalNaoEncontrado(true);
			}
		} catch (error) {
			console.error('Erro inesperado:', error);
			setModalNaoEncontrado(true);
		} finally {
			setCarregandoBusca(false);
		}
	}

	function handleCpfChange(e) {
		let valor = e.target.value.replace(/\D/g, '');
		if (valor.length > 11) valor = valor.slice(0, 11);
		
		setCpf(valor);
		
		if (valor.length > 0 && valor.length < 11) {
			// Filtrar beneficiados por CPF que contém os dígitos digitados
			const encontrados = beneficiados.filter(b => 
				b.cpf?.replace(/\D/g, '').includes(valor)
			);
			setResultados(encontrados.slice(0, 5)); // Limitar a 5 resultados
		} else {
			setResultados([]);
		}
	}

	function selecionarBeneficiado(beneficiado) {
		setCpf(beneficiado.cpf.replace(/\D/g, ''));
		setResultados([]);
	}

	return (
		<div className="consulta-beneficiados-bg">
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
			<div className="consulta-beneficiados-container">
				<div className="consulta-beneficiados-voltar">
					<Voltar onClick={() => navigate('/home')} />
				</div>
				<h1 className="consulta-beneficiados-title">Consulta de Beneficiados</h1>
				
				{carregando && (
					<p style={{ textAlign: 'center', color: '#666' }}>Carregando beneficiados...</p>
				)}
				
				<form className="consulta-beneficiados-form" onSubmit={handleBuscar} autoComplete="off">
					<input
						className="consulta-beneficiados-input"
						type="text"
						placeholder="Insira o CPF (somente números)"
						value={cpf}
						onChange={handleCpfChange}
						maxLength={11}
						autoFocus
						disabled={carregando || carregandoBusca}
					/>
					{cpf && cpf.length < 11 && resultados.length > 0 && (
						<div className="consulta-beneficiados-resultados">
							{resultados.map((beneficiado, idx) => (
								<div
									className="consulta-beneficiados-resultado"
									key={idx}
									style={{ cursor: "pointer" }}
									onClick={() => selecionarBeneficiado(beneficiado)}
								>
									<strong>{beneficiado.nome}</strong><br />
									<small>CPF: {beneficiado.cpf}</small>
								</div>
							))}
						</div>
					)}
					<button 
						className="consulta-beneficiados-buscar" 
						type="submit"
						disabled={carregando || carregandoBusca}
					>
						<FaSearch className="consulta-beneficiados-search-icon" /> 
						{carregandoBusca ? 'Buscando...' : 'Buscar'}
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
