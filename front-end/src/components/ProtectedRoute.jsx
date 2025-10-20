import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * Componente para proteger rotas que requerem autenticação
 * Verifica se existe um token de autenticação no sessionStorage
 * Se não houver, redireciona para a página de login
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Verifica se o usuário está autenticado
  const authToken = sessionStorage.getItem('authToken');
  const userId = sessionStorage.getItem('userId');
  
  useEffect(() => {
    // Log para debug
    if (!authToken || !userId) {
      console.warn(`🔒 Acesso negado à rota "${location.pathname}": usuário não autenticado`);
      console.warn('Redirecionando para a página de login...');
    }
  }, [authToken, userId, location.pathname]);
  
  // Se não houver token ou userId, redireciona para o login
  if (!authToken || !userId) {
    // Salva a rota que o usuário tentou acessar (para redirecionar após login)
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/" replace />;
  }
  
  // Se estiver autenticado, renderiza o componente filho
  return children;
};

export default ProtectedRoute;
