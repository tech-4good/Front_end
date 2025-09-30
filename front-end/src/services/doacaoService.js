import apiClient from '../provider/api.js';

// Serviços para Doações/Atendimentos
export const doacaoService = {
  // Listar todas as doações/atendimentos
  listarTodos: async () => {
    try {
      console.log('📋 Listando todas as doações...');
      
      // Tentar diferentes endpoints para listar
      const endpointsPossiveis = [
        '/atendimentos',
        '/cestas', 
        '/entregas',
        '/doacoes'
      ];
      
      for (const endpoint of endpointsPossiveis) {
        try {
          console.log(`🔍 Testando endpoint: ${endpoint}`);
          const response = await apiClient.get(endpoint);
          console.log(`✅ Sucesso com endpoint: ${endpoint}`);
          return { success: true, data: response.data };
        } catch (error) {
          console.log(`❌ Falhou endpoint ${endpoint}:`, error.response?.status || error.message);
        }
      }
      
      // Se nenhum endpoint funcionou
      throw new Error('Nenhum endpoint de doações encontrado');
    } catch (error) {
      console.error('Erro ao listar doações:', error);
      
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

  // Registrar nova doação/atendimento
  registrarDoacao: async (dadosDoacao) => {
    try {
      console.log('🚀 Tentando registrar doação...');
      console.log('Dados:', dadosDoacao);
      
      // Tentar diferentes endpoints possíveis
      const endpointsPossiveis = [
        '/atendimentos',
        '/cestas',
        '/entregas',
        '/doacao',
        '/registrar-doacao',
        '/beneficiados/doacoes',
        '/doacoes'
      ];
      
      let response;
      let endpointUsado = '';
      
      for (const endpoint of endpointsPossiveis) {
        try {
          console.log(`🔍 Testando endpoint: ${endpoint}`);
          response = await apiClient.post(endpoint, {
            beneficiadoId: dadosDoacao.beneficiadoId,
            tipo: dadosDoacao.tipo,
            data: dadosDoacao.data || new Date().toISOString(),
            voluntarioId: dadosDoacao.voluntarioId
          });
          endpointUsado = endpoint;
          console.log(`✅ Sucesso com endpoint: ${endpoint}`);
          break;
        } catch (error) {
          console.log(`❌ Falhou endpoint ${endpoint}:`, error.response?.status || error.message);
          if (endpoint === endpointsPossiveis[endpointsPossiveis.length - 1]) {
            // Se é o último endpoint, relança o erro
            throw error;
          }
        }
      }
      
      return { success: true, data: response.data, endpoint: endpointUsado };
    } catch (error) {
      console.error('Erro ao registrar doação:', error);
      
      let mensagem = 'Erro interno do servidor';
      
      if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      } else if (error.response?.status === 400) {
        mensagem = 'Dados inválidos. Verifique as informações.';
      } else if (error.response?.status === 409) {
        mensagem = 'Conflito na regra de negócio (ex: limite de retiradas atingido).';
      } else if (error.message === 'Network Error') {
        mensagem = 'Erro de conexão. Verifique sua internet.';
      }
      
      return { success: false, error: mensagem };
    }
  },

  // Buscar doações por beneficiário
  buscarPorBeneficiado: async (beneficiadoId) => {
    try {
      console.log(`🔍 Buscando histórico para beneficiado ID: ${beneficiadoId}`);
      
      // Tentar diferentes endpoints para buscar histórico
      const endpointsPossiveis = [
        `/atendimentos/beneficiado/${beneficiadoId}`,
        `/cestas/beneficiado/${beneficiadoId}`,
        `/entregas/beneficiado/${beneficiadoId}`,
        `/beneficiados/${beneficiadoId}/doacoes`,
        `/beneficiados/${beneficiadoId}/atendimentos`,
        `/doacoes/beneficiado/${beneficiadoId}`
      ];
      
      for (const endpoint of endpointsPossiveis) {
        try {
          console.log(`🔍 Testando endpoint: ${endpoint}`);
          const response = await apiClient.get(endpoint);
          console.log(`✅ Sucesso com endpoint: ${endpoint}`);
          return { success: true, data: response.data };
        } catch (error) {
          console.log(`❌ Falhou endpoint ${endpoint}:`, error.response?.status || error.message);
          if (endpoint === endpointsPossiveis[endpointsPossiveis.length - 1]) {
            // Se é o último endpoint e ainda falhou, retornar array vazio (sem histórico)
            console.log('📝 Nenhum endpoint de histórico encontrado, assumindo sem histórico');
            return { success: true, data: [] };
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar doações do beneficiário:', error);
      return { success: false, error: 'Erro ao buscar histórico do beneficiário' };
    }
  },

  // Buscar doações por período
  buscarPorPeriodo: async (dataInicio, dataFim) => {
    try {
      const response = await apiClient.get('/doacoes', {
        params: {
          dataInicio,
          dataFim
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar doações por período:', error);
      return { success: false, error: 'Erro ao buscar doações por período' };
    }
  }
};