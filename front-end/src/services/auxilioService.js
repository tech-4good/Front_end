import apiClient from '../provider/api.js';

// Serviços para Auxílios Governamentais (conforme documentação backend)
export const auxilioService = {
  // Listar todos os auxílios
  listarTodos: async () => {
    try {
      const response = await apiClient.get('/auxilio-governamentais');
      
      // Se retornar 204 No Content, não há auxílios
      if (response.status === 204) {
        return { success: true, data: [] };
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao listar auxílios:', error);
      
      let mensagem = 'Erro interno do servidor';
      
      if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      } else if (error.response?.status === 400) {
        mensagem = 'Erro na solicitação';
      } else if (error.message === 'Network Error') {
        mensagem = 'Erro de conexão. Verifique sua internet.';
      }
      
      return { success: false, error: mensagem };
    }
  },

  // Buscar auxílio por tipo/nome
  buscarPorNome: async (tipo) => {
    try {
      const response = await apiClient.get('/auxilio-governamentais');
      
      if (response.status === 204) {
        return { success: true, data: [] };
      }
      
      // Filtrar no frontend pelo tipo
      const auxiliosFiltrados = response.data.filter(
        auxilio => auxilio.tipo.toLowerCase().includes(tipo.toLowerCase())
      );
      
      return { success: true, data: auxiliosFiltrados };
    } catch (error) {
      console.error('Erro ao buscar auxílio:', error);
      return { success: false, error: 'Erro ao buscar auxílio' };
    }
  },

  // Cadastrar novo auxílio
  cadastrar: async (dadosAuxilio) => {
    try {
      const response = await apiClient.post('/auxilio-governamentais', {
        tipo: dadosAuxilio.nome // Converter nome para tipo conforme API
      });
      
      // Retornar com campo 'id' padronizado
      return { 
        success: true, 
        data: {
          id: response.data.idAuxilio,
          idAuxilio: response.data.idAuxilio,
          tipo: response.data.tipo,
          nome: response.data.tipo // Manter compatibilidade
        }
      };
    } catch (error) {
      console.error('Erro ao cadastrar auxílio:', error);
      
      let mensagem = 'Erro interno do servidor';
      
      if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      } else if (error.response?.status === 400) {
        mensagem = 'Dados inválidos. Verifique as informações.';
      } else if (error.response?.status === 409) {
        mensagem = 'Este auxílio já está cadastrado.';
      } else if (error.message === 'Network Error') {
        mensagem = 'Erro de conexão. Verifique sua internet.';
      }
      
      return { success: false, error: mensagem };
    }
  },

  // Associar auxílio a um beneficiário
  associarBeneficiario: async (beneficiadoId, auxilioId) => {
    try {
      const response = await apiClient.post('/beneficiado-has-auxilios', {
        beneficiadoId,
        auxilioGovernamentalId: auxilioId // Campo correto conforme API
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao associar auxílio ao beneficiário:', error);
      
      let mensagem = 'Erro interno do servidor';
      
      if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      } else if (error.response?.status === 400) {
        mensagem = 'Dados inválidos. Verifique as informações.';
      } else if (error.response?.status === 409) {
        mensagem = 'Este auxílio já está associado ao beneficiário.';
      } else if (error.message === 'Network Error') {
        mensagem = 'Erro de conexão. Verifique sua internet.';
      }
      
      return { success: false, error: mensagem };
    }
  },

  // Buscar auxílios de um beneficiário
  buscarPorBeneficiario: async (beneficiadoId) => {
    try {
      const response = await apiClient.get('/beneficiado-has-auxilios');
      
      // Filtrar no frontend por beneficiadoId
      const associacoesFiltradas = response.data.filter(
        assoc => assoc.beneficiado.id === beneficiadoId
      );
      
      return { success: true, data: associacoesFiltradas };
    } catch (error) {
      console.error('Erro ao buscar auxílios do beneficiário:', error);
      return { success: false, error: 'Erro ao buscar auxílios do beneficiário' };
    }
  },

  // Buscar auxílio por ID
  buscarPorId: async (id) => {
    try {
      const response = await apiClient.get(`/auxilio-governamentais/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar auxílio por ID:', error);
      return { success: false, error: 'Erro ao buscar auxílio' };
    }
  },

  // Atualizar auxílio
  atualizar: async (id, dadosAuxilio) => {
    try {
      const response = await apiClient.patch(`/auxilio-governamentais/${id}`, {
        tipo: dadosAuxilio.nome || dadosAuxilio.tipo
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao atualizar auxílio:', error);
      return { success: false, error: 'Erro ao atualizar auxílio' };
    }
  },

  // Deletar auxílio
  deletar: async (id) => {
    try {
      await apiClient.delete(`/auxilio-governamentais/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar auxílio:', error);
      return { success: false, error: 'Erro ao deletar auxílio' };
    }
  },

  // Remover associação beneficiário-auxílio
  removerAssociacao: async (associacaoId) => {
    try {
      await apiClient.delete(`/beneficiado-has-auxilios/${associacaoId}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover associação:', error);
      return { success: false, error: 'Erro ao remover associação' };
    }
  }
};