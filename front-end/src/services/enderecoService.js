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

export const enderecoService = {
  buscarCep,
  buscarCepComCache,
  buscarEnderecoPorCep,
  cadastrarEndereco,
  validarCep,
  formatarCep
};

export default enderecoService;
