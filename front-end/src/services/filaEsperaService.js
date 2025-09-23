import apiClient from '../provider/api.js';

// Serviços para Fila de Espera
export const filaEsperaService = {
  // Adicionar à fila de espera
  adicionarFila: async (dadosFila) => {
    try {
      const payload = {
        beneficiadoId: dadosFila.beneficiadoId,
        prioridade: dadosFila.prioridade || 'MEDIA',
        observacoes: dadosFila.observacoes || ''
      };

      console.log('Payload para adicionar à fila:', payload);
      const response = await apiClient.post('/fila-espera', payload);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao adicionar à fila:', error);
      
      let mensagem = 'Erro interno do servidor';
      
      if (error.response?.status === 400) {
        mensagem = 'Dados inválidos. Verifique os campos preenchidos.';
      } else if (error.response?.status === 404) {
        mensagem = 'Beneficiado não encontrado.';
      } else if (error.response?.status === 409) {
        mensagem = 'Beneficiado já está na fila de espera.';
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      } else if (error.message === 'Network Error') {
        mensagem = 'Erro de conexão. Verifique sua internet.';
      }
      
      return { success: false, error: mensagem };
    }
  },

  // Listar fila de espera
  listarFila: async () => {
    try {
      const response = await apiClient.get('/fila-espera');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao listar fila de espera:', error);
      return { success: false, error: 'Erro ao carregar fila de espera' };
    }
  },

  // Buscar item da fila por ID
  buscarPorId: async (id) => {
    try {
      const response = await apiClient.get(`/fila-espera/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar item da fila:', error);
      return { success: false, error: 'Erro ao carregar dados do item' };
    }
  },

  // Atualizar item da fila
  atualizar: async (id, dadosFila) => {
    try {
      const payload = {
        beneficiadoId: dadosFila.beneficiadoId,
        prioridade: dadosFila.prioridade,
        observacoes: dadosFila.observacoes
      };

      const response = await apiClient.patch(`/fila-espera/${id}`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao atualizar item da fila:', error);
      
      let mensagem = 'Erro ao atualizar item';
      
      if (error.response?.status === 400) {
        mensagem = 'Dados inválidos. Verifique os campos preenchidos.';
      } else if (error.response?.status === 404) {
        mensagem = 'Item não encontrado na fila.';
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      }
      
      return { success: false, error: mensagem };
    }
  },

  // Remover da fila de espera
  remover: async (id) => {
    try {
      await apiClient.delete(`/fila-espera/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover da fila:', error);
      
      let mensagem = 'Erro ao remover da fila';
      
      if (error.response?.status === 404) {
        mensagem = 'Item não encontrado na fila.';
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      }
      
      return { success: false, error: mensagem };
    }
  }
};