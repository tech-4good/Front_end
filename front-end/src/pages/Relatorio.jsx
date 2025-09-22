import React, { useState, useEffect } from "react";import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import Botao from "../components/Botao";
import PaginacaoRelatorio from "../components/PaginacaoRelatorio";
import VisualizadorRelatorio from "../components/VisualizadorRelatorio";
import MiniaturaPagina from "../components/MiniaturaPagina";
import "../styles/Relatorio.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

export default function Relatorio() {
  const navigate = useNavigate();
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [tipoUsuario, setTipoUsuario] = useState("2");
  
  const totalPaginas = 3;

  useEffect(() => {
    const tipo = sessionStorage.getItem("tipoUsuario") || "2";
    setTipoUsuario(tipo);
  }, []);

  const botoesNavbar = [
    { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
    { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
    ...(tipoUsuario === "2"
      ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }]
      : []),
    { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
  ];

  const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";

  const handleIrParaPagina = (numeroPagina) => {
    setPaginaAtual(numeroPagina);
  };

  const handleBaixarPDF = async () => {
    try {
      // arruamr depois
      const conteudoPDF = `
Página 1 - a


Página 2 - b


Página 3 - c
      `;

      const blob = new Blob([conteudoPDF], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'relatorio.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Relatorio baixado com sucesso');
    } catch (error) {
      console.error('Erro ao baixar Relatorio:', error);
    }
  };

  return (
    <div className="relatorio-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
      
      <div className="relatorio-container">
        <Voltar onClick={() => navigate("/painel-menu")} />
        
        <div className="relatorio-paginacao-center">
          <PaginacaoRelatorio
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
          />
        </div>

        <div className="relatorio-main-container">
          <div className="relatorio-sidebar">
            <div className="miniaturas-container">
              {Array.from({ length: totalPaginas }, (_, index) => (
                <MiniaturaPagina
                  key={index + 1}
                  numeroPagina={index + 1}
                  ativo={paginaAtual === index + 1}
                  onClick={handleIrParaPagina}
                />
              ))}
            </div>
          </div>

          <div className="relatorio-main">
            <VisualizadorRelatorio 
              paginaAtual={paginaAtual}
            />
          </div>

          <div className="relatorio-actions">
            <Botao 
              texto="Baixar relatório"
              onClick={handleBaixarPDF}
            />
          </div>
        </div>
      </div>
    </div>
  );
}