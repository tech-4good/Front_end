import axios from 'axios';


// Criar uma instância do axios
const apiClient = axios.create({
<<<<<<< HEAD
  baseURL: 'http://app-load-balancer-530489435.us-east-1.elb.amazonaws.com/api', 
=======
  baseURL: 'http://app-load-balancer-530489435.us-east-1.elb.amazonaws.com/api', 
>>>>>>> bc8754d7b9909738d0fb8c68a243c2da7ce69006
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adicionar token automaticamente nas requisições
apiClient.interceptors.request.use(
  (config) => {
    const authToken = sessionStorage.getItem('authToken');
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Tratar respostas e redirecionamentos
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 400) {
      // Erro de validação/dados incorretos
      const mensagem = error.response?.data?.message || 
                      error.response?.data?.error || 
                      'Dados inválidos. Verifique as informações preenchidas.';
      
      window.dispatchEvent(new CustomEvent('apiError', {
        detail: {
          type: 'validation',
          title: 'Dados Incorretos',
          message: mensagem
        }
      }));
    } else if (error.response?.status === 401) {
      // Disparar evento customizado em vez de alert
      window.dispatchEvent(new CustomEvent('apiError', {
        detail: {
          type: 'auth',
          title: 'Sessão Expirada',
          message: 'Sua sessão expirou. Faça login novamente.',
          redirectTo: '/'
        }
      }));
      sessionStorage.clear();
      // Redireciona apenas se não estiver na página de login
      if (window.location.pathname !== '/') {
        setTimeout(() => window.location.href = '/', 2000);
      }
    } else if (error.response?.status === 403) {
      window.dispatchEvent(new CustomEvent('apiError', {
        detail: {
          type: 'permission',
          title: 'Acesso Negado',
          message: 'Você não tem permissão para acessar este recurso.'
        }
      }));
    } else if (error.response?.status === 500) {
      window.dispatchEvent(new CustomEvent('apiError', {
        detail: {
          type: 'server',
          title: 'Erro do Servidor',
          message: 'Erro interno do servidor. Tente novamente mais tarde.'
        }
      }));
    }
    return Promise.reject(error);
  }
);


export default apiClient;
