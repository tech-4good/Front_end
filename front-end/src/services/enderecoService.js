import api from '../provider/api';

/**
 * 🌐 Serviço de Endereço - Integração com ViaCep
 * 
 * Funções para buscar endereços via CEP usando a integração do backend com ViaCep
 */

/**
 * Busca dados de endereço a partir do CEP
 * @param {string} cep - CEP com 8 dígitos (com ou sem hífen)
 * @returns {Promise<Object>} Dados do endereço
 * @throws {Error} Erro ao buscar CEP (400, 404, 500)
 */
export const buscarCep = async (cep) => {
  try {
    // Remove caracteres não numéricos (exceto hífen)
    const cepLimpo = cep.replace(/[^\d-]/g, '');

    // Valida formato básico
    if (!/^\d{5}-?\d{3}$/.test(cepLimpo)) {
      throw new Error('CEP inválido. Use o formato: 12345-678 ou 12345678');
    }

    console.log('🌐 Buscando CEP no backend:', cepLimpo);

    // Faz requisição para o backend (que consulta ViaCep)
    const response = await api.get(`/enderecos/cep/${cepLimpo}`);

    console.log('✅ CEP encontrado:', response.data);

    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    console.error('❌ Erro na busca de CEP:', error);

    // Trata erros específicos
    if (error.response) {
      const status = error.response.status;
      const mensagem = error.response.data?.message || error.message;

      switch (status) {
        case 400:
          throw new Error('CEP inválido. Verifique o formato (00000-000).');
        case 404:
          throw new Error('CEP não encontrado. Verifique se digitou corretamente.');
        case 401:
          throw new Error('Sessão expirada. Faça login novamente.');
        case 500:
          throw new Error('Erro ao consultar CEP. Tente novamente em instantes.');
        default:
          throw new Error(mensagem || 'Erro ao buscar CEP.');
      }
    }

    // Erro de rede ou timeout
    if (error.code === 'ECONNABORTED') {
      throw new Error('Tempo de espera esgotado. Verifique sua conexão.');
    }

    throw new Error(error.message || 'Erro ao buscar CEP.');
  }
};

/**
 * Valida formato do CEP antes de enviar para o backend
 * @param {string} cep - CEP a validar
 * @returns {Object} {valido: boolean, erro: string|null}
 */
export const validarCep = (cep) => {
  const cepLimpo = cep.replace(/\D/g, '');

  // Verifica se tem 8 dígitos
  if (cepLimpo.length !== 8) {
    return { valido: false, erro: 'CEP deve ter 8 dígitos' };
  }

  // Verifica se não é sequência repetida (ex: 00000000, 11111111)
  if (/^(\d)\1{7}$/.test(cepLimpo)) {
    return { valido: false, erro: 'CEP inválido' };
  }

  return { valido: true, erro: null };
};

/**
 * Formata CEP automaticamente (adiciona hífen)
 * @param {string} valor - Valor do CEP
 * @returns {string} CEP formatado (00000-000)
 */
export const formatarCep = (valor) => {
  // Remove tudo que não é dígito
  let numeros = valor.replace(/\D/g, '');

  // Limita a 8 dígitos
  numeros = numeros.slice(0, 8);

  // Adiciona hífen após o 5º dígito
  if (numeros.length > 5) {
    return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
  }

  return numeros;
};

/**
 * Cache de CEPs consultados (evita requisições duplicadas)
 */
const cepCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hora

/**
 * Busca CEP com cache
 * @param {string} cep - CEP a buscar
 * @returns {Promise<Object>} Dados do endereço
 */
export const buscarCepComCache = async (cep) => {
  const cepLimpo = cep.replace(/\D/g, '');

  // Verifica cache
  const cached = cepCache.get(cepLimpo);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('✅ Usando cache para CEP:', cepLimpo);
    return { success: true, data: cached.data, fromCache: true };
  }

  // Busca no backend
  const resultado = await buscarCep(cep);

  // Salva no cache
  if (resultado.success) {
    cepCache.set(cepLimpo, {
      data: resultado.data,
      timestamp: Date.now()
    });
  }

  return resultado;
};

/**
 * Busca endereço por CEP com nova nomenclatura
 * @param {string} cep - CEP com 8 dígitos
 * @returns {Promise<Object>} Dados do endereço
 */
export const buscarEnderecoPorCep = buscarCep;

/**
 * Cadastra um novo endereço no backend
 * @param {Object} endereco - Dados do endereço
 * @returns {Promise<Object>} Resultado da operação
 */
export const cadastrarEndereco = async (endereco) => {
  try {
    console.log('📍 Cadastrando endereço:', endereco);

    const response = await api.post('/enderecos', endereco);

    console.log('✅ Endereço cadastrado:', response.data);

    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    console.error('❌ Erro ao cadastrar endereço:', error);

    if (error.response) {
      const status = error.response.status;
      const mensagem = error.response.data?.message || error.message;

      switch (status) {
        case 400:
          throw new Error('Dados do endereço inválidos. Verifique as informações.');
        case 401:
          throw new Error('Sessão expirada. Faça login novamente.');
        case 409:
          throw new Error('Endereço já cadastrado.');
        case 500:
          throw new Error('Erro no servidor. Tente novamente.');
        default:
          throw new Error(mensagem || 'Erro ao cadastrar endereço.');
      }
    }

    return {
      success: false,
      error: error.message || 'Erro ao cadastrar endereço.'
    };
  }
};

/**
 * Lista todos os endereços cadastrados
 * @returns {Promise<Object>} Lista de endereços
 */
export const listarEnderecos = async () => {
  try {
    console.log('📋 Listando endereços...');

    const response = await api.get('/enderecos');

    console.log('✅ Endereços carregados:', response.data);

    return {
      success: true,
      data: response.data || []
    };

  } catch (error) {
    console.error('❌ Erro ao listar endereços:', error);

    // 204 No Content significa que não há endereços
    if (error.response?.status === 204) {
      return {
        success: true,
        data: []
      };
    }

    if (error.response) {
      const status = error.response.status;
      const mensagem = error.response.data?.message || error.message;

      switch (status) {
        case 401:
          throw new Error('Sessão expirada. Faça login novamente.');
        case 500:
          throw new Error('Erro no servidor. Tente novamente.');
        default:
          throw new Error(mensagem || 'Erro ao listar endereços.');
      }
    }

    return {
      success: false,
      error: error.message || 'Erro ao listar endereços.'
    };
  }
};

/**
 * Busca endereço por ID
 * @param {number} id - ID do endereço
 * @returns {Promise<Object>} Dados do endereço
 */
export const buscarEnderecoPorId = async (id) => {
  try {
    console.log('🔍 Buscando endereço ID:', id);

    const response = await api.get(`/enderecos/${id}`);

    console.log('✅ Endereço encontrado:', response.data);

    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    console.error('❌ Erro ao buscar endereço:', error);

    if (error.response) {
      const status = error.response.status;
      const mensagem = error.response.data?.message || error.message;

      switch (status) {
        case 404:
          throw new Error('Endereço não encontrado.');
        case 401:
          throw new Error('Sessão expirada. Faça login novamente.');
        default:
          throw new Error(mensagem || 'Erro ao buscar endereço.');
      }
    }

    return {
      success: false,
      error: error.message || 'Erro ao buscar endereço.'
    };
  }
};

/**
 * Atualiza dados físicos do endereço (número, logradouro, CEP, etc.)
 * Usa PUT - atualização parcial (apenas campos enviados são atualizados)
 * Conforme documentação backend: PUT /enderecos/{id}
 * @param {number} id - ID do endereço
 * @param {Object} dadosAtualizados - Campos a atualizar
 * @returns {Promise<Object>} Endereço atualizado
 */
export const atualizarEndereco = async (id, dadosAtualizados) => {
  try {
    console.log('✏️ Atualizando dados do endereço ID:', id, 'com dados:', dadosAtualizados);

    // PUT para dados físicos (conforme documentação backend)
    const response = await api.put(`/enderecos/${id}`, dadosAtualizados);

    console.log('✅ Endereço atualizado:', response.data);

    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    console.error('❌ Erro ao atualizar endereço:', error);

    if (error.response) {
      const status = error.response.status;
      const mensagem = error.response.data?.message || error.message;

      switch (status) {
        case 400:
          throw new Error('Dados inválidos. Verifique as informações.');
        case 404:
          throw new Error('Endereço não encontrado.');
        case 401:
          throw new Error('Sessão expirada. Faça login novamente.');
        default:
          throw new Error(mensagem || 'Erro ao atualizar endereço.');
      }
    }

    return {
      success: false,
      error: error.message || 'Erro ao atualizar endereço.'
    };
  }
};

/**
 * Atualiza apenas o STATUS do endereço (ATIVO, INATIVO, FILA_ESPERA)
 * Usa PATCH - apenas para mudança de status
 * Conforme documentação backend: PATCH /enderecos/{id}
 * @param {number} id - ID do endereço
 * @param {string} status - Novo status: 'ATIVO', 'INATIVO' ou 'FILA_ESPERA'
 * @returns {Promise<Object>} Endereço com status atualizado
 */
export const atualizarStatusEndereco = async (id, status) => {
  try {
    console.log('🔄 Atualizando status do endereço ID:', id, 'para:', status);

    // PATCH para status (conforme documentação backend)
    const response = await api.patch(`/enderecos/${id}`, { status });

    console.log('✅ Status atualizado:', response.data);

    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);

    if (error.response) {
      const status = error.response.status;
      const mensagem = error.response.data?.message || error.message;

      switch (status) {
        case 400:
          throw new Error('Status inválido. Use: ATIVO, INATIVO ou FILA_ESPERA.');
        case 404:
          throw new Error('Endereço não encontrado.');
        case 401:
          throw new Error('Sessão expirada. Faça login novamente.');
        default:
          throw new Error(mensagem || 'Erro ao atualizar status.');
      }
    }

    return {
      success: false,
      error: error.message || 'Erro ao atualizar status.'
    };
  }
};

/**
 * Deleta um endereço
 * @param {number} id - ID do endereço
 * @returns {Promise<Object>} Resultado da operação
 */
export const deletarEndereco = async (id) => {
  try {
    console.log('🗑️ Deletando endereço ID:', id);

    const response = await api.delete(`/enderecos/${id}`);

    // 204 No Content - sucesso (conforme documentação backend)
    console.log('✅ Endereço deletado com sucesso');

    return {
      success: true
    };

  } catch (error) {
    console.error('❌ Erro ao deletar endereço:', error);

    if (error.response) {
      const status = error.response.status;
      const mensagem = error.response.data?.message || error.response.data?.error || error.message || '';

      // PRIMEIRO: Detectar mensagens de constraint (pode vir como 500 ou 409)
      if (mensagem && (
        mensagem.includes('foreign key') ||
        mensagem.includes('Foreign key') ||
        mensagem.includes('constraint fails') ||
        mensagem.includes('Cannot delete or update a parent row') ||
        mensagem.includes('DataIntegrityViolationException')
      )) {
        throw new Error('foreign key constraint: Não é possível deletar. Existem registros vinculados a este endereço.');
      }

      // DEPOIS: Tratamento específico por status code
      switch (status) {
        case 401:
          throw new Error('Unauthorized: Sessão expirada. Faça login novamente.');
        
        case 404:
          throw new Error('Not Found: Endereço não encontrado.');
        
        case 409:
          // Conflict - FK constraint (caso venha com código correto)
          throw new Error('foreign key constraint: Não é possível deletar. Existem registros vinculados a este endereço.');
        
        case 500:
          // Erro 500 genérico (não FK)
          throw new Error('Server Error: Erro no servidor. Tente novamente.');
        
        default:
          throw new Error(mensagem || 'Erro ao deletar endereço.');
      }
    }

    return {
      success: false,
      error: error.message || 'Erro ao deletar endereço.'
    };
  }
};

export const enderecoService = {
  buscarCep,
  buscarCepComCache,
  buscarEnderecoPorCep,
  cadastrarEndereco,
  listarEnderecos,
  buscarEnderecoPorId,
  atualizarEndereco,
  atualizarStatusEndereco, // Novo método para atualizar apenas status
  deletarEndereco,
  validarCep,
  formatarCep
};

export default enderecoService;
