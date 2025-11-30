import axios from 'axios';


// Criar uma instância do axios
const apiClient = axios.create({
  baseURL: '/api', // Usa proxy reverso configurado no Vite (dev) e no Nginx (produção)
  timeout: 10000,
  // ⚠️ NÃO definir Content-Type aqui - deixar cada requisição definir o seu
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// Adicionar token automaticamente nas requisições
apiClient.interceptors.request.use(
  (config) => {
    // 🔓 Rotas públicas que NÃO precisam de autenticação
    const rotasPublicas = [
      '/voluntarios/login',
      '/voluntarios/cadastrar',
      '/voluntarios/solicitar-redefinicao-senha',
      '/voluntarios/redefinir-senha',
    ];

    // Verifica se a URL da requisição é uma rota pública
    const isRotaPublica = rotasPublicas.some(rota => config.url.includes(rota));

    // 🔐 Apenas adiciona token se NÃO for rota pública
    if (!isRotaPublica) {
      const authToken = sessionStorage.getItem('authToken');
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
    }

    // ✅ Se não for FormData, definir Content-Type como JSON
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    // ✅ Se for FormData, deixar o axios definir automaticamente (multipart/form-data)

    return config;
  },
  (error) => Promise.reject(error)
);

// Tratar respostas e redirecionamentos
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Removi o tratamento automático de erro 400 para evitar modais técnicos
    // Os serviços individuais devem tratar seus próprios erros
    if (error.response?.status === 401) {
      // Não mostrar "Sessão Expirada" se for erro na rota de login
      const isLoginRoute = error.config?.url?.includes('/voluntarios/login');

      if (!isLoginRoute) {
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
