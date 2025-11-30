
import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { beneficiadoService } from '../services/beneficiadoService';
import '../styles/ConsultaBeneficiados.css';
import iconeCasa from '../assets/icone-casa.png';
import iconeUsuario from '../assets/icone-usuario.png';
import iconeRelogio from '../assets/icone-relogio.png';
import iconeSair from '../assets/icone-sair.png';
import iconeVoltar from '../assets/icone-voltar.png';

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

	// Auto-close modal de campos após 3 segundos
	useEffect(() => {
		if (modalCampos) {
			const timer = setTimeout(() => {
				setModalCampos(false);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [modalCampos]);

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

	const formatCPF = (value) => {
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
	};

	function handleCpfChange(e) {
		const raw = e.target.value;
		const formatted = formatCPF(raw);
		setCpf(formatted);
		const valor = formatted.replace(/\D/g, '');
		
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
		setCpf(formatCPF(beneficiado.cpf));
		setResultados([]);
	}

	return (
		<div>
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isConsultaBeneficiadosPage={true} />
			<div className="consulta-beneficiados-container">
				<img 
					src={iconeVoltar} 
					alt="Voltar" 
					className="consulta-beneficiados-icone-voltar"
					onClick={() => navigate('/home')}
				/>
				<h1 className="consulta-beneficiados-title">Consulta de Beneficiados</h1>
				
				<div className="consulta-beneficiados-form">
					{/* Campo de busca por CPF e Botão */}
					<div className="consulta-beneficiados-row consulta-beneficiados-row-busca">
						<div className="consulta-beneficiados-field">
							<label className="consulta-beneficiados-label">CPF:</label>
							<input
								type="text"
								name="cpfBusca"
								value={cpf}
								onChange={handleCpfChange}
								placeholder="Digite o CPF para buscar"
								autoComplete="off"
								maxLength={14}
								className="consulta-beneficiados-input"
								disabled={carregando || carregandoBusca}
							/>
						</div>
						<button 
							type="button"
							className="consulta-beneficiados-btn" 
							onClick={handleBuscar}
							disabled={carregando || carregandoBusca}
						>
							{carregandoBusca ? 'Buscando...' : 'Buscar'}
						</button>
					</div>

					{/* Resultados da busca */}
					{carregando && (
						<div className="consulta-beneficiados-resultados">
							<div className="consulta-beneficiados-resultado-loading">Carregando beneficiados...</div>
						</div>
					)}
					
					{!carregando && cpf && resultados.length > 0 && (
						<div className="consulta-beneficiados-resultados">
							<div className="consulta-beneficiados-resultados-header">Beneficiados encontrados:</div>
							{resultados.map((beneficiado, idx) => (
								<div
									className="consulta-beneficiados-resultado-item"
									key={idx}
									onClick={() => selecionarBeneficiado(beneficiado)}
								>
									<div className="consulta-beneficiados-resultado-nome">{beneficiado.nome}</div>
									<div className="consulta-beneficiados-resultado-cpf">CPF: {beneficiado.cpf}</div>
								</div>
							))}
						</div>
					)}
				</div>
				
				{/* Modals */}
				<Modal
					isOpen={modalNaoEncontrado}
					onClose={() => setModalNaoEncontrado(false)}
					texto="Beneficiado com esse CPF não está cadastrado. Deseja cadastrar?"
					showClose={false}
					botoes={[
						{
							texto: "Sim",
							onClick: () => {
								setModalNaoEncontrado(false);
								navigate('/cadastro-beneficiado-menu');
							}
						},
						{
							texto: "Não",
							onClick: () => setModalNaoEncontrado(false)
						}
						
					]}
				/>
				<Modal
					isOpen={modalCampos}
					onClose={() => setModalCampos(false)}
					texto="O campo CPF deve estar preenchido."
					showClose={false}
				/>
			</div>
		</div>
	);
}
