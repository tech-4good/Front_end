import apiClient from '../provider/api.js';

// Serviços para Voluntários
export const voluntarioService = {
  // Cadastrar voluntário
  cadastrar: async (dadosVoluntario) => {
    try {
      const response = await apiClient.post('/voluntarios', {
        nome: dadosVoluntario.nomeCompleto,
        cpf: dadosVoluntario.cpf,
        telefone: dadosVoluntario.telefone,
        email: dadosVoluntario.email,
        senha: dadosVoluntario.senha,
        administrador: dadosVoluntario.TipoUsuario
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      
      let mensagem = 'Erro interno do servidor';
      
      // Extrair mensagem de erro do backend (pode estar em diferentes lugares)
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      '';
      
      console.log('Mensagem de erro capturada:', errorMsg); // Debug
      
      // Verificar se é erro de duplicação (pode vir em erro 500, 409 ou 400)
      if (errorMsg.toLowerCase().includes('duplicate entry') || 
          errorMsg.toLowerCase().includes('duplicat')) {
        
        // Extrair o email da mensagem de erro se possível
        const emailMatch = errorMsg.match(/'([^']*@[^']*)'/);
        const emailDuplicado = emailMatch ? emailMatch[1] : '';
        
        if (errorMsg.toLowerCase().includes('email') || errorMsg.toLowerCase().includes('e-mail') || emailDuplicado) {
          mensagem = emailDuplicado 
            ? `O e-mail "${emailDuplicado}" já está cadastrado no sistema.`
            : 'Este e-mail já está cadastrado no sistema.';
        } else if (errorMsg.toLowerCase().includes('cpf')) {
          mensagem = 'Este CPF já está cadastrado no sistema.';
        } else {
          mensagem = 'Já existe um cadastro com estes dados no sistema.';
        }
      } 
      // Tratamento específico por status HTTP
      else if (error.response?.status === 400) {
        if (errorMsg.toLowerCase().includes('email') || errorMsg.toLowerCase().includes('e-mail')) {
          mensagem = 'Este e-mail já está cadastrado no sistema.';
        } else if (errorMsg.toLowerCase().includes('cpf')) {
          mensagem = 'Este CPF já está cadastrado no sistema.';
        } else if (errorMsg) {
          mensagem = errorMsg;
        } else {
          mensagem = 'Dados inválidos. Verifique os campos preenchidos.';
        }
      } else if (error.response?.status === 409) {
        // Status 409 = Conflict (recurso já existe)
        if (errorMsg.toLowerCase().includes('email') || errorMsg.toLowerCase().includes('e-mail')) {
          mensagem = 'Este e-mail já está cadastrado no sistema.';
        } else if (errorMsg.toLowerCase().includes('cpf')) {
          mensagem = 'Este CPF já está cadastrado no sistema.';
        } else {
          mensagem = 'Este e-mail ou CPF já está cadastrado no sistema.';
        }
      } else if (error.response?.status === 500) {
        // Se não foi duplicação e é erro 500, mensagem genérica
        mensagem = 'Erro interno do servidor. Tente novamente mais tarde.';
      } else if (error.message === 'Network Error') {
        mensagem = 'Erro de conexão. Verifique sua internet.';
      } else if (errorMsg) {
        // Usar mensagem do backend se disponível
        mensagem = errorMsg;
      }
      
      return { success: false, error: mensagem };
    }
  },

  // Login do voluntário
  login: async (email, senha) => {
    try {
      const response = await apiClient.post('/voluntarios/login', {
        email,
        senha
      });
      
      console.log('Resposta do login:', response.data); // Debug log
      
      // Salvar token e dados do usuário no sessionStorage
      if (response.data.token) {
        // Isso aqui é só pra fazer funcionar por enquanto pois o valor de administrador está vindo como undefined
        // const tipoUsuario = response.data.administrador === 1 ? "1" : "2";
        
        sessionStorage.setItem('authToken', response.data.token);
        sessionStorage.setItem('nomeUsuario', response.data.nome);
        sessionStorage.setItem('emailUsuario', response.data.email);
        sessionStorage.setItem('tipoUsuario', response.data.administrador === 1 ? "2" : "1");
        sessionStorage.setItem('userId', response.data.userId.toString());
        
        console.log('Dados salvos no sessionStorage:', {
          tipoUsuario: response.data.administrador === 1 ? "2" : "1",
          administrador: response.data.administrador,
          userId: response.data.userId
        }); // Debug log
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro no login:', error);
      
      let mensagem = 'Erro interno do servidor';
      
      if (error.response?.status === 401) {
        mensagem = 'E-mail ou senha incorretos.';
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      } else if (error.message === 'Network Error') {
        mensagem = 'Erro de conexão. Verifique sua internet.';
      }
      
      return { success: false, error: mensagem };
    }
  },

  // Buscar voluntário por ID
  buscarPorId: async (id) => {
    try {
      const response = await apiClient.get(`/voluntarios/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar voluntário:', error);
      return { success: false, error: 'Erro ao carregar dados do voluntário' };
    }
  },

  // Listar todos os voluntários
  listarTodos: async () => {
    try {
      const response = await apiClient.get('/voluntarios');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao listar voluntários:', error);
      return { success: false, error: 'Erro ao carregar lista de voluntários' };
    }
  },

  // Atualizar voluntário
  // ⚠️ IMPORTANTE: Backend atual só aceita TELEFONE e EMAIL
  // Outros campos (nome, cpf, senha) são ignorados pela API
  atualizar: async (id, dadosVoluntario) => {
    try {
      const payload = {};
      
      // Backend só aceita estes 2 campos:
      if (dadosVoluntario.telefone !== undefined) {
        payload.telefone = String(dadosVoluntario.telefone).replace(/\D/g, '');
      }
      
      if (dadosVoluntario.email !== undefined) {
        payload.email = String(dadosVoluntario.email).toLowerCase().trim();
      }

      console.log('📤 Enviando payload de atualização (telefone e email apenas):', payload);
      const response = await apiClient.patch(`/voluntarios/${id}`, payload);
      console.log('✅ Atualização bem-sucedida:', response.data);
      console.log('ℹ️ Campos atualizados: telefone e email');
      console.log('⚠️ Campos NÃO atualizados: nome, cpf, senha (backend não suporta)');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Erro ao atualizar voluntário:', error);
      console.error('❌ Detalhes:', error.response?.data);
      
      let mensagem = 'Erro ao atualizar dados';
      
      if (error.response?.status === 400) {
        mensagem = 'Dados inválidos. Verifique os campos preenchidos.';
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Se houver erros de validação específicos
        const erros = error.response.data.errors;
        if (Array.isArray(erros)) {
          mensagem = erros.map(e => e.defaultMessage || e.message).join(', ');
        }
      }
      
      return { success: false, error: mensagem };
    }
  },

  // Remover voluntário
  remover: async (id) => {
    try {
      await apiClient.delete(`/voluntarios/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover voluntário:', error);
      return { success: false, error: 'Erro ao remover voluntário' };
    }
  },

  // Redefinir senha
  redefinirSenha: async (email) => {
    try {
      const response = await apiClient.patch('/voluntarios/redefinir-senha', { email });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      let mensagem = 'Erro ao redefinir senha';
      
      if (error.response?.status === 404) {
        mensagem = 'E-mail não encontrado.';
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      }
      
      return { success: false, error: mensagem };
    }
  }
};
