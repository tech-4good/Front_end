import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import "../styles/ConsultaBeneficiadosResultado.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import iconeVoltar from "../assets/icone-voltar.png";
import { beneficiadoService } from "../services/beneficiadoService";
import { entregaService } from "../services/entregaService";

export default function ConsultaBeneficiadosResultado() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tipoUsuario, setTipoUsuario] = useState("2");
  const [beneficiado, setBeneficiado] = useState(null);
  const [retiradas, setRetiradas] = useState([]);
  const [retiradasOriginais, setRetiradasOriginais] = useState([]); // Para manter dados originais
  const [filtroAtivo, setFiltroAtivo] = useState('todos');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [modalPeriodo, setModalPeriodo] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    const tipo = sessionStorage.getItem("tipoUsuario") || "2";
    setTipoUsuario(tipo);

    // Recupera os dados do beneficiado do state passado pela navegação
    const beneficiadoData = location.state?.beneficiado;
    
    if (beneficiadoData) {
      console.log('Dados do beneficiado recebidos:', beneficiadoData);
      setBeneficiado(beneficiadoData);
      // Carregar histórico de doações do beneficiário
      carregarHistoricoBeneficiado(beneficiadoData.id);
    } else {
      // Fallback: tentar recuperar CPF do sessionStorage
      const cpf = sessionStorage.getItem('cpfSelecionado');
      if (cpf) {
        carregarBeneficiado(cpf);
      } else {
        setBeneficiado(null);
        setRetiradas([]);
        setErro("Nenhum beneficiado selecionado");
      }
    }
  }, [location]);

  // Aplicar filtros quando filtroAtivo ou retiradasOriginais mudarem
  useEffect(() => {
    aplicarFiltro();
  }, [filtroAtivo, retiradasOriginais]);

  const aplicarFiltro = () => {
    if (retiradasOriginais.length === 0) return;

    let dadosFiltrados = [...retiradasOriginais];

    // Filtrar por tipo
    if (filtroAtivo === 'kit') {
      dadosFiltrados = dadosFiltrados.filter(r => {
        const tipo = (r.cesta?.tipo || r.tipo || '').toLowerCase();
        return tipo.includes('kit');
      });
    } else if (filtroAtivo === 'cesta') {
      dadosFiltrados = dadosFiltrados.filter(r => {
        const tipo = (r.cesta?.tipo || r.tipo || '').toLowerCase();
        return tipo.includes('cesta') || tipo.includes('basica');
      });
    }

    // Filtrar por período customizado
    if (filtroAtivo === 'periodo-customizado' && dataInicio && dataFim) {
      const timestampInicio = new Date(dataInicio).getTime();
      const timestampFim = new Date(dataFim).getTime();
      
      dadosFiltrados = dadosFiltrados.filter(r => {
        const timestamp = getTimestamp(r);
        return timestamp >= timestampInicio && timestamp <= timestampFim;
      });
    }

    // Ordenar por data
    if (filtroAtivo === 'mais-novo' || filtroAtivo === 'todos') {
      dadosFiltrados.sort((a, b) => {
        const timestampA = getTimestamp(a);
        const timestampB = getTimestamp(b);
        return timestampB - timestampA; // Mais novo primeiro
      });
    } else if (filtroAtivo === 'mais-antigo') {
      dadosFiltrados.sort((a, b) => {
        const timestampA = getTimestamp(a);
        const timestampB = getTimestamp(b);
        return timestampA - timestampB; // Mais antigo primeiro
      });
    } else if (filtroAtivo === 'periodo-customizado') {
      dadosFiltrados.sort((a, b) => {
        const timestampA = getTimestamp(a);
        const timestampB = getTimestamp(b);
        return timestampB - timestampA; // Mais novo primeiro por padrão
      });
    }

    setRetiradas(dadosFiltrados);
  };

  const handleFiltroChange = (e) => {
    const novoFiltro = e.target.value;
    if (novoFiltro === 'periodo-customizado') {
      setModalPeriodo(true);
    } else {
      setFiltroAtivo(novoFiltro);
    }
  };

  const aplicarPeriodoCustomizado = () => {
    if (dataInicio && dataFim) {
      setFiltroAtivo('periodo-customizado');
      setModalPeriodo(false);
    }
  };

  const getTimestamp = (entrega) => {
    const dataArray = entrega.dataRetirada || entrega.dataEntrega || entrega.data;
    if (Array.isArray(dataArray)) {
      return new Date(dataArray[0], dataArray[1] - 1, dataArray[2]).getTime();
    }
    return new Date(dataArray).getTime();
  };

  const carregarBeneficiado = async (cpf) => {
    setCarregando(true);
    setErro("");
    try {
      console.log('Carregando beneficiado com CPF:', cpf);
      // Usar buscarPorCpf diretamente em vez de listar todos
      const respostaBeneficiado = await beneficiadoService.buscarPorCpf(cpf);
      if (respostaBeneficiado.success) {
        console.log('Beneficiado encontrado:', respostaBeneficiado.data);
        setBeneficiado(respostaBeneficiado.data);
        // Carregar histórico de doações do beneficiário
        await carregarHistoricoBeneficiado(respostaBeneficiado.data.id);
      } else {
        console.error('Beneficiado não encontrado:', respostaBeneficiado.error);
        setBeneficiado(null);
        setRetiradas([]);
        setErro(respostaBeneficiado.error || "Beneficiado não encontrado");
      }
    } catch (error) {
      console.error('Erro ao carregar dados do beneficiado:', error);
      setErro("Erro ao carregar dados do beneficiado");
    } finally {
      setCarregando(false);
    }
  };

  const carregarHistoricoBeneficiado = async (beneficiadoId) => {
    try {
      console.log('Carregando histórico para beneficiado ID:', beneficiadoId);
      
      // ✅ Usar endpoint específico de histórico em vez de filtrar manualmente
      const resposta = await entregaService.buscarHistorico(beneficiadoId);
      
      console.log('📦 Entregas do beneficiado retornadas pelo backend:', resposta);
      
      // ✅ Backend pode retornar objeto paginado {content: [...]} ou array direto
      let entregasDoBeneficiado = [];
      
      if (Array.isArray(resposta)) {
        entregasDoBeneficiado = resposta;
      } else if (resposta?.content && Array.isArray(resposta.content)) {
        entregasDoBeneficiado = resposta.content;
      } else {
        console.warn('⚠️ Formato de resposta inesperado:', resposta);
        setRetiradas([]);
        return;
      }
      
      if (entregasDoBeneficiado.length === 0) {
        console.log('ℹ️ Nenhuma entrega encontrada para este beneficiado');
        setRetiradas([]);
        return;
      }
      
      // Salvar dados originais para filtragem
      setRetiradasOriginais(entregasDoBeneficiado);
    } catch (error) {
      console.error('Erro ao carregar histórico do beneficiário:', error);
      setRetiradas([]);
    }
  };

  const botoesNavbar = [
    { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
    { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
    ...(tipoUsuario === "2" ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }] : []),
    { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
  ];

  const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";

  const formatarData = (dataArray) => {
    // Se for array [ano, mes, dia] do backend
    if (Array.isArray(dataArray) && dataArray.length === 3) {
      const [ano, mes, dia] = dataArray;
      return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
    }
    
    // Se for string ISO ou outro formato
    if (typeof dataArray === 'string') {
      const data = new Date(dataArray);
      return data.toLocaleDateString('pt-BR');
    }
    
    return 'Data não disponível';
  };

  const formatarTipo = (tipo) => {
    if (!tipo) return 'N/A';
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('kit')) return 'Kit';
    if (tipoLower.includes('cesta') || tipoLower.includes('basica')) return 'Cesta Básica';
    return tipo;
  };

  return (
    <div>
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isConsultaBeneficiadosPage={true} />
      <div className="consulta-beneficiados-resultado-container">
        <img 
          src={iconeVoltar} 
          alt="Voltar" 
          className="consulta-beneficiados-resultado-icone-voltar"
          onClick={() => navigate('/consulta-beneficiados')}
        />
        
        <div className="consulta-beneficiados-resultado-filtro">
          <label className="consulta-beneficiados-resultado-filtro-label">Filtrar por:</label>
          <select 
            className="consulta-beneficiados-resultado-filtro-select" 
            value={filtroAtivo} 
            onChange={handleFiltroChange}
          >
            <option value="todos">Todos</option>
            <option value="kit">Kit</option>
            <option value="cesta">Cesta Básica</option>
            <option value="mais-novo">Mais novo primeiro</option>
            <option value="mais-antigo">Mais antigo primeiro</option>
            <option value="periodo-customizado">Período Customizado</option>
          </select>
        </div>
        
        <div className="consulta-beneficiados-resultado-title-container">
          <h1 className="consulta-beneficiados-resultado-title">
            Clique no nome do beneficiado para ver suas informações!
          </h1>
        </div>
        
        {carregando && (
          <div className="consulta-beneficiados-resultado-loading">
            Carregando dados...
          </div>
        )}

        {erro && (
          <div className="consulta-beneficiados-resultado-erro">
            {erro}
          </div>
        )}

        {beneficiado && !carregando && !erro ? (
          <div className="consulta-beneficiados-resultado-lista">
            {retiradas.length > 0 ? (
              retiradas.map((r, idx) => (
                <div className="consulta-beneficiados-resultado-card" key={r.idEntrega || idx}>
                  <div
                    className="consulta-beneficiados-resultado-nome"
                    onClick={() => {
                      sessionStorage.setItem('cpfSelecionado', beneficiado.cpf);
                      navigate('/consulta-beneficiados-menu', { state: { cpf: beneficiado.cpf } });
                    }}
                  >
                    {beneficiado.nome}
                  </div>
                  <div className="consulta-beneficiados-resultado-tipo-badge">
                    {formatarTipo(r.cesta?.tipo || r.tipo || 'Kit')}
                  </div>
                  <div className="consulta-beneficiados-resultado-data">
                    {formatarData(r.dataRetirada || r.dataEntrega || r.data)}
                  </div>
                </div>
              ))
            ) : (
              <div className="consulta-beneficiados-resultado-nao-encontrado">
                Nenhuma retirada encontrada para este beneficiado.
              </div>
            )}
          </div>
        ) : !carregando && !erro ? (
          <div className="consulta-beneficiados-resultado-nao-encontrado">
            Beneficiado não encontrado.
          </div>
        ) : null}
        
        {/* Modal para período customizado */}
        <Modal
          isOpen={modalPeriodo}
          onClose={() => {
            setModalPeriodo(false);
            setDataInicio('');
            setDataFim('');
          }}
          texto={
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Selecione o Período</h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Data Início:</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Data Fim:</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>
          }
          showClose={false}
          botoes={[
            {
              texto: "Cancelar",
              onClick: () => {
                setModalPeriodo(false);
                setDataInicio('');
                setDataFim('');
              }
            },
            {
              texto: "Aplicar",
              onClick: aplicarPeriodoCustomizado
            }
          ]}
        />
      </div>
    </div>
  );
}
