

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Input from '../components/Input';
import Botao from '../components/Botao';
import Modal from '../components/Modal';
import iconeCasa from '../assets/icone-casa.png';
import iconeUsuario from '../assets/icone-usuario.png';
import iconeRelogio from '../assets/icone-relogio.png';
import iconeSair from '../assets/icone-sair.png';
import iconeVoltar from '../assets/icone-voltar.png';
import "../styles/CadastroBeneficiadoSimples1.css";


export default function CadastroBeneficiadoSimples1() {
    const navigate = useNavigate();
    const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";
    const tipoUsuario = sessionStorage.getItem("tipoUsuario") || "2";
    const botoesNavbar = [
        { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
        { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
        ...(tipoUsuario === "2"
            ? []
            : []),
        { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
    ];

    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [modalErro, setModalErro] = useState({ open: false, mensagem: "" });

    // Timeout automático para o modal de erro (3 segundos)
    useEffect(() => {
        if (modalErro.open) {
            const timeout = setTimeout(() => setModalErro({ open: false, mensagem: "" }), 3000);
            return () => clearTimeout(timeout);
        }
    }, [modalErro.open]);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validação do nome
        if (!nome || nome.trim() === "") {
            setModalErro({ open: true, mensagem: "Nome é obrigatório." });
            return;
        }
        if (nome.length > 200) {
            setModalErro({ open: true, mensagem: "Nome deve ter no máximo 200 caracteres." });
            return;
        }
        
        // Validação do CPF
        if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) {
            setModalErro({ open: true, mensagem: "CPF inválido. Use o formato 000.000.000-00." });
            return;
        }
        
        // Validação da data de nascimento
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dataNascimento)) {
            setModalErro({ open: true, mensagem: "Data de nascimento inválida. Use o formato DD/MM/AAAA." });
            return;
        }
        
        // Se chegou aqui, todos os campos estão válidos
        sessionStorage.setItem("nomeBeneficiado", nome);
        sessionStorage.setItem("cpfBeneficiado", cpf);
        sessionStorage.setItem("dataNascimentoBeneficiado", dataNascimento);
        navigate("/cadastro-beneficiado-simples2");
    };

    return (
        <div className="cadastro-simples-bg">
            <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isCadastrarBeneficiadosPage={true} />
            
            <div className="cadastro-simples-container">
                <img 
                    src={iconeVoltar} 
                    alt="Voltar" 
                    className="cadastro-simples-icone-voltar"
                    onClick={() => navigate("/cadastro-beneficiado-menu")}
                />
                
                <h1 className="cadastro-simples-title">Cadastro de Beneficiado</h1>
                
                {/* Indicador de progresso */}
                <div className="cadastro-simples-progress-container">
                    <div className="cadastro-simples-progress-step active">
                        <div className="cadastro-simples-progress-circle"></div>
                        <span className="cadastro-simples-progress-label">Passo 1</span>
                    </div>
                    <div className="cadastro-simples-progress-line"></div>
                    <div className="cadastro-simples-progress-step">
                        <div className="cadastro-simples-progress-circle"></div>
                        <span className="cadastro-simples-progress-label">Passo 2</span>
                    </div>
                </div>
                
                <form className="cadastro-simples-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
                    {/* Primeira linha - Nome Completo */}
                    <div className="cadastro-simples-field-group">
                        <div className="cadastro-simples-field">
                            <label className="cadastro-simples-label">Nome Completo:</label>
                            <Input
                                type="text"
                                value={nome}
                                onChange={e => {
                                    let value = e.target.value;
                                    // Permitir apenas letras, espaços e acentos
                                    value = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
                                    // Remover espaços duplos
                                    value = value.replace(/\s{2,}/g, ' ');
                                    setNome(value);
                                }}
                                placeholder="Insira o seu nome completo"
                                maxLength={200}
                                className="cadastro-simples-input"
                            />
                        </div>
                    </div>

                    {/* Segunda linha - CPF e Data de Nascimento */}
                    <div className="cadastro-simples-row">
                        <div className="cadastro-simples-field">
                            <label className="cadastro-simples-label">CPF:</label>
                            <Input
                                type="text"
                                value={cpf}
                                onChange={e => setCpf(formatCPF(e.target.value))}
                                placeholder="000.000.000-00"
                                maxLength={14}
                                className="cadastro-simples-input"
                            />
                        </div>
                        <div className="cadastro-simples-field">
                            <label className="cadastro-simples-label">Data de Nascimento:</label>
                            <Input
                                type="text"
                                value={dataNascimento}
                                onChange={e => setDataNascimento(formatDate(e.target.value))}
                                placeholder="DD/MM/AAAA"
                                maxLength={10}
                                className="cadastro-simples-input"
                            />
                        </div>
                    </div>

                    <Botao texto="Próximo" type="submit" className="cadastro-simples-btn" />
                </form>
            </div>

            {/* Modal unificado com timeout de 3 segundos */}
            <Modal
                isOpen={modalErro.open}
                texto={modalErro.mensagem}
                showClose={false}
            />
        </div>
    );
}

