import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import Modal from "../components/Modal";
import Input from "../components/Input";
import "../styles/CadastroFilhos.css";
import Radio from "../components/Radio";
import { beneficiadoService } from "../services/beneficiadoService";

import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

export default function CadastroFilhos() {
    const [cpfBeneficiado, setCpfBeneficiado] = useState("");
    const [isEstudante, setIsEstudante] = useState(null);
    const [isCreche, setIsCreche] = useState(null);
    const [dataNascimento, setDataNascimento] = useState("");
    const [erros, setErros] = useState({});
    const [modalCampos, setModalCampos] = useState(false);
    const [modalCamposTexto, setModalCamposTexto] = useState("Preencha todos os campos antes de salvar.");
    const [modalSucesso, setModalSucesso] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [beneficiadoEncontrado, setBeneficiadoEncontrado] = useState(null);

    const [tipoUsuario, setTipoUsuario] = useState("2");
    const navigate = useNavigate();

    useEffect(() => {
        const tipo = sessionStorage.getItem("tipoUsuario") || "2";
        setTipoUsuario(tipo);
    }, []);

    // Buscar beneficiado quando CPF for preenchido completamente
    useEffect(() => {
        const cpfDigits = cpfBeneficiado.replace(/\D/g, '');
        if (cpfDigits.length === 11) {
            buscarBeneficiado(cpfDigits);
        } else {
            setBeneficiadoEncontrado(null);
            setErros(prev => ({ ...prev, cpf: undefined }));
        }
    }, [cpfBeneficiado]);

    async function buscarBeneficiado(cpf) {
        try {
            console.log('🔍 Buscando beneficiado com CPF:', cpf);
            const resultado = await beneficiadoService.buscarPorCpf(cpf);
            
            if (resultado.success && resultado.data) {
                console.log('✅ Beneficiado encontrado:', resultado.data);
                setBeneficiadoEncontrado(resultado.data);
                setErros(prev => ({ ...prev, cpf: undefined }));
            } else {
                console.log('❌ Beneficiado não encontrado');
                setBeneficiadoEncontrado(null);
                setErros(prev => ({ ...prev, cpf: 'Beneficiado não encontrado' }));
            }
        } catch (error) {
            console.error('Erro ao buscar beneficiado:', error);
            setBeneficiadoEncontrado(null);
            setErros(prev => ({ ...prev, cpf: 'Erro ao buscar beneficiado' }));
        }
    }

    function convertDateToISO(dateStr) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const botoesNavbar = [
        { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
        { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
        ...(tipoUsuario === "2"
            ? [
                {
                    texto: "Fila de Espera",
                    onClick: () => navigate("/fila-espera"),
                    icone: iconeRelogio,
                },
            ]
            : []),
        { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair },
    ];

    const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";

    function formatCPF(value) {
        let numbers = value.replace(/\D/g, "");
        if (numbers.length > 11) numbers = numbers.slice(0, 11);

        if (numbers.length > 9) {
            return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
        } else if (numbers.length > 6) {
            return numbers.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
        } else if (numbers.length > 3) {
            return numbers.replace(/(\d{3})(\d{0,3})/, "$1.$2");
        }
        return numbers;
    }

    function formatDate(value) {
        let numbers = value.replace(/\D/g, ""); 
        if (numbers.length > 8) numbers = numbers.slice(0, 8);

        if (numbers.length >= 5) {
            return numbers.replace(/(\d{2})(\d{2})(\d{0,4})/, "$1/$2/$3");
        } else if (numbers.length >= 3) {
            return numbers.replace(/(\d{2})(\d{0,2})/, "$1/$2");
        } else {
            return numbers;
        }
    }


    function isValidDate(dateString) {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return false;

        const [day, month, year] = dateString.split("/").map(Number);
        const date = new Date(year, month - 1, day);

        return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
        );
    }

    async function handleCadastrar(e) {
        e.preventDefault();
        let newErros = {};

        // aceita CPF com ou sem máscara; valida apenas 11 dígitos
        const cpfDigits = cpfBeneficiado.replace(/\D/g, '');
        if (cpfDigits.length !== 11) {
            newErros.cpf = "CPF inválido";
        }
        
        // Verificar se beneficiado foi encontrado
        if (!beneficiadoEncontrado) {
            newErros.cpf = "Beneficiado não encontrado com este CPF";
        }
        
        if (isEstudante === null) newErros.estudante = "Selecione uma opção";
        if (isCreche === null) newErros.creche = "Selecione uma opção";
        if (!isValidDate(dataNascimento)) {
            newErros.dataNascimento = "Data inválida (DD/MM/AAAA)";
        }

        setErros(newErros);
        console.log('Validação cadastro filhos:', newErros);

        if (Object.keys(newErros).length > 0) {
            // montar texto com os erros para o modal
            const itens = Object.values(newErros).join('\n');
            setModalCamposTexto(itens || "Preencha todos os campos antes de salvar.");
            setModalCampos(true);
            return;
        }

        // Verificar se beneficiado tem endereço
        if (!beneficiadoEncontrado.endereco || !beneficiadoEncontrado.endereco.id) {
            setModalCamposTexto("Beneficiado não possui endereço cadastrado. É necessário um endereço para cadastrar o filho.");
            setModalCampos(true);
            return;
        }

        setCarregando(true);

        try {
            console.log('🚀 Iniciando cadastro do filho...');
            
            const dadosFilho = {
                nome: "Filho de " + beneficiadoEncontrado.nome, // Nome padrão baseado no beneficiado
                dataNascimento: convertDateToISO(dataNascimento),
                isEstudante: isEstudante,
                hasCreche: isCreche,
                beneficiadoId: beneficiadoEncontrado.id,
                enderecoId: beneficiadoEncontrado.endereco.id
            };

            console.log('📋 Dados do filho para cadastro:', dadosFilho);

            const resultado = await beneficiadoService.cadastrarFilho(dadosFilho);

            if (resultado.success) {
                console.log('✅ Filho cadastrado com sucesso!');
                setModalSucesso(true);
            } else {
                console.log('❌ Erro ao cadastrar filho:', resultado.error);
                setModalCamposTexto(resultado.error || "Erro ao cadastrar filho");
                setModalCampos(true);
            }
        } catch (error) {
            console.error('Erro inesperado:', error);
            setModalCamposTexto("Erro inesperado ao cadastrar filho");
            setModalCampos(true);
        } finally {
            setCarregando(false);
        }
    }

    function resetForm() {
        setCpfBeneficiado("");
        setIsEstudante(null);
        setIsCreche(null);
        setDataNascimento("");
        setErros({});
        setBeneficiadoEncontrado(null);
    }

    return (
        <div className="cadastro-filhos-bg">
            <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
            <div className="cadastro-filhos-container">
                <div className="cadastro-filhos-voltar">
                    <Voltar onClick={() => navigate("/home")} />
                </div>

                <h1 className="cadastro-filhos-title">Cadastro de Filhos</h1>

                <form className="cadastro-filhos-form" onSubmit={handleCadastrar}>
                    {/* CPF */}
                    <Input
                        label="CPF do Beneficiado:"
                        type="text"
                        name="cpfBeneficiado"
                        placeholder="000.000.000-00"
                        value={cpfBeneficiado}
                        onChange={(e) => setCpfBeneficiado(formatCPF(e.target.value))}
                        maxLength={14}
                        style={erros.cpf ? { border: "2px solid #e74c3c" } : {}}
                    />
                    {erros.cpf && (
                        <span style={{ color: "#e74c3c", fontSize: 13 }}>{erros.cpf}</span>
                    )}
                    {beneficiadoEncontrado && (
                        <span style={{ color: "#27ae60", fontSize: 13 }}>
                            ✓ Beneficiado: {beneficiadoEncontrado.nome}
                        </span>
                    )}

                    <div className="cadastro-filhos-radio-container">
                        <div className="cadastro-filhos-radio-col">
                            <span className="cadastro-filhos-radio-label">É estudante?</span>
                            <Radio
                                name="estudante"
                                options={[
                                    { label: "Sim", value: "true" },
                                    { label: "Não", value: "false" },
                                ]}
                                value={isEstudante !== null ? String(isEstudante) : ""}
                                onChange={(e) => setIsEstudante(e.target.value === "true")}
                            />
                            {erros.estudante && (
                                <span className="cadastro-filhos-erro">{erros.estudante}</span>
                            )}
                        </div>

                        <div className="cadastro-filhos-radio-col">
                            <span className="cadastro-filhos-radio-label">
                                Está em uma creche?
                            </span>
                            <Radio
                                name="creche"
                                options={[
                                    { label: "Sim", value: "true" },
                                    { label: "Não", value: "false" },
                                ]}
                                value={isCreche !== null ? String(isCreche) : ""}
                                onChange={(e) => setIsCreche(e.target.value === "true")}
                            />
                            {erros.creche && (
                                <span className="cadastro-filhos-erro">{erros.creche}</span>
                            )}
                        </div>
                    </div>

                    <Input
                        label="Data de Nascimento:"
                        type="text"
                        name="dataNascimento"
                        value={dataNascimento}
                        onChange={(e) => {
                            const formatted = formatDate(e.target.value);
                            setDataNascimento(formatted);
                        }}
                        maxLength={10}
                        placeholder="DD/MM/AAAA"
                        style={erros.dataNascimento ? { border: "2px solid #e74c3c" } : {}}
                    />
                    {erros.dataNascimento && (
                        <span style={{ color: "#e74c3c", fontSize: 13 }}>
                            {erros.dataNascimento}
                        </span>
                    )}

                    <button 
                        className="cadastro-filhos-btn-row" 
                        type="submit"
                        disabled={carregando}
                    >
                        {carregando ? "Cadastrando..." : "Cadastrar"}
                    </button>
                </form>

                <Modal
                    isOpen={modalCampos}
                    onClose={() => setModalCampos(false)}
                    texto="Preencha todos os campos antes de salvar."
                    showClose={true}
                />
                <Modal
                    isOpen={modalSucesso}
                    onClose={() => setModalSucesso(false)}
                    texto={"Filho cadastrado com sucesso!\nDeseja cadastrar outro filho?"}
                    showClose={true}
                    botoes={[
                        {
                            texto: 'Sim',
                            onClick: () => { setModalSucesso(false); resetForm(); }
                        },
                        {
                            texto: 'Não',
                            onClick: () => { setModalSucesso(false); navigate('/home'); }
                        }
                    ]}
                />
            </div>
        </div>
    );
}
