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
import { doacaoService } from "../services/doacaoService";

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

    // Recupera o CPF do state OU do sessionStorage
    let cpf = location.state?.cpf;
    if (!cpf) {
      cpf = sessionStorage.getItem('cpfSelecionado');
    }
    if (cpf) {
      carregarBeneficiado(cpf);
    } else {
      setBeneficiado(null);
      setRetiradas([]);
      setErro("Nenhum CPF selecionado");
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
      // Buscar todos os beneficiados e encontrar pelo CPF
      const respostaBeneficiados = await beneficiadoService.listar();
      if (respostaBeneficiados.success) {
        const beneficiadoEncontrado = respostaBeneficiados.data.find(b => b.cpf === cpf);
        if (beneficiadoEncontrado) {
          setBeneficiado(beneficiadoEncontrado);
          // Carregar histórico de doações do beneficiário
          await carregarHistoricoBeneficiado(beneficiadoEncontrado.id);
        } else {
          setBeneficiado(null);
          setRetiradas([]);
          setErro("Beneficiado não encontrado");
        }
      } else {
        setErro("Erro ao buscar beneficiado: " + respostaBeneficiados.error);
      }
    } catch (error) {
      setErro("Erro ao carregar dados do beneficiado");
    } finally {
      setCarregando(false);
    }
  };

  const carregarHistoricoBeneficiado = async (beneficiadoId) => {
    try {
      const resposta = await doacaoService.buscarPorBeneficiado(beneficiadoId);
      if (resposta.success) {
        const doacoesOrdenadas = (resposta.data || []).sort((a, b) => {
          const dataA = new Date(a.data);
          const dataB = new Date(b.data);
          return ordem === 'desc' ? dataB - dataA : dataA - dataB;
        });
        setRetiradas(doacoesOrdenadas);
      } else {
        console.error('Erro ao carregar histórico:', resposta.error);
        setRetiradas([]);
      }
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

  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarTipo = (tipo) => {
    return tipo === 'kit' ? 'Kit' : tipo === 'cesta' ? 'Cesta' : tipo;
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
                <div className="consulta-beneficiados-resultado-card" key={r.id || idx}>
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
                    <span className="consulta-beneficiados-resultado-tipo-badge">{formatarTipo(r.tipo)}</span>
                  </div>
                  <div className="consulta-beneficiados-resultado-data">{formatarData(r.data)}</div>
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
