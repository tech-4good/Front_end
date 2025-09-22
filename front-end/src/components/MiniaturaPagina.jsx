import "../styles/MiniaturaPagina.css";

const MiniaturaPagina = ({ numeroPagina, ativo, onClick }) => {
  return (
    <div 
      className={`miniatura-pagina ${ativo ? 'ativo' : ''}`}
      onClick={() => onClick(numeroPagina)}
    >
      <div className="miniatura-conteudo"> {/* retirar depois para coloar a pagina respectiva*/}
        <div className="miniatura-cabecalho"></div>
        <div className="miniatura-linhas">
          <div className="miniatura-linha"></div>
          <div className="miniatura-linha"></div>
          <div className="miniatura-linha curta"></div>
        </div>
        {numeroPagina > 1 && (
          <div className="miniatura-linhas-extras">
            <div className="miniatura-linha"></div>
            <div className="miniatura-linha curta"></div>
          </div>
        )}
      </div>
      <span className="miniatura-numero">{numeroPagina}</span>
    </div>
  );
};

export default MiniaturaPagina;