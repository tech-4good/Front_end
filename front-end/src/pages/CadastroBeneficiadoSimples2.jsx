import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Input from '../components/Input';
import Botao from '../components/Botao';
import Modal from '../components/Modal';
import { enderecoService } from '../services/enderecoService';
import { beneficiadoService } from '../services/beneficiadoService';
import '../styles/CadastroBeneficiadoSimples2.css';
import iconeCasa from '../assets/icone-casa.png';
import iconeUsuario from '../assets/icone-usuario.png';
import iconeRelogio from '../assets/icone-relogio.png';
import iconeSair from '../assets/icone-sair.png';
import iconeVoltar from '../assets/icone-voltar.png';


export default function CadastroBeneficiadoSimples2() {
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

    // Estados do formulário
    const [rua, setRua] = useState("");
    const [numero, setNumero] = useState("");
    const [resultados, setResultados] = useState([]);
    const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cadastrando, setCadastrando] = useState(false);

    // Estados de controle
    const [modalGeral, setModalGeral] = useState({ open: false, mensagem: "" });
    const [modalTimeout, setModalTimeout] = useState(null);
    const [modalNaoEncontrado, setModalNaoEncontrado] = useState(false);
    const [modalSucesso, setModalSucesso] = useState(false);    // Sistema de modal unificado com timeout
    const mostrarModal = (mensagem) => {
        setModalGeral({ open: true, mensagem });
        if (modalTimeout) clearTimeout(modalTimeout);
        const timeout = setTimeout(() => setModalGeral({ open: false, mensagem: "" }), 3000);
        setModalTimeout(timeout);
    };

    // Timeouts automáticos para modais (3 segundos) - exceto sucesso
    useEffect(() => {
        if (modalNaoEncontrado) {
            const timeout = setTimeout(() => setModalNaoEncontrado(false), 3000);
            return () => clearTimeout(timeout);
        }
    }, [modalNaoEncontrado]);

    // Modal de sucesso NÃO tem timeout automático

    // Cleanup do timeout
    useEffect(() => {
        return () => {
            if (modalTimeout) clearTimeout(modalTimeout);
        };
    }, [modalTimeout]);

    // Buscar endereços conforme o usuário digita na rua
    async function handleRuaChange(e) {
        const valor = e.target.value;
        setRua(valor);
        
        // Limpar endereço selecionado quando o usuário digita algo diferente
        if (enderecoSelecionado && valor !== (enderecoSelecionado.logradouro || enderecoSelecionado.rua)) {
            setEnderecoSelecionado(null);
        }
        
        // Limpar último endereço válido se a rua foi completamente alterada
        if (ultimoEnderecoValido && valor !== (ultimoEnderecoValido.logradouro || ultimoEnderecoValido.rua)) {
            setUltimoEnderecoValido(null);
        }
        
        if (valor.length > 2) {
            setLoading(true);
            const response = await beneficiadoService.buscarEnderecos(valor);
            if (response.success) {
                setResultados(response.data);
            } else {
                setResultados([]);
            }
            setLoading(false);
        } else {
            setResultados([]);
        }
    }

    // Selecionar endereço da lista
    function handleSelectEndereco(endereco) {
        setRua(endereco.logradouro || endereco.rua);
        setNumero(endereco.numero);
        setEnderecoSelecionado(endereco);
        setUltimoEnderecoValido(endereco);
        setResultados([]);
    }

    // Estado para guardar o último endereço válido selecionado
    const [ultimoEnderecoValido, setUltimoEnderecoValido] = useState(null);

    // Função para lidar com mudança no número
    function handleNumeroChange(e) {
        const novoNumero = e.target.value.replace(/[^0-9]/g, "");
        setNumero(novoNumero);
        
        // Se há um endereço selecionado e o número foi alterado
        if (enderecoSelecionado) {
            if (novoNumero !== enderecoSelecionado.numero) {
                // Número diferente - limpar seleção mas guardar referência
                setUltimoEnderecoValido(enderecoSelecionado);
                setEnderecoSelecionado(null);
            }
        } else if (ultimoEnderecoValido) {
            // Se não há endereço selecionado mas temos um último válido
            // Verificar se o número voltou ao correto e a rua ainda corresponde
            if (novoNumero === ultimoEnderecoValido.numero && 
                rua === (ultimoEnderecoValido.logradouro || ultimoEnderecoValido.rua)) {
                // Restaurar seleção
                setEnderecoSelecionado(ultimoEnderecoValido);
            }
        }
    }

    // Buscar/validar endereço
    async function handleBuscar(e) {
        e.preventDefault();
        if (!rua || !numero) {
            mostrarModal('Todas as informações devem estar preenchidas.');
            return;
        }
        
        // Verificar se um endereço foi realmente selecionado da lista
        if (!enderecoSelecionado) {
            setModalNaoEncontrado(true);
            return;
        }
        
        // Verificar se o número corresponde ao endereço selecionado
        if (numero !== enderecoSelecionado.numero) {
            setModalNaoEncontrado(true);
            return;
        }
        
        // Verificar se o endereço selecionado tem um ID válido
        const enderecoId = enderecoSelecionado.id || enderecoSelecionado.enderecoId || enderecoSelecionado.codigo || enderecoSelecionado.idEndereco;
        
        if (!enderecoId) {
            setModalNaoEncontrado(true);
            return;
        }
        
        setModalSucesso(true);
    }

    // Função para cadastrar beneficiado com endereço selecionado
    async function handleCadastrarBeneficiado() {
        setCadastrando(true);
        
        try {
            // Recuperar dados do sessionStorage
            const nome = sessionStorage.getItem("nomeBeneficiado");
            const cpf = sessionStorage.getItem("cpfBeneficiado");
            const dataNascimento = sessionStorage.getItem("dataNascimentoBeneficiado");
            
            if (!nome || !cpf || !dataNascimento) {
                mostrarModal("Dados do beneficiado não encontrados. Refaça o cadastro.");
                setCadastrando(false);
                return;
            }
            
            // Verificar se tem endereço selecionado
            const enderecoId = enderecoSelecionado.id || enderecoSelecionado.enderecoId || enderecoSelecionado.codigo || enderecoSelecionado.idEndereco;
            
            if (!enderecoSelecionado || !enderecoId) {
                mostrarModal('Nenhum endereço foi selecionado.');
                setModalSucesso(false);
                setCadastrando(false);
                return;
            }

            // Converter data para formato ISO
            const [day, month, year] = dataNascimento.split('/');
            const dataISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

            const dadosBeneficiado = {
                nome: nome.trim(),
                cpf: cpf.replace(/\D/g, ''),
                dataNascimento: dataISO,
                enderecoId: enderecoId
            };
            
            const response = await beneficiadoService.cadastrarBeneficiadoSimples(dadosBeneficiado);
            
            if (response.success) {
                // Limpar dados temporários
                sessionStorage.removeItem("nomeBeneficiado");
                sessionStorage.removeItem("cpfBeneficiado");
                sessionStorage.removeItem("dataNascimentoBeneficiado");
                
                localStorage.setItem("modalSucessoBeneficiado", "true");
                navigate("/cadastro-beneficiado-menu");
            } else {
                mostrarModal(response.error || 'Erro ao cadastrar beneficiado.');
                setModalSucesso(false);
            }
        } catch (error) {
            console.error('Erro inesperado:', error);
            mostrarModal('Erro inesperado. Tente novamente.');
            setModalSucesso(false);
        } finally {
            setCadastrando(false);
        }
    }

    return (
        <div className="cadastro-simples-bg">
            <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isCadastrarBeneficiadosPage={true} />
            
            <div className="cadastro-simples-container">
                <img 
                    src={iconeVoltar} 
                    alt="Voltar" 
                    className="cadastro-simples-icone-voltar"
                    onClick={() => navigate("/cadastro-beneficiado-simples1")}
                />
                
                <h1 className="cadastro-simples-title">Cadastro de Beneficiado</h1>
                
                {/* Indicador de progresso */}
                <div className="cadastro-simples-progress-container">
                    <div className="cadastro-simples-progress-step completed">
                        <div className="cadastro-simples-progress-circle"></div>
                        <span className="cadastro-simples-progress-label">Passo 1</span>
                    </div>
                    <div className="cadastro-simples-progress-line completed"></div>
                    <div className="cadastro-simples-progress-step active">
                        <div className="cadastro-simples-progress-circle"></div>
                        <span className="cadastro-simples-progress-label">Passo 2</span>
                    </div>
                </div>

                <form className="cadastro-simples-form" onSubmit={(e) => { e.preventDefault(); handleBuscar(e); }} autoComplete="off">
                    <div className="cadastro-simples-row">
                        <div className="cadastro-simples-field" style={{ position: "relative" }}>
                            <label htmlFor="rua" className="cadastro-simples-label">Rua/Avenida:</label>
                            <Input
                                id="rua"
                                placeholder="Ex: Rua Osvaldo Cruz"
                                value={rua}
                                onChange={handleRuaChange}
                                autoComplete="off"
                                className="cadastro-simples-input"
                            />
                            {rua && resultados.length > 0 && (
                                <div className="cadastro-simples-resultados">
                                    {loading ? (
                                        <div className="cadastro-simples-resultado">
                                            Buscando endereços...
                                        </div>
                                    ) : (
                                        resultados.map((endereco, idx) => (
                                            <div
                                                className="cadastro-simples-resultado"
                                                key={idx}
                                                style={{ cursor: "pointer" }}
                                                onClick={() => handleSelectEndereco(endereco)}
                                            >
                                                {endereco.logradouro || endereco.rua}, {endereco.numero}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="cadastro-simples-field">
                            <label htmlFor="numero" className="cadastro-simples-label">Número:</label>
                            <Input
                                id="numero"
                                placeholder="Insira o número"
                                value={numero}
                                onChange={handleNumeroChange}
                                maxLength={6}
                                className="cadastro-simples-input"
                            />
                        </div>
                        <Botao
                            texto={loading ? 'Buscando...' : 'Buscar'}
                            type="submit"
                            disabled={loading}
                            className="cadastro-simples-btn"
                        />
                    </div>
                </form>
            </div>

            <Modal
                isOpen={modalGeral.open}
                onClose={() => setModalGeral({ open: false, mensagem: "" })}
                texto={modalGeral.mensagem}
                showClose={false}
            />
            <Modal
                isOpen={modalNaoEncontrado}
                onClose={() => setModalNaoEncontrado(false)}
                texto={
                    <>
                        Endereço não encontrado.<br />
                        <span style={{ textDecoration: 'underline', color: '#0077cc', cursor: 'pointer' }} onClick={() => { setModalNaoEncontrado(false); navigate('/cadastro-endereco-1'); }}>
                            Clique aqui para cadastrar endereço
                        </span>
                    </>
                }
                showClose={false}
            />
            <Modal
                isOpen={modalSucesso}
                onClose={() => setModalSucesso(false)}
                texto={"Endereço encontrado!"}
                showClose={false}
            >
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                    <button
                        className="cadastro-endereco-botao-perfil"
                        onClick={handleCadastrarBeneficiado}
                        disabled={cadastrando}
                    >
                        {cadastrando ? "Cadastrando..." : "Cadastrar Beneficiado"}
                    </button>
                </div>
            </Modal>
        </div>
    );
}