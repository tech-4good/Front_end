import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import "../styles/Home.css"; 
import "../styles/ConsultaBeneficiadosResultado.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import { beneficiadoService } from "../services/beneficiadoService";
import { entregaService } from "../services/entregaService";

export default function ConsultaBeneficiadosResultado() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tipoUsuario, setTipoUsuario] = useState("2");
  const [beneficiado, setBeneficiado] = useState(null);
  const [retiradas, setRetiradas] = useState([]);
  const [ordem, setOrdem] = useState('desc');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

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

  useEffect(() => {
    // Reordenar quando a ordem mudar
    if (retiradas.length > 0) {
      const retiradasOrdenadas = [...retiradas].sort((a, b) => {
        const dataA = new Date(a.data);
        const dataB = new Date(b.data);
        return ordem === 'desc' ? dataB - dataA : dataA - dataB;
      });
      setRetiradas(retiradasOrdenadas);
    }
  }, [ordem]);

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
      
      // Ordenar por data
      const entregasOrdenadas = entregasDoBeneficiado.sort((a, b) => {
        // Converter array [ano, mes, dia] para timestamp
        const getTimestamp = (entrega) => {
          const dataArray = entrega.dataRetirada || entrega.dataEntrega;
          if (Array.isArray(dataArray)) {
            return new Date(dataArray[0], dataArray[1] - 1, dataArray[2]).getTime();
          }
          return new Date(dataArray).getTime();
        };
        
        const timestampA = getTimestamp(a);
        const timestampB = getTimestamp(b);
        return ordem === 'desc' ? timestampB - timestampA : timestampA - timestampB;
      });
      
      setRetiradas(entregasOrdenadas);
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
    <div className="consulta-beneficiados-resultado-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
      <div className="consulta-beneficiados-resultado-container">
        <div className="consulta-beneficiados-resultado-voltar">
          <Voltar onClick={() => navigate('/consulta-beneficiados')}/>
        </div>
        <div className="consulta-beneficiados-resultado-filtro">
          <label className="consulta-beneficiados-resultado-filtro-label">Filtrar por data:</label>
          <select className="consulta-beneficiados-resultado-filtro-select" value={ordem} onChange={e => setOrdem(e.target.value)}>
            <option value="desc">Mais recente</option>
            <option value="asc">Mais antigo</option>
          </select>
        </div>
        <h1 className="consulta-beneficiados-resultado-title">Clique no nome do beneficiado para ver suas informações!</h1>
        
        {carregando && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            Carregando dados...
          </div>
        )}

        {erro && (
          <div style={{ textAlign: 'center', marginTop: 20, color: '#e74c3c' }}>
            {erro}
          </div>
        )}

        {beneficiado && !carregando && !erro ? (
          <div className="consulta-beneficiados-resultado-lista-scroll">
            {retiradas.length > 0 ? (
              retiradas.map((r, idx) => (
                <div className="consulta-beneficiados-resultado-card" key={r.idEntrega || idx}>
                    <div
                      className="consulta-beneficiados-resultado-nome"
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => {
                        sessionStorage.setItem('cpfSelecionado', beneficiado.cpf);
                        navigate('/consulta-beneficiados-menu', { state: { cpf: beneficiado.cpf } });
                      }}
                    >
                      {beneficiado.nome}
                    </div>
                  <div className="consulta-beneficiados-resultado-tipo">
                    <span className="consulta-beneficiados-resultado-tipo-badge">
                      {formatarTipo(r.cesta?.tipo || r.tipo || 'N/A')}
                    </span>
                  </div>
                  <div className="consulta-beneficiados-resultado-data">
                    {formatarData(r.dataRetirada || r.dataEntrega || r.data)}
                  </div>
                </div>
              ))
            ) : (
              <p className="consulta-beneficiados-resultado-nao-encontrado">Nenhuma retirada encontrada para este beneficiado.</p>
            )}
          </div>
        ) : !carregando && !erro ? (
          <p className="consulta-beneficiados-resultado-nao-encontrado">Beneficiado não encontrado.</p>
        ) : null}
      </div>
    </div>
  );
}
