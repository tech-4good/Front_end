import React, { useState } from "react";
import FormularioLogin from "./pages/Login/FormularioLogin";
import FormularioCadastro from "./pages/Cadastro/FormularioCadastro";
import Home from "./pages/Home/Home";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("login");

  const handleNavigateToCadastro = () => {
    setCurrentPage("cadastro");
  };

  const handleNavigateToLogin = () => {
    setCurrentPage("login");
  };

  const handleLoginSuccess = () => {
    setCurrentPage("home");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "cadastro":
        return <FormularioCadastro onNavigateToLogin={handleNavigateToLogin} />;
      case "home":
        return <Home />;
      case "login":
      default:
        return (
          <FormularioLogin
            onNavigateToCadastro={handleNavigateToCadastro}
            onLoginSuccess={handleLoginSuccess}
          />
        );
    }
  };

  return <div className="App">{renderPage()}</div>;
}

export default App;
