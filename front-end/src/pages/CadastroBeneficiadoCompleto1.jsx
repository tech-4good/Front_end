import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Voltar from '../components/Voltar';
import Input from '../components/Input';
import '../styles/CadastroBeneficiadoCompleto1.css';
import iconeCasa from '../assets/icone-casa.png';
import iconeUsuario from '../assets/icone-usuario.png';
import iconeRelogio from '../assets/icone-relogio.png';
import iconeSair from '../assets/icone-sair.png';
import { FaSearch } from 'react-icons/fa';

export default function CadastroBeneficiadoCompleto1() {
    const [rua, setRua] = useState('');
    const [numero, setNumero] = useState('');
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
        // lógica de busca
    }

    return (
        <div className="cadastro-beneficiado-bg">
            <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
            <div className="cadastro-beneficiado-container">
                <div className="cadastro-beneficiado-voltar">
                    <Voltar onClick={() => navigate('/home')} />
                </div>
                <div className="cadastro-beneficiado-header">
                    <h1 className="cadastro-beneficiado-title">Cadastro de Beneficiado</h1>
                    <span className="cadastro-beneficiado-passo">Passo: 1/3</span>
                </div>
                <form className="cadastro-beneficiado-form" onSubmit={handleBuscar} autoComplete="off">
                    <div className="cadastro-beneficiado-row">
                        <div className="cadastro-beneficiado-field">
                            <label htmlFor="rua">Rua/Avenida: *</label>
                            <Input
                                id="rua"
                                placeholder="Ex: Rua Osvaldo Cruz"
                                value={rua}
                                onChange={e => setRua(e.target.value)}
                                className="cadastro-beneficiado-input"
                            />
                        </div>
                        <div className="cadastro-beneficiado-field">
                            <label htmlFor="numero">Número:</label>
                            <Input
                                id="numero"
                                placeholder="Insira o número"
                                value={numero}
                                onChange={e => setNumero(e.target.value.replace(/[^0-9]/g, ''))}
                                className="cadastro-beneficiado-input"
                                maxLength={6}
                            />
                        </div>
                        <button className="cadastro-beneficiado-buscar" type="submit">
                            <FaSearch className="cadastro-beneficiado-search-icon" /> Buscar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}