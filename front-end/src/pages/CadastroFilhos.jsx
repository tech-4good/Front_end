import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
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
    const [modalCamposTexto, setModalCamposTexto] = useState("Preencha todos os campos");
    const [modalSucesso, setModalSucesso] = useState(false);
    const [modalAuxilios, setModalAuxilios] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [beneficiadoEncontrado, setBeneficiadoEncontrado] = useState(null);

    const [tipoUsuario, setTipoUsuario] = useState("2");
    const navigate = useNavigate();

    useEffect(() => {
        const tipo = sessionStorage.getItem("tipoUsuario") || "2";
        setTipoUsuario(tipo);
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
            const resultado = await beneficiadoService.buscarPorCpf(cpf);
            
            if (resultado.success && resultado.data) {
                setBeneficiadoEncontrado(resultado.data);
                setErros(prev => ({ ...prev, cpf: undefined }));
            } else {
                setBeneficiadoEncontrado(null);
                setErros(prev => ({ ...prev, cpf: 'Beneficiado não encontrado' }));
            }
        } catch (error) {
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
        if (!beneficiadoEncontrado && cpfDigits.length === 11) {
            setModalCamposTexto("CPF não encontrado");
            setModalCampos(true);
            return;
        }
        
        if (isEstudante === null) newErros.estudante = "Selecione uma opção";
        if (isCreche === null) newErros.creche = "Selecione uma opção";
        if (!isValidDate(dataNascimento)) {
            newErros.dataNascimento = "Data inválida (DD/MM/AAAA)";
        }

        setErros(newErros);

        if (Object.keys(newErros).length > 0) {
            setModalCamposTexto("Preencha todos os campos");
            setModalCampos(true);
            return;
        }

        if (!beneficiadoEncontrado.endereco || !beneficiadoEncontrado.endereco.id) {
            setModalCamposTexto("Preencha todos os campos");
            setModalCampos(true);
            return;
        }

        setCarregando(true);

        try {
            const dadosFilho = {
                dataNascimento: convertDateToISO(dataNascimento),
                isEstudante: isEstudante,
                hasCreche: isCreche,
                beneficiadoId: beneficiadoEncontrado.id,
                enderecoId: beneficiadoEncontrado.endereco.id
            };

            const resultado = await beneficiadoService.cadastrarFilho(dadosFilho);

            if (resultado.success) {
                setModalSucesso(true);
            } else {
                setModalCamposTexto("Preencha todos os campos");
                setModalCampos(true);
            }
        } catch (error) {
            setModalCamposTexto("Preencha todos os campos");
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

    function handleNaoCadastrarMaisFilhos() {
        setModalSucesso(false);
        
        // Verificar se veio do fluxo de cadastro completo
        const voltarParaAuxilios = sessionStorage.getItem('voltarParaAuxilios');
        
        if (voltarParaAuxilios === 'true') {
            // Limpar flag e mostrar modal de auxílios
            sessionStorage.removeItem('voltarParaAuxilios');
            setModalAuxilios(true);
        } else {
            // Fluxo normal - voltar para home
            navigate('/home');
        }
    }

    return (
        <div className="cadastro-filhos-bg">
            <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isCadastrarBeneficiadosPage={true} />
            <div className="cadastro-filhos-container">


                <h1 className="cadastro-filhos-title">Cadastro de Filhos</h1>

                <form className="cadastro-filhos-form" onSubmit={handleCadastrar}>
                    {/* Linha 1: CPF e Data de Nascimento */}
                    <div className="cadastro-filhos-row-double">
                        <div className="cadastro-filhos-input-group">
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

                        </div>

                        <div className="cadastro-filhos-input-group">
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

                        </div>
                    </div>

                    {/* Linha 2: Sliders */}
                    <div className="cadastro-filhos-row-double">
                        <div className="cadastro-filhos-slider-group">
                            <span className="cadastro-filhos-slider-label">É estudante?</span>
                            <div className="cadastro-filhos-toggle-container">
                                <span className={`cadastro-filhos-toggle-option ${isEstudante === false ? 'active' : ''}`}>
                                    Não
                                </span>
                                <div 
                                    className="cadastro-filhos-toggle-switch"
                                    onClick={() => setIsEstudante(!isEstudante)}
                                >
                                    <div className={`cadastro-filhos-toggle-slider ${isEstudante ? 'right' : 'left'}`}></div>
                                </div>
                                <span className={`cadastro-filhos-toggle-option ${isEstudante === true ? 'active' : ''}`}>
                                    Sim
                                </span>
                            </div>

                        </div>

                        <div className="cadastro-filhos-slider-group">
                            <span className="cadastro-filhos-slider-label">Está em uma creche?</span>
                            <div className="cadastro-filhos-toggle-container">
                                <span className={`cadastro-filhos-toggle-option ${isCreche === false ? 'active' : ''}`}>
                                    Não
                                </span>
                                <div 
                                    className="cadastro-filhos-toggle-switch"
                                    onClick={() => setIsCreche(!isCreche)}
                                >
                                    <div className={`cadastro-filhos-toggle-slider ${isCreche ? 'right' : 'left'}`}></div>
                                </div>
                                <span className={`cadastro-filhos-toggle-option ${isCreche === true ? 'active' : ''}`}>
                                    Sim
                                </span>
                            </div>

                        </div>
                    </div>

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
                    texto={modalCamposTexto}
                    showClose={false}
                />
                <Modal
                    isOpen={modalSucesso}
                    onClose={() => setModalSucesso(false)}
                    texto={"Filho cadastrado com sucesso!\nDeseja cadastrar outro filho?"}
                    showClose={false}
                    botoes={[
                        {
                            texto: 'Sim',
                            onClick: () => { setModalSucesso(false); resetForm(); }
                        },
                        {
                            texto: 'Não',
                            onClick: handleNaoCadastrarMaisFilhos
                        }
                    ]}
                />
                
                {/* Modal de pergunta auxílios */}
                <Modal
                    isOpen={modalAuxilios}
                    onClose={() => { setModalAuxilios(false); navigate('/cadastro-beneficiado-menu'); }}
                    texto="Deseja cadastrar auxílios governamentais?"
                    showClose={false}
                    botoes={[
                        {
                            texto: 'Sim',
                            onClick: () => { setModalAuxilios(false); navigate('/cadastro-auxilios'); },
                            style: { background: '#ededed', color: '#222', minWidth: 120, minHeight: 44, fontSize: 18 }
                        },
                        {
                            texto: 'Não',
                            onClick: () => { setModalAuxilios(false); navigate('/cadastro-beneficiado-menu'); },
                            style: { background: '#111', color: '#fff', border: '2px solid #111', minWidth: 120, minHeight: 44, fontSize: 18 }
                        }
                    ]}
                />
            </div>
        </div>
    );
}
