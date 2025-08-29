
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
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

	function handleBuscar(e) {
		e.preventDefault();
		// Aqui pode ser implementada a lógica de busca
	}

	return (
		<div className="consulta-beneficiados-bg">
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
			<div className="consulta-beneficiados-container">
				<div className="doar-cesta-voltar">
					<Voltar onClick={() => navigate('/home')} />
				</div>
				<h1 className="consulta-beneficiados-title">Consulta de Beneficiados</h1>
				<form className="consulta-beneficiados-form" onSubmit={handleBuscar} autoComplete="off">
					<input
						className="consulta-beneficiados-input"
						type="text"
						placeholder="Insira o CPF"
						value={cpf}
						onChange={e => setCpf(e.target.value.replace(/[^0-9]/g, ''))}
						maxLength={11}
						autoFocus
					/>
					<button className="consulta-beneficiados-buscar" type="submit">
						<FaSearch className="consulta-beneficiados-search-icon" /> Buscar
					</button>
				</form>
			</div>
		</div>
	);
}
