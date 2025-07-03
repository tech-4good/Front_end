import React, { useState } from 'react'
import FormularioLogin from './pages/Login/FormularioLogin'
import FormularioCadastro from './pages/Cadastro/FormularioCadastro'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const handleNavigateToCadastro = () => {
    setCurrentPage('cadastro')
  }

  const handleNavigateToLogin = () => {
    setCurrentPage('login')
  }

  const renderPage = () => {
    switch(currentPage) {
      case 'cadastro':
        return <FormularioCadastro onNavigateToLogin={handleNavigateToLogin} />
      case 'login':
      default:
        return <FormularioLogin onNavigateToCadastro={handleNavigateToCadastro} />
    }
  }

  return (
    <div className="App">
      {renderPage()}
    </div>
  )
}

export default App