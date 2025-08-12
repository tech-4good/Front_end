import { createBrowserRouter } from "react-router-dom";
import Cadastro from "./pages/Cadastro";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Cadastro />,
  },
]);
