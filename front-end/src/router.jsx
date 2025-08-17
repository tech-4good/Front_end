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

export const router = createBrowserRouter([
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
  }
]);
