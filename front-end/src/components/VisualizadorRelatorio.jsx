import "../styles/VisualizadorRelatorio.css";
//  Fazer dinamico depois
const VisualizadorRelatorio = ({ paginaAtual }) => { 
  const renderizarPagina1 = () => (
    <div className="relatorio-pagina">
      <div className="relatorio-rodape">
        <span className="relatorio-numeracao">Página 1 de 3</span>
      </div>
    </div>
  );

  const renderizarPagina2 = () => (
    <div className="relatorio-pagina">
      <div className="relatorio-rodape">
        <span className="relatorio-numeracao">Página 2 de 3</span>
      </div>
    </div>
  );

  const renderizarPagina3 = () => (
    <div className="relatorio-pagina">
      <div className="relatorio-rodape">
        <span className="relatorio-numeracao">Página 3 de 3</span>
      </div>
    </div>
  );

  const renderizarPagina = () => {
    switch (paginaAtual) {
      case 1:
        return renderizarPagina1();
      case 2:
        return renderizarPagina2();
      case 3:
        return renderizarPagina3();
      default:
        return renderizarPagina1();
    }
  };

  return (
    <div className="visualizador-relatorio">
      {renderizarPagina()}
    </div>
  );
};

export default VisualizadorRelatorio;