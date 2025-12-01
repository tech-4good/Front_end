import apiClient from '../provider/api';

/**
 * Serviço para gerenciar Tipo de Morador
 * Endpoint: /tipo-moradores
 * 
 * Tipo Morador contém APENAS as quantidades de pessoas:
 * - quantidadeCrianca
 * - quantidadeJovem
 * - quantidadeAdolescente
 * - quantidadeIdoso
 * - quantidadeGestante
 * - quantidadeDeficiente
 * - quantidadeOutros
 */

const tipoMoradorService = {
  /**
   * Lista todos os tipos de morador
   * GET /tipo-moradores
   */
  listar: async () => {
    try {
      const response = await apiClient.get('/tipo-moradores');
      
      if (response.status === 204) {
        return { success: true, data: [] };
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Erro ao listar tipos de morador:', error);
      return { 
        success: false, 
        error: 'Erro ao buscar tipos de morador',
        data: [] 
      };
    }
  },

  /**
   * Busca tipo de morador por ID
   * GET /tipo-moradores/{id}
   */
  buscarPorId: async (id) => {
    try {
      console.log('🔍 Buscando tipo de morador ID:', id);
      
      const response = await apiClient.get(`/tipo-moradores/${id}`);
      
      console.log('✅ Tipo de morador encontrado:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Erro ao buscar tipo de morador:', error);
      
      if (error.response?.status === 404) {
        return { success: false, error: 'Tipo de morador não encontrado' };
      }
      
      return { 
        success: false, 
        error: 'Erro ao buscar tipo de morador' 
      };
    }
  },

  /**
   * Busca tipo de morador por beneficiado ID
   * Lista todos e filtra pelo beneficiado
   */
  buscarPorBeneficiado: async (beneficiadoId) => {
    try {
      console.log('🔍 Buscando tipo de morador para beneficiado:', beneficiadoId);
      
      const response = await apiClient.get('/tipo-moradores');
      
      if (response.status === 204 || !response.data) {
        return { success: false, error: 'Nenhum tipo de morador encontrado' };
      }
      
      const tipoMorador = response.data.find(tm => 
        tm.beneficiado?.id === beneficiadoId
      );
      
      if (!tipoMorador) {
        return { success: false, error: 'Tipo de morador não encontrado para este beneficiado' };
      }
      
      console.log('✅ Tipo de morador encontrado:', tipoMorador);
      return { success: true, data: tipoMorador };
    } catch (error) {
      console.error('❌ Erro ao buscar tipo de morador por beneficiado:', error);
      return { 
        success: false, 
        error: 'Erro ao buscar tipo de morador' 
      };
    }
  },

  /**
   * Atualiza tipo de morador (APENAS quantidades)
   * PATCH /tipo-moradores/{id}
   * 
   * @param {number} id - ID do tipo de morador
   * @param {Object} dados - Dados para atualizar
   * @param {number} [dados.quantidadeCrianca]
   * @param {number} [dados.quantidadeJovem]
   * @param {number} [dados.quantidadeAdolescente]
   * @param {number} [dados.quantidadeIdoso]
   * @param {number} [dados.quantidadeGestante]
   * @param {number} [dados.quantidadeDeficiente]
   * @param {number} [dados.quantidadeOutros]
   */
  atualizar: async (id, dados) => {
    try {
      console.log('📝 Atualizando tipo de morador ID:', id);
      console.log('📤 Dados a atualizar:', dados);
      
      // Monta payload apenas com campos definidos (PATCH parcial)
      const payload = {};
      
      if (dados.quantidadeCrianca !== undefined) {
        payload.quantidadeCrianca = parseInt(dados.quantidadeCrianca) || 0;
      }
      if (dados.quantidadeJovem !== undefined) {
        payload.quantidadeJovem = parseInt(dados.quantidadeJovem) || 0;
      }
      if (dados.quantidadeAdolescente !== undefined) {
        payload.quantidadeAdolescente = parseInt(dados.quantidadeAdolescente) || 0;
      }
      if (dados.quantidadeIdoso !== undefined) {
        payload.quantidadeIdoso = parseInt(dados.quantidadeIdoso) || 0;
      }
      if (dados.quantidadeGestante !== undefined) {
        payload.quantidadeGestante = parseInt(dados.quantidadeGestante) || 0;
      }
      if (dados.quantidadeDeficiente !== undefined) {
        payload.quantidadeDeficiente = parseInt(dados.quantidadeDeficiente) || 0;
      }
      if (dados.quantidadeOutros !== undefined) {
        payload.quantidadeOutros = parseInt(dados.quantidadeOutros) || 0;
      }
      
      console.log('📦 Payload final (PATCH):', payload);
      
      const response = await apiClient.patch(`/tipo-moradores/${id}`, payload);
      
      console.log('✅ Tipo de morador atualizado:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Erro ao atualizar tipo de morador:', error);
      
      let mensagem = 'Erro ao atualizar tipo de morador';
      
      if (error.response?.status === 404) {
        mensagem = 'Tipo de morador não encontrado';
      } else if (error.response?.status === 400) {
        mensagem = 'Dados inválidos para atualização';
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      }
      
      return { success: false, error: mensagem };
    }
  }
};

export default tipoMoradorService;
