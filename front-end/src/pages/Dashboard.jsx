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
import Voltar from "../components/Voltar";
import dashboardService from "../services/dashboardService";
import "../styles/Home.css";
import "../styles/Dashboard.css";

import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

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
  const [filtroTempo, setFiltroTempo] = useState("Última Semana");
  const [dadosAtuais, setDadosAtuais] = useState({
    cestasDistribuidas: { valor: 0, percentual: "0%" },
    kitsDistribuidos: { valor: 0, percentual: "0%" },
    familiasAcompanhadas: { valor: 0, percentual: "0%" },
    filaEspera: { valor: 0, percentual: "0%" }
  });
  const [dadosGraficoAtual, setDadosGraficoAtual] = useState({
    labels: [],
    datasets: []
  });
  const [dadosGraficoBairroAtual, setDadosGraficoBairroAtual] = useState({
    labels: [],
    datasets: []
  });
  const [dadosGraficoBarraAtual, setDadosGraficoBarraAtual] = useState({
    labels: [],
    datasets: []
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
    if (filtroTempo && !loading) {
      console.log("🔄 Filtro mudou para:", filtroTempo);
      carregarDadosDashboard();
    }
  }, [filtroTempo]);

  async function carregarDadosDashboard() {
    try {
      setLoading(true);
      console.log("📊 Carregando dados do dashboard com filtro:", filtroTempo);

      // Buscar estatísticas gerais com filtro
      const estatisticas = await dashboardService.buscarEstatisticasGerais(filtroTempo);
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
    ...(tipoUsuario === "2" ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }] : []),
    { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
  ];

  const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";

  if (loading) {
    return (
      <div className="dashboard-bg">
        <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
        <div className="dashboard-container">
          <div className="dashboard-header">
            <div className="dashboard-voltar">
              <Voltar onClick={() => navigate('/painel-menu')} />
            </div>
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
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-voltar">
            <Voltar onClick={() => navigate('/painel-menu')} />
          </div>
          <div className="dashboard-filtro">
            <label>Filtrar por</label>
            <select 
              value={filtroTempo} 
              onChange={(e) => setFiltroTempo(e.target.value)}
              className="dashboard-select"
            >
              <option value="Última Semana">Última Semana</option>
              <option value="Último Mês">Último Mês</option>
              <option value="Último Ano">Último Ano</option>
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
          
          <div className="dashboard-card-resumo">
            <div className="dashboard-card-titulo">Fila de Espera</div>
            <div className="dashboard-card-valor">{dadosAtuais.filaEspera.valor}</div>
            <div className={`dashboard-card-percentual ${dadosAtuais.filaEspera.percentual.startsWith('+') ? 'positivo' : 'negativo'}`}>
              {dadosAtuais.filaEspera.percentual}
            </div>
          </div>
        </div>

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

        {/* Gráficos Menores */}
        <div className="dashboard-graficos-pequenos">
          <div className="dashboard-grafico-pequeno">
            <h3>Distribuição de Cestas (KG por Mês)</h3>
            <div className="dashboard-grafico-container">
              <Bar data={dadosGraficoBarraAtual} options={opcoesGraficoBarra} />
            </div>
          </div>
          
          <div className="dashboard-grafico-pequeno">
            <h3>Distribuição de Beneficiados Por Bairro</h3>
            <div className="dashboard-grafico-container">
              <Doughnut data={dadosGraficoBairroAtual} options={opcoesGraficoPizza} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
