import axios from 'axios';


// Criar uma instância do axios
const apiClient = axios.create({
  baseURL: 'http://localhost:8080', 
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
    if (error.response?.status === 401) {
      // Exemplo: exibir mensagem ao usuário
      alert('Sua sessão expirou. Faça login novamente.');
      sessionStorage.clear();
      // Redireciona apenas se não estiver na página de login
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    } else if (error.response?.status === 403) {
      alert('Você não tem permissão para acessar este recurso.');
    } else if (error.response?.status === 500) {
      alert('Erro interno do servidor. Tente novamente mais tarde.');
    }
    return Promise.reject(error);
  }
);


export default apiClient;