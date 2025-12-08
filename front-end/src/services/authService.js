import apiClient from '../provider/api';

/**
 * 🔐 Serviço de Autenticação - Recuperação de Senha
 * 
 * Funções para gerenciar o fluxo completo de recuperação de senha:
 * 1. Solicitar recuperação (enviar e-mail)
 * 2. Validar token de recuperação
 * 3. Redefinir senha com token
 */

/**
 * Solicita recuperação de senha enviando e-mail para o usuário
 * @param {string} email - E-mail do voluntário
 * @returns {Promise<Object>} Resultado da operação
 */
export const solicitarRecuperacaoSenha = async (email) => {
  try {
    console.log('🔐 Solicitando recuperação de senha para:', email);
    
    if (!email || !email.trim()) {
      throw new Error('E-mail é obrigatório');
    }

    // Valida formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('E-mail inválido');
    }
    
    console.log('📤 Enviando requisição POST para /voluntarios/solicitar-redefinicao-senha');
    const response = await apiClient.post('/voluntarios/solicitar-redefinicao-senha', { email });
    console.log('📥 Resposta recebida:', response);
    
    console.log('✅ E-mail de recuperação enviado com sucesso');
    
    return {
      sucesso: true,
      mensagem: 'E-mail de recuperação enviado com sucesso'
    };
    
  } catch (error) {
    console.error('❌ Erro ao solicitar recuperação de senha:', error);
    
    // Trata erros específicos
    if (error.response) {
      const status = error.response.status;
      const mensagem = error.response.data?.message || error.message;
      
      switch (status) {
        case 401:
          throw new Error('Endpoint de recuperação de senha está protegido. Entre em contato com o suporte.');
        case 404:
          throw new Error('E-mail não cadastrado no sistema.');
        case 400:
          throw new Error('E-mail inválido.');
        case 429:
          throw new Error('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
        case 500:
          throw new Error('Erro ao enviar e-mail. Tente novamente mais tarde.');
        default:
          throw new Error(mensagem || 'Erro ao solicitar recuperação de senha');
      }
    }
    
    // Erro de rede ou timeout
    if (error.code === 'ECONNABORTED') {
      throw new Error('Tempo de espera esgotado. Verifique sua conexão.');
    }
    
    // Erro de rede (backend não está rodando)
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    }
    
    // Outros erros
    throw new Error(error.message || 'Erro inesperado ao solicitar recuperação de senha');
  }
};

/**
 * Valida o token de recuperação de senha (apenas validação client-side)
 * ⚠️ NOTA: Backend não valida o token UUID no momento
 * @param {string} token - Token recebido por e-mail
 * @returns {Promise<Object>} Resultado da validação
 */
export const validarTokenRecuperacao = async (token) => {
  console.log('🔐 Validando token de recuperação (client-side)');
  
  if (!token || !token.trim()) {
    return {
      sucesso: false,
      mensagem: 'Token não encontrado na URL'
    };
  }
  
  // Valida formato UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token)) {
    return {
      sucesso: false,
      mensagem: 'Token inválido'
    };
  }
  
  console.log('✅ Token válido (formato UUID)');
  
  return {
    sucesso: true,
    mensagem: 'Token válido'
  };
};

/**
 * Redefine a senha (REQUER AUTENTICAÇÃO)
 * ⚠️ IMPORTANTE: Backend requer: email + senha atual + nova senha
 * @param {string} email - Email do voluntário
 * @param {string} novaSenha - Senha atual do usuário
 * @param {string} confirmarSenha - Nova senha do usuário
 * @returns {Promise<Object>} Resultado da operação
 */
export const redefinirSenha = async (email, novaSenha, confirmarSenha) => {
  try {
    console.log('🔐 Redefinindo senha para:', email);
    
    if (!email || !email.trim()) {
      throw new Error('Email é obrigatório');
    }
    
    if (!novaSenha || !novaSenha.trim()) {
      throw new Error('Nova senha é obrigatória');
    }
    
    if (!confirmarSenha || !confirmarSenha.trim()) {
      throw new Error('Confirmação de senha é obrigatória');
    }
    
    // Verifica se as senhas coincidem
    if (novaSenha !== confirmarSenha) {
      throw new Error('As senhas não coincidem');
    }

    const validacaoSenha = validarSenha(novaSenha);
    if (!validacaoSenha.valido) {
      throw new Error(validacaoSenha.erro);
    }
    
    console.log('📤 Enviando requisição PATCH para /voluntarios/redefinir-senha');
    const response = await apiClient.patch('/voluntarios/redefinir-senha', {
      email,
      novaSenha
    });
    console.log('📥 Resposta recebida:', response);
    
    console.log('✅ Senha redefinida com sucesso');
    
    return {
      sucesso: true,
      mensagem: 'Senha redefinida com sucesso'
    };
    
  } catch (error) {
    console.error('❌ Erro ao redefinir senha:', error);
    
    if (error.response) {
      const status = error.response.status;
      const mensagem = error.response.data?.message || error.message;
      
      switch (status) {
        case 401:
          throw new Error('Você precisa estar logado para redefinir a senha');
        case 404:
          throw new Error('Voluntário não encontrado com o email informado');
        case 400:
          // Verifica se é senha incorreta
          if (mensagem && mensagem.toLowerCase().includes('senha atual incorreta')) {
            throw new Error('Senha atual incorreta');
          }
          throw new Error(mensagem || 'Dados inválidos');
        case 500:
          throw new Error('Erro ao redefinir senha. Tente novamente mais tarde.');
        default:
          throw new Error(mensagem || 'Erro ao redefinir senha');
      }
    }
    
    // Erro de rede
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    }
    
    // Outros erros
    throw new Error(error.message || 'Erro inesperado ao redefinir senha');
  }
};

/**
 * Valida formato e requisitos de senha
 * @param {string} senha - Senha a validar
 * @returns {Object} {valido: boolean, erro: string|null}
 */
export const validarSenha = (senha) => {
  if (!senha || !senha.trim()) {
    return { valido: false, erro: 'Senha é obrigatória' };
  }
  
  if (senha.length < 5 || senha.length > 12) {
    return { valido: false, erro: 'A senha deve ter entre 5 e 12 caracteres' };
  }
  
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha)) {
    return { valido: false, erro: 'A senha deve conter pelo menos 1 caractere especial' };
  }
  
  return { valido: true, erro: null };
};

/**
 * Valida formato de e-mail
 * @param {string} email - E-mail a validar
 * @returns {Object} {valido: boolean, erro: string|null}
 */
export const validarEmail = (email) => {
  if (!email || !email.trim()) {
    return { valido: false, erro: 'E-mail é obrigatório' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valido: false, erro: 'E-mail inválido' };
  }
  
  return { valido: true, erro: null };
};

export const authService = {
  solicitarRecuperacaoSenha,
  validarTokenRecuperacao,
  redefinirSenha,
  validarSenha,
  validarEmail
};

export default authService;
