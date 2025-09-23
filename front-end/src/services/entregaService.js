import api from "../provider/api";

const entregaService = {
  // Listar todas as entregas
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
      throw new Error(error.response?.data?.message || "Erro ao registrar entrega");
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