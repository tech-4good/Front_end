import { createBrowserRouter } from "react-router-dom";

import Cadastro from "./pages/Cadastro";
import Perfil from "./pages/Perfil";
import ErrorPage from "./components/ErrorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Cadastro />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/perfil",
    element: <Perfil />,
    errorElement: <ErrorPage />,
  },
]);
