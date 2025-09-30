import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Voltar from '../components/Voltar';
import Modal from '../components/Modal';
import Botao from '../components/Botao';
import Input from '../components/Input';
import '../styles/CadastroBeneficiadoCompleto1.css';
import iconeCasa from '../assets/icone-casa.png';
import iconeUsuario from '../assets/icone-usuario.png';
import iconeRelogio from '../assets/icone-relogio.png';
import iconeSair from '../assets/icone-sair.png';
import { FaSearch } from 'react-icons/fa';
import { beneficiadoService } from '../services/beneficiadoService';


export default function CadastroBeneficiadoCompleto1() {
    const [rua, setRua] = useState("");
    const [numero, setNumero] = useState("");
    const [tipoUsuario, setTipoUsuario] = useState("2");
    const [resultados, setResultados] = useState([]);
    const [modalNaoEncontrado, setModalNaoEncontrado] = useState(false);
    const [modalErro, setModalErro] = useState({ aberto: false, mensagem: 'Todas as informações devem estar preenchidas.' });
    const [modalSucesso, setModalSucesso] = useState(false);
    const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const tipo = sessionStorage.getItem("tipoUsuario") || "2";
        setTipoUsuario(tipo);
    }, []);

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
        setResultados([]);
    }

    async function handleBuscar(e) {
        e.preventDefault();
        if (!rua || !numero) {
            setModalErro({ aberto: true, mensagem: 'Todas as informações devem estar preenchidas.' });
            return;
        }
        
        if (!enderecoSelecionado) {
            setModalNaoEncontrado(true);
            return;
        }
        
        // Salvar endereço selecionado para as próximas etapas
        sessionStorage.setItem("enderecoSelecionado", JSON.stringify(enderecoSelecionado));
        setModalSucesso(true);
    }

    return (
    <div className="cadastro-beneficiado-bg">
            <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
            <div className="cadastro-beneficiado-container">
                <div className="cadastro-beneficiado-voltar">
                    <Voltar onClick={() => navigate("/cadastro-beneficiado-menu")} />
                </div>
                <div className="cadastro-beneficiado-header">
                    <h1 className="cadastro-beneficiado-title">Cadastro de Beneficiado</h1>
                    <span className="cadastro-beneficiado-passo">Passo: 1/3</span>
                </div>
                                <form className="cadastro-beneficiado-form" onSubmit={handleBuscar} autoComplete="off">
                                    <div className="cadastro-beneficiado-row">
                                        <div className="cadastro-beneficiado-field" style={{ position: "relative" }}>
                                            <label htmlFor="rua">Rua/Avenida: *</label>
                                            <Input
                                                id="rua"
                                                placeholder="Ex: Rua Osvaldo Cruz"
                                                value={rua}
                                                onChange={handleRuaChange}
                                                className="cadastro-beneficiado-input"
                                                autoComplete="off"
                                            />
                                            {rua && resultados.length > 0 && (
                                                <div className="cadastro-beneficiado-resultados">
                                                    {loading ? (
                                                        <div className="cadastro-beneficiado-resultado">
                                                            Buscando endereços...
                                                        </div>
                                                    ) : (
                                                        resultados.map((endereco, idx) => (
                                                            <div
                                                                className="cadastro-beneficiado-resultado"
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
                                        <div className="cadastro-beneficiado-field">
                                            <label htmlFor="numero">Número:</label>
                                            <Input
                                                id="numero"
                                                placeholder="Insira o número"
                                                value={numero}
                                                onChange={e => setNumero(e.target.value.replace(/[^0-9]/g, ""))}
                                                className="cadastro-beneficiado-input"
                                                maxLength={6}
                                            />
                                        </div>
                                        <button className="cadastro-beneficiado-buscar" type="submit" disabled={loading}>
                                            <FaSearch className="cadastro-beneficiado-search-icon" /> 
                                            {loading ? 'Buscando...' : 'Buscar'}
                                        </button>
                                    </div>
                                </form>
                        {/* Modais fora do form */}
                        <Modal
                            isOpen={modalErro.aberto}
                            onClose={() => setModalErro({ aberto: false, mensagem: '' })}
                            texto={modalErro.mensagem}
                            showClose={true}
                        />
                        <Modal
                            isOpen={modalNaoEncontrado}
                            onClose={() => setModalNaoEncontrado(false)}
                            texto={
                                <>
                                    Endereço não encontrado.<br />
                                    <span style={{textDecoration: 'underline', color: '#0077cc', cursor: 'pointer'}} onClick={() => { setModalNaoEncontrado(false); navigate('/cadastro-endereco'); }}>
                                        Clique aqui para cadastrar endereço
                                    </span>
                                </>
                            }
                            showClose={true}
                        />
                        <Modal
                            isOpen={modalSucesso}
                            onClose={() => setModalSucesso(false)}
                            texto={"Endereço encontrado!"}
                            showClose={true}
                        >
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                                <Botao
                                    texto="Próximo"
                                    onClick={() => navigate("/cadastro-beneficiado-completo2")}
                                    className="cadastrobeneficiado-botao"
                                />
                            </div>
                        </Modal>
                    </div>
        </div>
    );
}