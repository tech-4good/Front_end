

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Voltar from '../components/Voltar';
import Input from '../components/Input';
import iconeCasa from '../assets/icone-casa.png';
import iconeUsuario from '../assets/icone-usuario.png';
import iconeRelogio from '../assets/icone-relogio.png';
import iconeSair from '../assets/icone-sair.png';
import Passo1_2 from '../components/Passo1_2';
import "../styles/CadastroBeneficiadoSimples1.css";


export default function CadastroBeneficiadoSimples1() {
    const navigate = useNavigate();
    const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";
    const tipoUsuario = sessionStorage.getItem("tipoUsuario") || "2";
    const botoesNavbar = [
        { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
        { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
        ...(tipoUsuario === "2"
            ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }]
            : []),
        { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
    ];

    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [erros, setErros] = useState({});

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

    const handleSubmit = (e) => {
        e.preventDefault();
        let newErros = {};
        if (!nome || nome.length > 200) newErros.nome = "Nome obrigatório (máx 200)";
        if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) newErros.cpf = "CPF inválido";
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dataNascimento)) newErros.dataNascimento = "Data inválida (dd/mm/aaaa)";
        setErros(newErros);
        if (Object.keys(newErros).length === 0) {
            navigate("/cadastro-beneficiado-simples2");
        }
    };

    return (
        <div className="cadastro-simples-bg">
            <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
            <div className="cadastro-simples-container">
                <div className="cadastrobeneficiado-voltar">
                    <Voltar onClick={() => navigate("/cadastro-beneficiado-menu")} />
                </div>
                <div className="cadastro-simples-passo1_2">
                    <Passo1_2 onClick={() => navigate("/cadastro-beneficiado-simples2")} />
                </div>
                <h1 className="cadastro-simples-title">Cadastro de Beneficiado</h1>
                <form className="cadastro-simples-form" onSubmit={handleSubmit} autoComplete="off">
                    <Input
                        label="Nome Completo:"
                        type="text"
                        name="nome"
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        maxLength={200}
                        placeholder="Insira o seu nome completo"
                        style={erros.nome ? { border: '2px solid #e74c3c' } : {}}
                    />
                    {erros.nome && <span style={{ color: '#e74c3c', fontSize: 13 }}>{erros.nome}</span>}

                    <Input
                        label="CPF:"
                        type="text"
                        name="cpf"
                        value={cpf}
                        onChange={e => setCpf(formatCPF(e.target.value))}
                        maxLength={14}
                        placeholder="000.000.000-00"
                        style={erros.cpf ? { border: '2px solid #e74c3c' } : {}}
                    />
                    {erros.cpf && <span style={{ color: '#e74c3c', fontSize: 13 }}>{erros.cpf}</span>}

                    <Input
                        label="Data de Nascimento:"
                        type="text"
                        name="dataNascimento"
                        value={dataNascimento}
                        onChange={e => setDataNascimento(e.target.value)}
                        maxLength={10}
                        placeholder="DD/MM/AAAA"
                        style={erros.dataNascimento ? { border: '2px solid #e74c3c' } : {}}
                    />
                    {erros.dataNascimento && <span style={{ color: '#e74c3c', fontSize: 13 }}>{erros.dataNascimento}</span>}

                    <button className="cadastro-simples-btn" type="submit">Próximo</button>
                </form>
            </div>
        </div>
    );
}

