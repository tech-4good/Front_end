import api from "../provider/api";

const entregaService = {
  // Listar todas as entregas (busca todas as páginas)
  async listarEntregas() {
    try {
      const response = await api.get("/entregas");
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Erro ao listar entregas:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao listar entregas"
      };
    }
  },

  // Listar entregas com paginação específica
  async listarEntregasPaginadas(page = 0, size = 5) {
    try {
      const response = await api.get("/entregas", {
        params: { page, size }
      });
      return {
        success: true,
        data: response.data // { content: [], totalPages, totalElements, currentPage, size }
      };
    } catch (error) {
      console.error("Erro ao listar entregas paginadas:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao listar entregas"
      };
    }
  },

  // Buscar TODAS as entregas (todas as páginas) para histórico completo
  async buscarTodasEntregas() {
    try {
      // Primeiro, buscar a primeira página para saber quantas páginas existem
      const primeiraPagina = await api.get("/entregas", {
        params: { page: 0, size: 100 } // Buscar 100 por vez
      });
      
      const dados = primeiraPagina.data;
      let todasEntregas = dados.content || [];
      const totalPaginas = dados.totalPages || 1;
      
      console.log(`📄 Primeira página carregada: ${todasEntregas.length} entregas`);
      console.log(`📊 Total de páginas: ${totalPaginas}`);
      
      // Se houver mais páginas, buscar todas
      if (totalPaginas > 1) {
        const promessas = [];
        for (let page = 1; page < totalPaginas; page++) {
          promessas.push(
            api.get("/entregas", {
              params: { page, size: 100 }
            })
          );
        }
        
        const respostas = await Promise.all(promessas);
        respostas.forEach(resp => {
          todasEntregas = [...todasEntregas, ...(resp.data.content || [])];
        });
      }
      
      console.log(`✅ Total de entregas carregadas: ${todasEntregas.length}`);
      
      return {
        success: true,
        data: todasEntregas
      };
    } catch (error) {
      console.error("Erro ao buscar todas as entregas:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao buscar entregas"
      };
    }
  },

  // Buscar entrega por ID
  async buscarPorId(id) {
    try {
      const response = await api.get(`/entregas/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Erro ao buscar entrega:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao buscar entrega"
      };
    }
  },

  // Buscar histórico de entregas de um beneficiado
  async buscarHistorico(beneficiadoId) {
    try {
      const response = await api.get(`/entregas/historico/${beneficiadoId}`);
      return response.data || [];
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      return [];
    }
  },

  // Verificar elegibilidade (novo endpoint da documentação)
  async verificarElegibilidade(beneficiadoId) {
    try {
      const response = await api.get(`/entregas/historico/${beneficiadoId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Erro ao verificar elegibilidade:", error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.response?.data?.message || "Erro ao verificar elegibilidade"
      };
    }
  },

  // Registrar nova entrega
  async registrarEntrega(dadosEntrega) {
    try {
      const response = await api.post("/entregas", dadosEntrega);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Erro ao registrar entrega:", error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.response?.data?.message || "Erro ao registrar entrega"
      };
    }
  },

  // Atualizar entrega
  async atualizarEntrega(id, dadosEntrega) {
    try {
      const response = await api.put(`/entregas/${id}`, dadosEntrega);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Erro ao atualizar entrega:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao atualizar entrega"
      };
    }
  },

  // Deletar entrega
  async deletarEntrega(id) {
    try {
      await api.delete(`/entregas/${id}`);
      return {
        success: true
      };
    } catch (error) {
      console.error("Erro ao deletar entrega:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao deletar entrega"
      };
    }
  },

  // Validar elegibilidade para retirada (função auxiliar)
  validarElegibilidade(endereco, historico) {
    const hoje = new Date();
    
    // Verificar se endereço está ativo
    if (endereco.status !== "ABERTO") {
      return { 
        podeRetirar: false, 
        motivo: "ENDERECO_INATIVO" 
      };
    }

    // Verificar data de saída
    if (endereco.dataSaida && new Date(endereco.dataSaida) < hoje) {
      return { 
        podeRetirar: false, 
        motivo: "DATA_SAIDA_VENCIDA" 
      };
    }

    // Verificar histórico de entregas
    if (historico && historico.length > 0) {
      const ultimaEntrega = historico[0]; // Assumindo que vem ordenado por data
      const proximaPermitida = new Date(ultimaEntrega.proximaRetirada);

      if (hoje < proximaPermitida) {
        if (endereco.tipoCesta === "BASICA") {
          return { 
            podeRetirar: false, 
            motivo: "JA_RETIROU_MES", 
            ultimaRetirada: ultimaEntrega.dataRetirada,
            tiposPermitidos: [] 
          };
        } else {
          return { 
            podeRetirar: false, 
            motivo: "PRAZO_KIT", 
            proximaRetirada: ultimaEntrega.proximaRetirada,
            tiposPermitidos: [] 
          };
        }
      }
    }

    // Se chegou aqui, pode retirar
    return { 
      podeRetirar: true, 
      tiposPermitidos: [endereco.tipoCesta] 
    };
  }
};

export { entregaService };