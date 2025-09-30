import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Voltar from '../components/Voltar';
import Modal from '../components/Modal';
import Botao from '../components/Botao';
import Input from '../components/Input';
import '../styles/CadastroBeneficiadoSimples2.css';
import iconeCasa from '../assets/icone-casa.png';
import iconeUsuario from '../assets/icone-usuario.png';
import iconeRelogio from '../assets/icone-relogio.png';
import iconeSair from '../assets/icone-sair.png';
import { FaSearch } from 'react-icons/fa';
import { beneficiadoService } from '../services/beneficiadoService';


export default function CadastroBeneficiadoSimples2() {
    const [rua, setRua] = useState("");
    const [numero, setNumero] = useState("");
    const [tipoUsuario, setTipoUsuario] = useState("2");
    const [resultados, setResultados] = useState([]);
    const [modalNaoEncontrado, setModalNaoEncontrado] = useState(false);
    const [modalErro, setModalErro] = useState({ aberto: false, mensagem: 'Todas as informações devem estar preenchidas.' });
    const [modalSucesso, setModalSucesso] = useState(false);
    const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cadastrando, setCadastrando] = useState(false);
    const navigate = useNavigate();    useEffect(() => {
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

    // Função para converter data DD/MM/AAAA para YYYY-MM-DD
    function convertDateToISO(dateStr) {
        if (!dateStr || dateStr.length !== 10) {
            console.error('Data inválida:', dateStr);
            return null;
        }
        const [day, month, year] = dateStr.split('/');
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        console.log('Convertendo data:', dateStr, 'para ISO:', isoDate);
        return isoDate;
    }

    function validarDados(nome, cpf, dataNascimento) {
        const erros = [];
        
        if (!nome || nome.trim().length === 0) {
            erros.push('Nome é obrigatório');
        }
        if (nome && nome.trim().length > 200) {
            erros.push('Nome deve ter no máximo 200 caracteres');
        }
        
        if (!cpf || !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) {
            erros.push('CPF deve estar no formato 000.000.000-00');
        } else {
            // Validar se o CPF tem exatamente 11 dígitos quando limpo
            const cpfLimpo = cpf.replace(/\D/g, '');
            if (cpfLimpo.length !== 11) {
                erros.push('CPF deve ter exatamente 11 dígitos');
            }
            // Verificar se não é um CPF inválido (todos os dígitos iguais)
            if (/^(\d)\1{10}$/.test(cpfLimpo)) {
                erros.push('CPF inválido (todos os dígitos são iguais)');
            }
        }
        
        if (!dataNascimento || !/^\d{2}\/\d{2}\/\d{4}$/.test(dataNascimento)) {
            erros.push('Data de nascimento deve estar no formato DD/MM/AAAA');
        } else {
            // Validar se a data é válida
            const [day, month, year] = dataNascimento.split('/').map(Number);
            const date = new Date(year, month - 1, day);
            if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
                erros.push('Data de nascimento é inválida');
            }
            if (year < 1900 || year > new Date().getFullYear()) {
                erros.push('Ano de nascimento deve ser entre 1900 e ' + new Date().getFullYear());
            }
            // Verificar se a pessoa não é do futuro
            if (date > new Date()) {
                erros.push('Data de nascimento não pode ser no futuro');
            }
        }
        
        return erros;
    }

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
        console.log('Endereço selecionado:', endereco); // Debug log
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
        
        setModalSucesso(true);
    }

    async function handleCadastrarBeneficiado() {
        setCadastrando(true);
        
        try {
            // Recuperar dados do sessionStorage
            const nome = sessionStorage.getItem("nomeBeneficiado");
            const cpf = sessionStorage.getItem("cpfBeneficiado");
            const dataNascimento = sessionStorage.getItem("dataNascimentoBeneficiado");
            
            console.log('Dados recuperados do sessionStorage:');
            console.log('Nome:', nome);
            console.log('CPF:', cpf);
            console.log('Data Nascimento:', dataNascimento);
            console.log('Endereço selecionado:', enderecoSelecionado);
            
            // Validar dados básicos
            const errosValidacao = validarDados(nome, cpf, dataNascimento);
            if (errosValidacao.length > 0) {
                setModalErro({ aberto: true, mensagem: 'Erros de validação: ' + errosValidacao.join(', ') });
                setModalSucesso(false);
                setCadastrando(false);
                return;
            }
            
            // Verificar se o endereço tem um ID válido (pode ser id, enderecoId, codigo, ou idEndereco)
            const enderecoId = enderecoSelecionado.id || enderecoSelecionado.enderecoId || enderecoSelecionado.codigo || enderecoSelecionado.idEndereco;
            
            console.log('Verificando ID do endereço:');
            console.log('- enderecoSelecionado.id:', enderecoSelecionado.id);
            console.log('- enderecoSelecionado.enderecoId:', enderecoSelecionado.enderecoId);
            console.log('- enderecoSelecionado.codigo:', enderecoSelecionado.codigo);
            console.log('- enderecoSelecionado.idEndereco:', enderecoSelecionado.idEndereco);
            console.log('- ID final extraído:', enderecoId);
            
            if (!enderecoSelecionado || !enderecoId) {
                let mensagemErro = 'Nenhum endereço foi selecionado ou endereço sem ID válido.';
                if (enderecoSelecionado && !enderecoId) {
                    mensagemErro = 'O endereço selecionado não possui ID válido. Estrutura do endereço: ' + JSON.stringify(enderecoSelecionado);
                }
                setModalErro({ aberto: true, mensagem: mensagemErro });
                setModalSucesso(false);
                setCadastrando(false);
                return;
            }

            const dataISO = convertDateToISO(dataNascimento);
            if (!dataISO) {
                setModalErro({ aberto: true, mensagem: 'Erro na conversão da data de nascimento.' });
                setModalSucesso(false);
                setCadastrando(false);
                return;
            }

            const dadosBeneficiado = {
                nome: nome.trim(),
                cpf: cpf.replace(/\D/g, ''), // Remove pontos e hífen do CPF
                dataNascimento: dataISO,
                enderecoId: enderecoId
            };

            console.log('Dados finais para cadastro:', dadosBeneficiado);
            
            const response = await beneficiadoService.cadastrarBeneficiadoSimples(dadosBeneficiado);
            
            if (response.success) {
                console.log('Beneficiado cadastrado com sucesso:', response.data);
                
                // Limpar dados temporários
                sessionStorage.removeItem("nomeBeneficiado");
                sessionStorage.removeItem("cpfBeneficiado");
                sessionStorage.removeItem("dataNascimentoBeneficiado");
                
                localStorage.setItem("modalSucessoBeneficiado", "true");
                navigate("/cadastro-beneficiado-menu");
            } else {
                console.error('Erro no cadastro:', response.error);
                setModalErro({ aberto: true, mensagem: response.error || 'Erro ao cadastrar beneficiado.' });
                setModalSucesso(false);
            }
        } catch (error) {
            console.error('Erro inesperado:', error);
            setModalErro({ aberto: true, mensagem: 'Erro inesperado. Tente novamente.' });
            setModalSucesso(false);
        } finally {
            setCadastrando(false);
        }
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
                    <span className="cadastro-beneficiado-passo">Passo: 2/2</span>
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
                                        resultados.map((endereco, idx) => {
                                            const enderecoId = endereco.id || endereco.enderecoId || endereco.codigo || endereco.idEndereco;
                                            return (
                                                <div
                                                    className="cadastro-beneficiado-resultado"
                                                    key={idx}
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => handleSelectEndereco(endereco)}
                                                >
                                                    {endereco.logradouro || endereco.rua}, {endereco.numero}
                                                        {!enderecoId && <span style={{color: 'red', fontSize: '12px'}}> (Sem ID)</span>}
                                                </div>
                                            );
                                        })
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
                            <span style={{ textDecoration: 'underline', color: '#0077cc', cursor: 'pointer' }} onClick={() => { setModalNaoEncontrado(false); navigate('/cadastro-endereco'); }}>
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
                            texto={cadastrando ? "Cadastrando..." : "Cadastrar Beneficiado"}
                            onClick={handleCadastrarBeneficiado}
                            className="cadastrobeneficiado-botao"
                            disabled={cadastrando}
                        />
                    </div>
                </Modal>
            </div>
        </div>
    );
}