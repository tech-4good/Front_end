import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Perfil from "./pages/Perfil";
import RecuperarSenha from "./pages/RecuperarSenha";
import ErrorPage from "./components/ErrorPage";
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
import CadastroEndereco from "./pages/CadastroEndereco";
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
export const router = createBrowserRouter([
  {
    path: "/doar-cesta",
    element: <DoarCesta />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/consulta-beneficiados",
    element: <ConsultaBeneficiados />,
    errorElement: <ErrorPage />,
  },
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
    path: "/perfil",
    element: <Perfil />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/recuperar-senha",
    element: <RecuperarSenha />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/home",
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/voluntarios-menu",
    element: <VoluntariosMenu />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/voluntarios-excluir",
    element: <VoluntariosExcluir />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/voluntarios-cadastro",
    element: <VoluntariosCadastro />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-beneficiado-menu",
    element: <CadastroBeneficiadoMenu />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-beneficiado-simples1",
    element: <CadastroBeneficiadoSimples1 />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-beneficiado-simples2",
    element: <CadastroBeneficiadoSimples2 />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-beneficiado-completo1",
    element: <CadastroBeneficiadoCompleto1 />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-beneficiado-completo2",
    element: <CadastroBeneficiadoCompleto2 />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-beneficiado-completo3",
    element: <CadastroBeneficiadoCompleto3 />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/cadastro-endereco",
    element: <CadastroEndereco />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/fila-espera",
    element: <FilaEspera />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/controle-cestas",
    element: <ControleCestas />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/consulta-beneficiados-resultado",
    element: <ConsultaBeneficiadosResultado />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/consulta-beneficiados-menu",
    element: <ConsultaBeneficiadosMenu />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/consulta-informacoes-pessoais",
    element: <ConsultaInformacoesPessoais />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/consulta-endereco",
    element: <ConsultaEndereco />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/consulta-filhos",
    element: <ConsultaFilhos />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/painel-menu",
    element: <PainelMenu />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/historico-doacoes",
    element: <HistoricoDoacoes />,
    errorElement: <ErrorPage />,
  },
   {
  path: "/cadastro-filhos",
  element: <CadastroFilhos />,
  errorElement: <ErrorPage />,
},

]);
