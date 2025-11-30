import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Botao from "../components/Botao";
import "../styles/CadastroQuantidadePessoas.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import iconeVoltar from "../assets/icone-voltar.png";

export default function CadastroQuantidadePessoas({ formData, handleInputChange, loading, onSubmit, showNavbar = false }) {
  const navigate = useNavigate();
  
  const [tipoUsuario, setTipoUsuario] = useState("2");
  useEffect(() => {
    const tipo = sessionStorage.getItem("tipoUsuario") || "2";
    setTipoUsuario(tipo);
  }, []);

  const botoesNavbar = [
    { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
    ...(tipoUsuario === "2"
      ? [
          {
            texto: "Fila de Espera",
            onClick: () => navigate("/fila-espera"),
            icone: iconeRelogio,
          },
        ]
      : []),
    { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair },
  ];

  const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";

  return (
    <div className="cadastro-quantidade-pessoas-bg">
      {showNavbar && (
        <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isCadastroEnderecoPage={true} />
      )}
      
      <div className="cadastro-quantidade-pessoas-container">
        {showNavbar && (
          <img 
            src={iconeVoltar} 
            alt="Voltar" 
            className="cadastro-quantidade-pessoas-icone-voltar"
            onClick={() => navigate(-1)}
          />
        )}
        
        <h1 className="cadastro-quantidade-pessoas-title">Pessoas no Endereço</h1>
      
        <form className="cadastro-quantidade-pessoas-form" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          {/* Primeira linha - 2 campos */}
          <div className="cadastro-quantidade-pessoas-row">
            <div className="cadastro-quantidade-pessoas-field">
              <label className="cadastro-quantidade-pessoas-label">Crianças:</label>
              <Input
                type="text"
                value={formData.quantidadedecriancas || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 2) {
                    handleInputChange("quantidadedecriancas", value);
                  }
                }}
                placeholder="Insira um número"
                className="cadastro-quantidade-pessoas-input"
                maxLength={2}
              />
            </div>
            <div className="cadastro-quantidade-pessoas-field">
              <label className="cadastro-quantidade-pessoas-label">Gestantes:</label>
              <Input
                type="text"
                value={formData.quantidadedegestantes || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 2) {
                    handleInputChange("quantidadedegestantes", value);
                  }
                }}
                placeholder="Insira um número"
                className="cadastro-quantidade-pessoas-input"
                maxLength={2}
              />
            </div>
          </div>

          {/* Segunda linha - 2 campos */}
          <div className="cadastro-quantidade-pessoas-row">
            <div className="cadastro-quantidade-pessoas-field">
              <label className="cadastro-quantidade-pessoas-label">Adolescentes:</label>
              <Input
                type="text"
                value={formData.quantidadedeadolescentes || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 2) {
                    handleInputChange("quantidadedeadolescentes", value);
                  }
                }}
                placeholder="Insira um número"
                className="cadastro-quantidade-pessoas-input"
                maxLength={2}
              />
            </div>
            <div className="cadastro-quantidade-pessoas-field">
              <label className="cadastro-quantidade-pessoas-label">Deficientes:</label>
              <Input
                type="text"
                value={formData.quantidadededeficientes || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 2) {
                    handleInputChange("quantidadededeficientes", value);
                  }
                }}
                placeholder="Insira um número"
                className="cadastro-quantidade-pessoas-input"
                maxLength={2}
              />
            </div>
          </div>

          {/* Terceira linha - 3 campos */}
          <div className="cadastro-quantidade-pessoas-row cadastro-quantidade-pessoas-row-triple">
            <div className="cadastro-quantidade-pessoas-field">
              <label className="cadastro-quantidade-pessoas-label">Jovens:</label>
              <Input
                type="text"
                value={formData.quantidadedejovens || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 2) {
                    handleInputChange("quantidadedejovens", value);
                  }
                }}
                placeholder="Insira um número"
                className="cadastro-quantidade-pessoas-input"
                maxLength={2}
              />
            </div>
            <div className="cadastro-quantidade-pessoas-field">
              <label className="cadastro-quantidade-pessoas-label">Idosos:</label>
              <Input
                type="text"
                value={formData.quantidadedeidosos || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 2) {
                    handleInputChange("quantidadedeidosos", value);
                  }
                }}
                placeholder="Insira um número"
                className="cadastro-quantidade-pessoas-input"
                maxLength={2}
              />
            </div>
            <div className="cadastro-quantidade-pessoas-field">
              <label className="cadastro-quantidade-pessoas-label">Outros:</label>
              <Input
                type="text"
                value={formData.quantidadedeoutros || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 2) {
                    handleInputChange("quantidadedeoutros", value);
                  }
                }}
                placeholder="Insira um número"
                className="cadastro-quantidade-pessoas-input"
                maxLength={2}
              />
            </div>
          </div>

          <div className="cadastro-quantidade-pessoas-botoes">
            <Botao 
              texto={loading ? "Cadastrando..." : "Enviar"} 
              type="submit" 
              className="cadastro-quantidade-pessoas-btn" 
              disabled={loading}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
