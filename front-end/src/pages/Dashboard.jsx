import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";

import dashboardService from "../services/dashboardService";
import "../styles/Home.css";
import "../styles/Dashboard.css";

import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import iconeVoltar from "../assets/icone-voltar.png";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const opcoesGraficoLinha = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        boxWidth: 12,
        padding: 20,
        font: {
          size: 12
        }
      }
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#f0f0f0',
      },
      ticks: {
        font: {
          size: 11
        }
      }
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11
        }
      }
    }
  },
};

const opcoesGraficoBarra = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#f0f0f0',
      },
      ticks: {
        font: {
          size: 11
        }
      }
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11
        }
      }
    }
  },
};

const opcoesGraficoPizza = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      align: 'center',
      labels: {
        boxWidth: 15,
        padding: 20,
        font: {
          size: 13
        },
        generateLabels: function(chart) {
          const data = chart.data;
          if (data.labels.length && data.datasets.length) {
            return data.labels.map((label, i) => {
              const dataset = data.datasets[0];
              const value = dataset.data[i];
              return {
                text: `${label} ${value}%`,
                fillStyle: dataset.backgroundColor[i],
                strokeStyle: dataset.backgroundColor[i],
                lineWidth: 0,
                index: i
              };
            });
          }
          return [];
        }
      }
    },
  },
  layout: {
    padding: 20
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tipoUsuario, setTipoUsuario] = useState("2");
  const [filtroAtivo, setFiltroAtivo] = useState('todos');
  const [modalPeriodo, setModalPeriodo] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [dadosAtuais, setDadosAtuais] = useState({
    cestasDistribuidas: { valor: 0, percentual: "0%" },
    kitsDistribuidos: { valor: 0, percentual: "0%" },
    familiasAcompanhadas: { valor: 0, percentual: "0%" }
  });
  const [dadosGraficoAtual, setDadosGraficoAtual] = useState({
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [{
      label: 'Este ano',
      data: [0, 0, 0, 0, 0, 0],
      borderColor: '#0097a7',
      backgroundColor: 'rgba(0, 151, 167, 0.1)',
      tension: 0.3,
    }]
  });
  const [dadosGraficoBairroAtual, setDadosGraficoBairroAtual] = useState({
    labels: ['Carregando...'],
    datasets: [{
      data: [100],
      backgroundColor: ['#e0e0e0'],
      borderWidth: 0,
    }]
  });
  const [dadosGraficoBarraAtual, setDadosGraficoBarraAtual] = useState({
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: [
        '#8e24aa',
        '#26c6da',
        '#000000',
        '#42a5f5',
        '#66bb6a',
        '#ffa726'
      ],
      borderRadius: 8,
    }]
  });
  const [loading, setLoading] = useState(true);
  const [totalKilos, setTotalKilos] = useState(0);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(Date.now());

  // Carregar dados ao montar e sempre que a rota mudar (voltar para dashboard)
  useEffect(() => {
    const tipo = sessionStorage.getItem("tipoUsuario") || "2";
    setTipoUsuario(tipo);
    
    console.log("🔄 Dashboard montada/atualizada - carregando dados...");
    carregarDadosDashboard();

    // Recarregar dados quando a janela receber foco (usuário volta para a aba)
    const handleFocus = () => {
      const agora = Date.now();
      // Só recarregar se passou mais de 2 segundos desde a última atualização
      if (agora - ultimaAtualizacao > 2000) {
        console.log("🔄 Página recebeu foco, recarregando dados...");
        setUltimaAtualizacao(agora);
        carregarDadosDashboard();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const agora = Date.now();
        // Só recarregar se passou mais de 2 segundos desde a última atualização
        if (agora - ultimaAtualizacao > 2000) {
          console.log("🔄 Página ficou visível, recarregando dados...");
          setUltimaAtualizacao(agora);
          carregarDadosDashboard();
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location]); // Recarrega quando a location muda (navegação)

  // Recarregar quando o filtro mudar
  useEffect(() => {
    // Não carregar no mount inicial (já foi carregado acima)
    if (filtroAtivo && !loading) {
      console.log("🔄 Filtro mudou para:", filtroAtivo);
      carregarDadosDashboard();
    }
  }, [filtroAtivo]);
  
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

  async function carregarDadosDashboard() {
    try {
      setLoading(true);
      console.log("📊 Carregando dados do dashboard com filtro:", filtroAtivo);
      console.log("📅 Datas customizadas:", { dataInicio, dataFim });

      // Buscar estatísticas gerais com filtro
      const estatisticas = await dashboardService.buscarEstatisticasGerais(
        filtroAtivo, 
        dataInicio, 
        dataFim
      );
      if (estatisticas.success) {
        console.log("✅ Estatísticas carregadas:", estatisticas.data);
        setDadosAtuais(estatisticas.data);
      } else {
        console.warn("⚠️ Erro ao carregar estatísticas");
      }

      // Buscar dados do gráfico de linha
      const dadosGrafico = await dashboardService.buscarDadosGraficoLinha();
      if (dadosGrafico.success) {
        console.log("✅ Dados do gráfico carregados:", dadosGrafico.data);
        
        const total = dadosGrafico.data.valores.reduce((acc, val) => acc + val, 0);
        setTotalKilos(total);

        setDadosGraficoAtual({
          labels: dadosGrafico.data.labels,
          datasets: [
            {
              label: 'Este ano',
              data: dadosGrafico.data.valores,
              borderColor: '#0097a7',
              backgroundColor: 'rgba(0, 151, 167, 0.1)',
              tension: 0.3,
            }
          ],
        });
      } else {
        console.warn("⚠️ Erro ao carregar dados do gráfico");
      }

      // Buscar dados de distribuição por bairro
      const dadosBairro = await dashboardService.buscarDadosPorBairro();
      if (dadosBairro.success && dadosBairro.data.length > 0) {
        console.log("✅ Dados por bairro carregados:", dadosBairro.data);
        
        const labels = dadosBairro.data.map(item => item.bairro);
        const valores = dadosBairro.data.map(item => parseFloat(item.percentual));
        
        setDadosGraficoBairroAtual({
          labels,
          datasets: [
            {
              data: valores,
              backgroundColor: [
                '#000000',
                '#42a5f5',
                '#26c6da',
                '#e0e0e0'
              ],
              borderWidth: 0,
            }
          ],
        });
      } else {
        console.warn("⚠️ Erro ao carregar dados por bairro");
      }

      // Buscar dados para gráfico de barras (entregas por mês)
      if (dadosGrafico.success && dadosGrafico.data.valores.length > 0) {
        const ultimos6Meses = dadosGrafico.data.labels.slice(-6);
        const valores6Meses = dadosGrafico.data.valores.slice(-6);
        
        setDadosGraficoBarraAtual({
          labels: ultimos6Meses,
          datasets: [
            {
              data: valores6Meses,
              backgroundColor: [
                '#8e24aa',
                '#26c6da',
                '#000000',
                '#42a5f5',
                '#66bb6a',
                '#ffa726'
              ],
              borderRadius: 8,
            }
          ],
        });
      }

    } catch (error) {
      console.error("❌ Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  }



  const botoesNavbar = [
    { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
    { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },

    { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
  ];

  const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";

  if (loading) {
    return (
      <div className="dashboard-bg">
        <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isRelatoriosPage={true} />
        <div className="dashboard-container">
          <div className="dashboard-header">
            <img 
              src={iconeVoltar} 
              alt="Voltar" 
              className="dashboard-icone-voltar"
              onClick={() => navigate('/painel-menu')}
            />
          </div>
          <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' }}>
            Carregando dados do dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isRelatoriosPage={true} />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <img 
            src={iconeVoltar} 
            alt="Voltar" 
            className="dashboard-icone-voltar"
            onClick={() => navigate('/painel-menu')}
          />
          <div className="dashboard-filtro">
            <label className="dashboard-filtro-label">Filtrar por:</label>
            <select 
              className="dashboard-filtro-select" 
              value={filtroAtivo} 
              onChange={handleFiltroChange}
            >
              <option value="ultimo-ano">Último Ano</option>
              <option value="ultimo-dia">Último Dia</option>
              <option value="ultima-semana">Última Semana</option>
              <option value="ultimo-mes">Último Mês</option>
              <option value="periodo-customizado">Período Customizado</option>
            </select>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="dashboard-cards-resumo">
          <div className="dashboard-card-resumo">
            <div className="dashboard-card-titulo">Cestas Distribuídas</div>
            <div className="dashboard-card-valor">{dadosAtuais.cestasDistribuidas.valor}</div>
            <div className={`dashboard-card-percentual ${dadosAtuais.cestasDistribuidas.percentual.startsWith('+') ? 'positivo' : 'negativo'}`}>
              {dadosAtuais.cestasDistribuidas.percentual}
            </div>
          </div>
          
          <div className="dashboard-card-resumo">
            <div className="dashboard-card-titulo">Kits Distribuídos</div>
            <div className="dashboard-card-valor">{dadosAtuais.kitsDistribuidos.valor}</div>
            <div className={`dashboard-card-percentual ${dadosAtuais.kitsDistribuidos.percentual.startsWith('+') ? 'positivo' : 'negativo'}`}>
              {dadosAtuais.kitsDistribuidos.percentual}
            </div>
          </div>
          
          <div className="dashboard-card-resumo">
            <div className="dashboard-card-titulo">Famílias Acompanhadas</div>
            <div className="dashboard-card-valor">{dadosAtuais.familiasAcompanhadas.valor}</div>
            <div className={`dashboard-card-percentual ${dadosAtuais.familiasAcompanhadas.percentual.startsWith('+') ? 'positivo' : 'negativo'}`}>
              {dadosAtuais.familiasAcompanhadas.percentual}
            </div>
          </div>
          

        </div>

        {/* Layout com colunas */}
        <div className="dashboard-content-wrapper">
          <div className="dashboard-left-column">
            {/* Gráfico de Linha */}
            <div className="dashboard-grafico-grande">
              <div className="dashboard-grafico-header">
                <div>
                  <h3>Total de Kilos Doados</h3>
                  <p className="dashboard-total-periodo">TOTAL NO PERÍODO = {totalKilos.toLocaleString('pt-BR')} KG</p>
                </div>
              </div>
              <div className="dashboard-grafico-container">
                <Line data={dadosGraficoAtual} options={opcoesGraficoLinha} />
              </div>
            </div>

            {/* Gráfico de Barras */}
            <div className="dashboard-graficos-pequenos">
              <div className="dashboard-grafico-pequeno">
                <h3>Distribuição de Cestas (KG por Mês)</h3>
                <div className="dashboard-grafico-container">
                  <Bar data={dadosGraficoBarraAtual} options={opcoesGraficoBarra} />
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-right-column">
            {/* Gráfico de Pizza */}
            <div className="dashboard-grafico-direita">
              <h3>Distribuição de Beneficiados Por Bairro</h3>
              <div className="dashboard-grafico-container">
                <Doughnut data={dadosGraficoBairroAtual} options={opcoesGraficoPizza} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
  );
}
