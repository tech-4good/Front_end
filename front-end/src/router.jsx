import { createBrowserRouter } from "react-router-dom";


import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
// import Home from "./pages/Home";
import Perfil from "./pages/Perfil";
import RecuperarSenha from "./pages/RecuperarSenha";
import ErrorPage from "./components/ErrorPage";

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
  // {
  //   path: "/home",
  //   element: <Home />,
  //   errorElement: <ErrorPage />,
  // }
]);
