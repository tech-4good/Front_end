import React from "react";
import { successMessageEndereco } from "../utils/cadastroEndereco";
import "../styles/SucessoEndereco.css"

export default function SucessoEndereco({ onNext }) {
  return (
    <div className="sucesso-container">
      <div className="sucesso-card">
        <p className="sucesso-texto">
          {successMessageEndereco.title}
        </p>
        <button 
          className="sucesso-btn"
          onClick={onNext}
        >
          {successMessageEndereco.buttonText}
        </button>
      </div>
    </div>
  );
}