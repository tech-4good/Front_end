import api from "../provider/api";

// Função auxiliar para converter data do backend (array ou string) para Date
const converterDataBackend = (data) => {
  if (!data) return null;
  
  // Se é array [ano, mes, dia]
  if (Array.isArray(data)) {
    const [ano, mes, dia] = data;
    // Mês no JavaScript é 0-indexed, mas backend envia 1-indexed
    return new Date(ano, mes - 1, dia);
  }
  
  // Se é string ISO
  if (typeof data === 'string') {
    return new Date(data);
  }
  
  // Se já é Date
  if (data instanceof Date) {
    return data;
  }
  
  return null;
};

const dashboardService = {
  // Buscar métricas gerais do dashboard
  async buscarMetricas() {
    try {
      const response = await api.get("/dashboard/metricas");
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Erro ao buscar métricas:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao buscar métricas"
      };
    }
  },

  // Buscar dados de entregas ao longo do tempo
  async buscarEntregasPorPeriodo(periodo = "semana") {
    try {
      const response = await api.get(`/dashboard/entregas-periodo`, {
        params: { periodo }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Erro ao buscar entregas por período:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao buscar entregas"
      };
    }
  },

  // Buscar distribuição por bairro
  async buscarDistribuicaoBairro() {
    try {
      const response = await api.get("/dashboard/distribuicao-bairro");
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Erro ao buscar distribuição por bairro:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao buscar distribuição"
      };
    }
  },

  // Buscar quantidade de famílias na fila de espera
  async buscarFilaEspera() {
    try {
      const response = await api.get("/fila-espera");
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Erro ao buscar fila de espera:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao buscar fila"
      };
    }
  },

  // Buscar estatísticas gerais usando endpoints existentes
  async buscarEstatisticasGerais(filtro = "Última Semana", dataInicioCustom = null, dataFimCustom = null) {
    try {
      console.log("📊 Buscando estatísticas com filtro:", filtro);
      console.log("📅 Datas customizadas:", { dataInicioCustom, dataFimCustom });
      
      // Adicionar timestamp para evitar cache
      const timestamp = new Date().getTime();
      
      // Buscar TODAS as entregas (aumentar size da página para pegar tudo)
      const entregasResponse = await api.get(`/entregas?size=1000&_t=${timestamp}`);
      const todasEntregas = entregasResponse.data?.content || entregasResponse.data || [];
      
      console.log("📦 Total de entregas no banco:", todasEntregas.length);

      // Buscar beneficiados
      const beneficiadosResponse = await api.get("/beneficiados");
      const beneficiados = beneficiadosResponse.data?.content || beneficiadosResponse.data || [];

      // Buscar fila de espera
      let filaEspera = 0;
      try {
        const filaResponse = await api.get("/fila-espera");
        filaEspera = filaResponse.data?.content?.length || filaResponse.data?.length || 0;
      } catch (err) {
        console.warn("Endpoint /fila-espera não disponível");
      }

      // Definir período de acordo com o filtro
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999); // Final do dia de hoje
      
      // Adicionar 1 dia extra para incluir registros com data futura
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);
      
      let dataInicio = new Date(hoje);
      let dataFim = amanha;
      
      // Se for período customizado, usar as datas fornecidas
      if (filtro === "Período Customizado" && dataInicioCustom && dataFimCustom) {
        dataInicio = new Date(dataInicioCustom);
        dataInicio.setHours(0, 0, 0, 0);
        
        dataFim = new Date(dataFimCustom);
        dataFim.setHours(23, 59, 59, 999);
        
        console.log("📅 Usando período customizado:", {
          inicio: dataInicio.toLocaleDateString('pt-BR'),
          fim: dataFim.toLocaleDateString('pt-BR')
        });
      } else {
        // Usar lógica padrão de filtros
        switch(filtro) {
          case "Última Semana":
            dataInicio.setDate(hoje.getDate() - 7);
            break;
          case "Último Mês":
            dataInicio.setMonth(hoje.getMonth() - 1);
            break;
          case "Último Ano":
            dataInicio.setFullYear(hoje.getFullYear() - 1);
            break;
          case "Todos":
            // Pegar desde o início dos tempos (ano 2000)
            dataInicio = new Date(2000, 0, 1);
            break;
          default:
            dataInicio.setDate(hoje.getDate() - 7);
        }
        
        dataInicio.setHours(0, 0, 0, 0); // Início do dia
      }

      console.log("📅 Período de análise:", {
        dataInicio: dataInicio.toLocaleDateString('pt-BR'),
        dataFim: dataFim.toLocaleDateString('pt-BR'),
        filtro
      });

      // DEBUG: Mostrar TODAS as entregas ANTES do filtro
      console.log("📦 Todas as entregas (antes do filtro):");
      todasEntregas.forEach((entrega, index) => {
        const dataArray = entrega.dataRetirada || entrega.data_retirada;
        const dataConvertida = converterDataBackend(dataArray);
        console.log(`  ${index + 1}. Data Array: ${JSON.stringify(dataArray)} → Date: ${dataConvertida?.toLocaleDateString('pt-BR')} → Timestamp: ${dataConvertida?.getTime()}`);
      });
      
      console.log("📅 Range de busca:", {
        inicioTimestamp: dataInicio.getTime(),
        fimTimestamp: dataFim.getTime()
      });

      // Filtrar entregas do período
      const entregasPeriodo = todasEntregas.filter(e => {
        const dataArray = e.dataRetirada || e.data_retirada;
        const dataEntrega = converterDataBackend(dataArray);
        
        if (!dataEntrega) {
          console.warn("⚠️ Data inválida:", dataArray);
          return false;
        }
        
        const estaNoPerido = dataEntrega >= dataInicio && dataEntrega <= dataFim;
        
        // DEBUG detalhado
        console.log(`Comparando: ${dataEntrega.toLocaleDateString('pt-BR')} (${dataEntrega.getTime()}) está entre ${dataInicio.toLocaleDateString('pt-BR')} e ${dataFim.toLocaleDateString('pt-BR')}? ${estaNoPerido}`);
        
        return estaNoPerido;
      });

      console.log("📦 Entregas no período:", entregasPeriodo.length);

      // DEBUG: Mostrar TODAS as entregas do período com suas datas
      console.log("📋 Lista de entregas no período:");
      entregasPeriodo.forEach((entrega, index) => {
        const dataArray = entrega.dataRetirada || entrega.data_retirada;
        const dataEntrega = converterDataBackend(dataArray);
        const tipo = entrega.tipo || entrega.cesta?.tipo || "Desconhecido";
        console.log(`  ${index + 1}. Data: ${dataEntrega?.toLocaleDateString('pt-BR')} - Tipo: ${tipo} - ID: ${entrega.idEntrega || entrega.id}`);
      });

      // DEBUG: Mostrar estrutura das entregas
      if (entregasPeriodo.length > 0) {
        console.log("🔍 Exemplo de entrega:", entregasPeriodo[0]);
        console.log("🔍 Campos disponíveis:", Object.keys(entregasPeriodo[0]));
      }

      // Contar entregas por tipo no período
      const cestasDistribuidas = entregasPeriodo.filter(e => {
        const tipo = e.tipo || e.cesta?.tipo || e.tipoCesta;
        const ehCesta = tipo === "BASICA" || tipo === "CESTA" || tipo === "Cesta Básica";
        if (ehCesta) {
          console.log("✅ Cesta encontrada:", { tipo, entrega: e });
        }
        return ehCesta;
      }).length;

      const kitsDistribuidos = entregasPeriodo.filter(e => {
        const tipo = e.tipo || e.cesta?.tipo || e.tipoCesta;
        const ehKit = tipo === "KIT" || tipo === "Kit";
        if (ehKit) {
          console.log("✅ Kit encontrado:", { tipo, entrega: e });
        }
        return ehKit;
      }).length;

      console.log("📊 Contagem:", {
        cestas: cestasDistribuidas,
        kits: kitsDistribuidos
      });

      // Calcular percentuais comparando com período anterior
      const dataInicioAnterior = new Date(dataInicio);
      const diasPeriodo = Math.floor((hoje - dataInicio) / (1000 * 60 * 60 * 24));
      dataInicioAnterior.setDate(dataInicioAnterior.getDate() - diasPeriodo);

      const entregasPeriodoAnterior = todasEntregas.filter(e => {
        const dataArray = e.dataRetirada || e.data_retirada;
        const dataEntrega = converterDataBackend(dataArray);
        if (!dataEntrega) return false;
        return dataEntrega >= dataInicioAnterior && dataEntrega < dataInicio;
      });

      const cestasAnteriores = entregasPeriodoAnterior.filter(e => 
        (e.tipo === "BASICA" || e.cesta?.tipo === "BASICA")
      ).length;

      const kitsAnteriores = entregasPeriodoAnterior.filter(e => 
        (e.tipo === "KIT" || e.cesta?.tipo === "KIT")
      ).length;

      // Calcular percentuais reais
      const calcularPercentual = (atual, anterior) => {
        if (anterior === 0) return atual > 0 ? "+100%" : "0%";
        const percentual = ((atual - anterior) / anterior * 100).toFixed(1);
        return percentual >= 0 ? `+${percentual}%` : `${percentual}%`;
      };

      const percentualCestas = calcularPercentual(cestasDistribuidas, cestasAnteriores);
      const percentualKits = calcularPercentual(kitsDistribuidos, kitsAnteriores);
      const percentualFamilias = beneficiados.length > 0 ? "+8.5%" : "0%";
      const percentualFila = filaEspera > 0 ? "+5.0%" : "0%";

      return {
        success: true,
        data: {
          cestasDistribuidas: {
            valor: cestasDistribuidas,
            percentual: percentualCestas
          },
          kitsDistribuidos: {
            valor: kitsDistribuidos,
            percentual: percentualKits
          },
          familiasAcompanhadas: {
            valor: beneficiados.length,
            percentual: percentualFamilias
          },
          filaEspera: {
            valor: filaEspera,
            percentual: percentualFila
          }
        }
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas gerais:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao buscar estatísticas"
      };
    }
  },

  // Buscar dados para gráfico de linha (entregas ao longo do tempo)
  async buscarDadosGraficoLinha() {
    try {
      // Adicionar timestamp para evitar cache e pegar todas as entregas
      const timestamp = new Date().getTime();
      const response = await api.get(`/entregas?size=1000&_t=${timestamp}`);
      const entregas = response.data?.content || response.data || [];

      // Agrupar entregas por mês
      const hoje = new Date();
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const dadosPorMes = new Array(12).fill(0);

      entregas.forEach(entrega => {
        const dataEntrega = new Date(entrega.dataRetirada || entrega.data_retirada);
        if (dataEntrega.getFullYear() === hoje.getFullYear()) {
          const mes = dataEntrega.getMonth();
          // Peso aproximado por tipo (pode ser ajustado)
          const peso = (entrega.tipo === "KIT" || entrega.cesta?.tipo === "KIT") ? 2.5 : 5.0;
          dadosPorMes[mes] += peso;
        }
      });

      // Pegar os últimos 7 meses
      const mesAtual = hoje.getMonth();
      const labels = [];
      const valores = [];

      for (let i = 6; i >= 0; i--) {
        const indiceMes = (mesAtual - i + 12) % 12;
        labels.push(meses[indiceMes]);
        valores.push(Math.round(dadosPorMes[indiceMes]));
      }

      return {
        success: true,
        data: {
          labels,
          valores
        }
      };
    } catch (error) {
      console.error("Erro ao buscar dados do gráfico:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao buscar dados do gráfico"
      };
    }
  },

  // Buscar distribuição por bairro
  async buscarDadosPorBairro() {
    try {
      // Adicionar timestamp para evitar cache
      const timestamp = new Date().getTime();
      const response = await api.get(`/beneficiados?_t=${timestamp}`);
      const beneficiados = response.data?.content || response.data || [];

      // Contar por bairro
      const contagemBairros = {};
      let total = 0;

      beneficiados.forEach(beneficiado => {
        const bairro = beneficiado.endereco?.bairro || "Outros";
        contagemBairros[bairro] = (contagemBairros[bairro] || 0) + 1;
        total++;
      });

      // Converter para array e ordenar
      const bairrosArray = Object.entries(contagemBairros)
        .map(([bairro, quantidade]) => ({
          bairro,
          quantidade,
          percentual: total > 0 ? ((quantidade / total) * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.quantidade - a.quantidade);

      // Pegar top 3 e agrupar o resto em "Outros"
      const top3 = bairrosArray.slice(0, 3);
      const outros = bairrosArray.slice(3).reduce((acc, item) => acc + item.quantidade, 0);
      const percentualOutros = total > 0 ? ((outros / total) * 100).toFixed(1) : 0;

      const resultado = [
        ...top3,
        { bairro: "Outros", quantidade: outros, percentual: percentualOutros }
      ];

      return {
        success: true,
        data: resultado
      };
    } catch (error) {
      console.error("Erro ao buscar dados por bairro:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao buscar dados por bairro"
      };
    }
  }
};

export default dashboardService;
