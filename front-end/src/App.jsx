import { router } from "./router";
import { RouterProvider } from "react-router-dom";
import GlobalErrorHandler from "./components/GlobalErrorHandler";

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <GlobalErrorHandler />
    </>
  );
}

export default App;
