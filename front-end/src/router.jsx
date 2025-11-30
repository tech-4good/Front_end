import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Perfil from "./pages/Perfil";
import RecuperarSenha from "./pages/RecuperarSenha";
import ErrorPage from "./components/ErrorPage";
import ProtectedRoute from "./components/ProtectedRoute";
import VoluntariosMenu from "./pages/VoluntariosMenu";
import Home from "./pages/Home";
import VoluntariosExcluir from "./pages/VoluntariosExcluir";
import VoluntariosCadastro from "./pages/VoluntariosCadastro";
import CadastroBeneficiadoMenu from "./pages/CadastroBeneficiadoMenu";
import CadastroBeneficiadoSimples1 from "./pages/CadastroBeneficiadoSimples1";
import CadastroBeneficiadoSimples2 from "./pages/CadastroBeneficiadoSimples2";
import CadastroBeneficiadoCompleto1 from "./pages/CadastroBeneficiadoCompleto1";
import CadastroBeneficiadoCompleto2 from "./pages/CadastroBeneficiadoCompleto2";
import CadastroBeneficiadoCompleto3 from "./pages/CadastroBeneficiadoCompleto3";
import CadastroEndereco1 from "./pages/CadastroEndereco1";
import CadastroEndereco2 from "./pages/CadastroEndereco2";
import CadastroQuantidadePessoasPage from "./pages/CadastroQuantidadePessoasPage";
import FilaEspera from "./pages/FilaEspera";
import DoarCesta from "./pages/DoarCesta";
import ConsultaBeneficiados from "./pages/ConsultaBeneficiados";
import ConsultaBeneficiadosResultado from "./pages/ConsultaBeneficiadosResultado";
import ConsultaBeneficiadosMenu from "./pages/ConsultaBeneficiadosMenu";
import ControleCestas from "./pages/ControleCestas";
import ConsultaInformacoesPessoais from "./pages/ConsultaInformacoesPessoais";
import ConsultaEndereco from "./pages/ConsultaEndereco";
import ConsultaFilhos from "./pages/ConsultaFilhos";
import PainelMenu from "./pages/PainelMenu";
import HistoricoDoacoes from "./pages/HistoricoDoacoes";
import CadastroFilhos from "./pages/CadastroFilhos";
import CadastroAuxilios from "./pages/CadastroAuxilios";
import Dashboard from "./pages/Dashboard";
import RedefinirSenha from "./pages/RedefinirSenha";

export const router = createBrowserRouter([
  // ============================================
  // ROTAS PÚBLICAS (não requerem autenticação)
  // ============================================
  {
    path: "/",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro",
    element: <Cadastro />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/recuperar-senha",
    element: <RecuperarSenha />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/redefinir-senha",
    element: <RedefinirSenha />,
    errorElement: <ErrorPage />,
  },
  
  // ============================================
  // ROTAS PROTEGIDAS (requerem autenticação)
  // ============================================
  {
    path: "/home",
    element: <ProtectedRoute><Home /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/perfil",
    element: <ProtectedRoute><Perfil /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/doar-cesta",
    element: <ProtectedRoute><DoarCesta /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/consulta-beneficiados",
    element: <ProtectedRoute><ConsultaBeneficiados /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/voluntarios-menu",
    element: <ProtectedRoute><VoluntariosMenu /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/voluntarios-excluir",
    element: <ProtectedRoute><VoluntariosExcluir /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/voluntarios-cadastro",
    element: <ProtectedRoute><VoluntariosCadastro /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-beneficiado-menu",
    element: <ProtectedRoute><CadastroBeneficiadoMenu /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-beneficiado-simples1",
    element: <ProtectedRoute><CadastroBeneficiadoSimples1 /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-beneficiado-simples2",
    element: <ProtectedRoute><CadastroBeneficiadoSimples2 /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-beneficiado-completo1",
    element: <ProtectedRoute><CadastroBeneficiadoCompleto1 /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-beneficiado-completo2",
    element: <ProtectedRoute><CadastroBeneficiadoCompleto2 /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-beneficiado-completo3",
    element: <ProtectedRoute><CadastroBeneficiadoCompleto3 /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-endereco",
    element: <ProtectedRoute><CadastroEndereco1 /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-endereco-1",
    element: <ProtectedRoute><CadastroEndereco1 /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-endereco-2",
    element: <ProtectedRoute><CadastroEndereco2 /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-quantidade-pessoas",
    element: <ProtectedRoute><CadastroQuantidadePessoasPage /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/fila-espera",
    element: <ProtectedRoute><FilaEspera /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/controle-cestas",
    element: <ProtectedRoute><ControleCestas /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/consulta-beneficiados-resultado",
    element: <ProtectedRoute><ConsultaBeneficiadosResultado /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/consulta-beneficiados-menu",
    element: <ProtectedRoute><ConsultaBeneficiadosMenu /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/consulta-informacoes-pessoais",
    element: <ProtectedRoute><ConsultaInformacoesPessoais /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/consulta-informacoes-pessoais/:id",
    element: <ProtectedRoute><ConsultaInformacoesPessoais /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/consulta-endereco",
    element: <ProtectedRoute><ConsultaEndereco /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/consulta-filhos",
    element: <ProtectedRoute><ConsultaFilhos /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/painel-menu",
    element: <ProtectedRoute><PainelMenu /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/historico-doacoes",
    element: <ProtectedRoute><HistoricoDoacoes /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-filhos",
    element: <ProtectedRoute><CadastroFilhos /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-auxilios",
    element: <ProtectedRoute><CadastroAuxilios /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  }

]);
