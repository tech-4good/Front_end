import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Input from '../components/Input';
import Botao from '../components/Botao';
import Modal from '../components/Modal';
import { beneficiadoService } from '../services/beneficiadoService';
import '../styles/CadastroBeneficiadoCompleto1.css';
import iconeCasa from '../assets/icone-casa.png';
import iconeUsuario from '../assets/icone-usuario.png';
import iconeRelogio from '../assets/icone-relogio.png';
import iconeSair from '../assets/icone-sair.png';
import iconeVoltar from '../assets/icone-voltar.png';


export default function CadastroBeneficiadoCompleto1() {
    const [rua, setRua] = useState("");
    const [numero, setNumero] = useState("");
    const [tipoUsuario, setTipoUsuario] = useState("2");
    const [resultados, setResultados] = useState([]);
    const [modalNaoEncontrado, setModalNaoEncontrado] = useState(false);
    const [modalErro, setModalErro] = useState({ aberto: false, mensagem: 'Todas as informações devem estar preenchidas.' });
    const [modalSucesso, setModalSucesso] = useState(false);
    const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
    const [ultimoEnderecoValido, setUltimoEnderecoValido] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const tipo = sessionStorage.getItem("tipoUsuario") || "2";
        setTipoUsuario(tipo);
    }, []);

    // Timeouts automáticos para modais (3 segundos)
    useEffect(() => {
        if (modalErro.aberto) {
            const timeout = setTimeout(() => setModalErro({ aberto: false, mensagem: '' }), 3000);
            return () => clearTimeout(timeout);
        }
    }, [modalErro.aberto]);

    useEffect(() => {
        if (modalNaoEncontrado) {
            const timeout = setTimeout(() => setModalNaoEncontrado(false), 3000);
            return () => clearTimeout(timeout);
        }
    }, [modalNaoEncontrado]);

    const botoesNavbar = [
        { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
        { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
        ...(tipoUsuario === "2"
            ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }]
            : []),
        { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair },
    ];
    const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";

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

    function handleSelectEndereco(endereco) {
        setRua(endereco.logradouro || endereco.rua);
        setNumero(endereco.numero);
        setEnderecoSelecionado(endereco);
        setUltimoEnderecoValido(endereco);
        setResultados([]);
    }

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

    async function handleBuscar(e) {
        e.preventDefault();
        if (!rua || !numero) {
            setModalErro({ aberto: true, mensagem: 'Todas as informações devem estar preenchidas.' });
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
        
        // Salvar endereço selecionado para as próximas etapas
        sessionStorage.setItem("enderecoSelecionado", JSON.stringify(enderecoSelecionado));
        setModalSucesso(true);
    }

    return (
        <div className="cadastro-completo1-bg">
            <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isCadastrarBeneficiadosPage={true} />
            
            <div className="cadastro-completo1-container">
                <img 
                    src={iconeVoltar} 
                    alt="Voltar" 
                    className="cadastro-completo1-icone-voltar"
                    onClick={() => navigate("/cadastro-beneficiado-menu")}
                />
                
                <h1 className="cadastro-completo1-title">Cadastro de Beneficiado</h1>
                
                {/* Indicador de progresso */}
                <div className="cadastro-completo1-progress-container">
                    <div className="cadastro-completo1-progress-step active">
                        <div className="cadastro-completo1-progress-circle"></div>
                        <span className="cadastro-completo1-progress-label">Passo 1</span>
                    </div>
                    <div className="cadastro-completo1-progress-line"></div>
                    <div className="cadastro-completo1-progress-step">
                        <div className="cadastro-completo1-progress-circle"></div>
                        <span className="cadastro-completo1-progress-label">Passo 2</span>
                    </div>
                    <div className="cadastro-completo1-progress-line"></div>
                    <div className="cadastro-completo1-progress-step">
                        <div className="cadastro-completo1-progress-circle"></div>
                        <span className="cadastro-completo1-progress-label">Passo 3</span>
                    </div>
                </div>

                <form className="cadastro-completo1-form" onSubmit={(e) => { e.preventDefault(); handleBuscar(e); }} autoComplete="off">
                    <div className="cadastro-completo1-row">
                        <div className="cadastro-completo1-field" style={{ position: "relative" }}>
                            <label htmlFor="rua" className="cadastro-completo1-label">Rua/Avenida:</label>
                            <Input
                                id="rua"
                                placeholder="Digite a rua/avenida"
                                value={rua}
                                onChange={handleRuaChange}
                                autoComplete="off"
                                className="cadastro-completo1-input"
                            />
                            {rua && resultados.length > 0 && (
                                <div className="cadastro-completo1-resultados">
                                    {loading ? (
                                        <div className="cadastro-completo1-resultado">
                                            Buscando endereços...
                                        </div>
                                    ) : (
                                        resultados.map((endereco, idx) => (
                                            <div
                                                className="cadastro-completo1-resultado"
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
                        <div className="cadastro-completo1-field">
                            <label htmlFor="numero" className="cadastro-completo1-label">Número:</label>
                            <Input
                                id="numero"
                                placeholder="Insira o número"
                                value={numero}
                                onChange={handleNumeroChange}
                                maxLength={6}
                                className="cadastro-completo1-input"
                            />
                        </div>
                        <Botao
                            texto={loading ? 'Buscando...' : 'Buscar'}
                            type="submit"
                            disabled={loading}
                            className="cadastro-completo1-btn"
                        />
                    </div>
                </form>
            </div>

            <Modal
                isOpen={modalErro.aberto}
                onClose={() => setModalErro({ aberto: false, mensagem: '' })}
                texto={modalErro.mensagem}
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
                        onClick={() => navigate("/cadastro-beneficiado-completo2")}
                    >
                        Próximo
                    </button>
                </div>
            </Modal>
        </div>
    );
}