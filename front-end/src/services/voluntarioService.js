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
      
      if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      } else if (error.response?.status === 400) {
        mensagem = 'Dados inválidos. Verifique os campos preenchidos.';
      } else if (error.response?.status === 409) {
        mensagem = 'Este e-mail ou CPF já está cadastrado.';
      } else if (error.message === 'Network Error') {
        mensagem = 'Erro de conexão. Verifique sua internet.';
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
  atualizar: async (id, dadosVoluntario) => {
    try {
      const payload = {};
      // Enviar somente 'nomeCompleto' para o backend (não enviar 'nome')
      if (dadosVoluntario.nome !== undefined) payload.nomeCompleto = String(dadosVoluntario.nome).trim();
      if (dadosVoluntario.cpf !== undefined) payload.cpf = String(dadosVoluntario.cpf).replace(/\D/g, '');
      if (dadosVoluntario.telefone !== undefined) payload.telefone = dadosVoluntario.telefone;
      if (dadosVoluntario.email !== undefined) payload.email = dadosVoluntario.email;
      if (dadosVoluntario.senha !== undefined && dadosVoluntario.senha !== "") payload.senha = dadosVoluntario.senha;

      console.log('Enviando payload de atualização:', payload);
      const response = await apiClient.patch(`/voluntarios/${id}`, payload);
      console.log('Resposta da atualização (status):', response.status);
      console.log('Resposta da atualização (headers):', response.headers);
      console.log('Resposta da atualização (data):', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao atualizar voluntário:', error);
      let mensagem = 'Erro ao atualizar dados';
      
      if (error.response?.status === 400) {
        mensagem = 'Dados inválidos. Verifique os campos preenchidos.';
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
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
