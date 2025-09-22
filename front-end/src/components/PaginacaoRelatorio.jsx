import "../styles/PaginacaoRelatorio.css";

const PaginacaoRelatorio = ({ 
  paginaAtual, 
  totalPaginas
}) => {
  return (
    <div className="paginacao-relatorio"> {/* Arrumar css, colocar uma div na numeraçao */}
      <div className="paginacao-info">
        <span className="paginacao-texto">
          {paginaAtual} de {totalPaginas}
        </span>
      </div>
    </div>
  );
};

export default PaginacaoRelatorio;