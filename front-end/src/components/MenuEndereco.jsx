import React from "react";
import Voltar from "./Voltar";
import "../styles/MenuEndereco.css";

export default function MenuEndereco({ page, onClick, showStep = true }) {
  return (
    <section className="menu-endereco">
      <Voltar className="menu-endereco-voltar" onClick={onClick} />
      <h1 className="menu-endereco-titulo">Cadastro de Endereço</h1>
      {showStep && (
        <span className="menu-endereco-step">
          Passo: {page}/2
        </span>
      )}
    </section>
  );
}