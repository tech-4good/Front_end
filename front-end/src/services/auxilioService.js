import apiClient from '../provider/api.js';

// Serviços para Auxílios
export const auxilioService = {
  // Listar todos os auxílios
  listarTodos: async () => {
    try {
      const response = await apiClient.get('/auxilios');
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

  // Buscar auxílio por nome
  buscarPorNome: async (nome) => {
    try {
      const response = await apiClient.get('/auxilios', {
        params: { nome }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar auxílio:', error);
      return { success: false, error: 'Erro ao buscar auxílio' };
    }
  },

  // Cadastrar novo auxílio
  cadastrar: async (dadosAuxilio) => {
    try {
      const response = await apiClient.post('/auxilios', {
        nome: dadosAuxilio.nome,
        descricao: dadosAuxilio.descricao || null,
        ativo: dadosAuxilio.ativo !== undefined ? dadosAuxilio.ativo : true
      });
      return { success: true, data: response.data };
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
      const response = await apiClient.post('/beneficiados-auxilios', {
        beneficiadoId,
        auxilioId,
        dataAssociacao: new Date().toISOString()
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
      const response = await apiClient.get(`/beneficiados-auxilios/beneficiado/${beneficiadoId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar auxílios do beneficiário:', error);
      return { success: false, error: 'Erro ao buscar auxílios do beneficiário' };
    }
  }
};