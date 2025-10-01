import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const dadosResumo = {
  cestasDistribuidas: { valor: 120, percentual: "+15.8%" },
  kitsDistribuidos: { valor: 370, percentual: "-0.2%" },
  familiasAcompanhadas: { valor: 156, percentual: "+15.5%" },
  filaEspera: { valor: 31, percentual: "+8.0%" }
};

const dadosGraficoLinha = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Este ano',
      data: [1200, 1500, 1800, 2100, 2800, 2600, 2400],
      borderColor: '#0097a7',
      backgroundColor: 'rgba(0, 151, 167, 0.1)',
      tension: 0.3,
    },
    {
      label: 'Ano passado',
      data: [800, 1100, 1400, 1600, 2000, 1900, 1700],
      borderColor: '#e0e0e0',
      backgroundColor: 'rgba(224, 224, 224, 0.1)',
      tension: 0.3,
    }
  ],
};

const dadosGraficoBarra = {
  labels: ['J', 'F', 'M', 'A', 'M', 'J'],
  datasets: [
    {
      data: [45, 65, 50, 85, 35, 60],
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
};

const dadosGraficoPizza = {
  labels: ['Brás', 'Glicério', 'Sé', 'Outros'],
  datasets: [
    {
      data: [52.1, 22.8, 13.9, 11.2],
      backgroundColor: [
        '#000000',
        '#42a5f5',
        '#26c6da',
        '#e0e0e0'
      ],
      borderWidth: 0,
    }
  ],
};

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
      max: 100,
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
  const [tipoUsuario, setTipoUsuario] = useState("2");
  const [filtroTempo, setFiltroTempo] = useState("Última Semana");
  const [dadosAtuais, setDadosAtuais] = useState(dadosResumo);
  const [dadosGraficoAtual, setDadosGraficoAtual] = useState(dadosGraficoLinha);

  useEffect(() => {
    const tipo = sessionStorage.getItem("tipoUsuario") || "2";
    setTipoUsuario(tipo);
  }, []);

  useEffect(() => {
    let novosDados = { ...dadosResumo };
    let novosGraficos = { ...dadosGraficoLinha };
    
    switch(filtroTempo) {
      case "Último Mês":
        novosDados = {
          cestasDistribuidas: { valor: 95, percentual: "+8.2%" },
          kitsDistribuidos: { valor: 280, percentual: "+12.5%" },
          familiasAcompanhadas: { valor: 132, percentual: "+5.8%" },
          filaEspera: { valor: 28, percentual: "-9.7%" }
        };
        novosGraficos = {
          ...dadosGraficoLinha,
          datasets: dadosGraficoLinha.datasets.map(d => ({
            ...d,
            data: d.data.map(v => v * 0.8)
          }))
        };
        break;
      case "Último Ano":
        novosDados = {
          cestasDistribuidas: { valor: 1420, percentual: "+25.8%" },
          kitsDistribuidos: { valor: 3890, percentual: "+18.2%" },
          familiasAcompanhadas: { valor: 1890, percentual: "+35.5%" },
          filaEspera: { valor: 42, percentual: "+12.0%" }
        };
        novosGraficos = {
          ...dadosGraficoLinha,
          datasets: dadosGraficoLinha.datasets.map(d => ({
            ...d,
            data: d.data.map(v => v * 1.5)
          }))
        };
        break;
      default: 
        novosDados = dadosResumo;
        novosGraficos = dadosGraficoLinha;
    }
    
    setDadosAtuais(novosDados);
    setDadosGraficoAtual(novosGraficos);
  }, [filtroTempo]);

  const botoesNavbar = [
    { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
    { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
    ...(tipoUsuario === "2" ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }] : []),
    { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
  ];

  const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";

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
              <p className="dashboard-total-periodo">TOTAL NO PERÍODO = 10.857 KG</p>
            </div>
          </div>
          <div className="dashboard-grafico-container">
            <Line data={dadosGraficoAtual} options={opcoesGraficoLinha} />
          </div>
        </div>

        {/* Gráficos Menores */}
        <div className="dashboard-graficos-pequenos">
          <div className="dashboard-grafico-pequeno">
            <h3>Distribuição de Cestas Básicas</h3>
            <div className="dashboard-grafico-container">
              <Bar data={dadosGraficoBarra} options={opcoesGraficoBarra} />
            </div>
          </div>
          
          <div className="dashboard-grafico-pequeno">
            <h3>Distribuição de Beneficiados Por Bairro</h3>
            <div className="dashboard-grafico-container">
              <Doughnut data={dadosGraficoPizza} options={opcoesGraficoPizza} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
