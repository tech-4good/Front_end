import React from "react";
import { inputsQuantidadePessoas } from "../utils/cadastroEndereco";
import "../styles/QuantidadePessoas.css";

export default function QuantidadePessoas({ formData, onInputChange, children }) {
  return (
    <div className="quantidade-pessoas-container">
      <h2 className="quantidade-pessoas-titulo">
        Quantidade de Pessoas no Endereço
      </h2>
      
      <form className="quantidade-pessoas-form">
        <fieldset className="quantidade-pessoas-fieldset">
          {inputsQuantidadePessoas.slice(0, 4).map(({ label, placeholder, inputType }) => (
            <fieldset
              className="quantidade-pessoas-field"
              key={label}
            >
              <label 
                className="quantidade-pessoas-label" 
                htmlFor={`label-${label}`}
              >
                {label}:
              </label>
              <input
                className="quantidade-pessoas-input"
                id={`label-${label}`}
                type={inputType}
                placeholder={placeholder}
                value={formData[label.toLowerCase().replace(/\s+/g, '')] || ""}
                onChange={(e) => onInputChange(label.toLowerCase().replace(/\s+/g, ''), e.target.value)}
                min="0"
              />
            </fieldset>
          ))}
        </fieldset>

        <fieldset className="quantidade-pessoas-fieldset">
          {inputsQuantidadePessoas.slice(4, 7).map(({ label, placeholder, inputType }) => (
            <fieldset
              className="quantidade-pessoas-field"
              key={label}
            >
              <label 
                className="quantidade-pessoas-label" 
                htmlFor={`label-${label}`}
              >
                {label}:
              </label>
              <input
                className="quantidade-pessoas-input"
                id={`label-${label}`}
                type={inputType}
                placeholder={placeholder}
                value={formData[label.toLowerCase().replace(/\s+/g, '')] || ""}
                onChange={(e) => onInputChange(label.toLowerCase().replace(/\s+/g, ''), e.target.value)}
                min="0"
              />
            </fieldset>
          ))}
          {children && (
            <div className="quantidade-pessoas-button-container">
              {children}
            </div>
          )}
        </fieldset>
      </form>
    </div>
  );
}