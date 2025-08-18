import React from "react";
import { successMessageQuantidade } from "../utils/cadastroEndereco";
import "../styles/SucessoFinal.css";

export default function SucessoFinal({ onHome }) {
  return (
    <div className="sucesso-final-container">
      <div className="sucesso-final-card">
        <p className="sucesso-final-texto">
          {successMessageQuantidade.title}
        </p>
        <button 
          className="sucesso-final-btn"
          onClick={onHome}
        >
          {successMessageQuantidade.buttonText}
        </button>
      </div>
    </div>
  );
}