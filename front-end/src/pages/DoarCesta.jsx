import React, { useState } from "react";
// Dados fake para busca de CPF
const beneficiadosFake = [
  { cpf: "48763842135", nome: "Juliana Gomes Oliveira" },
  { cpf: "12345678901", nome: "Carlos Silva" },
  { cpf: "98765432100", nome: "Maria Souza" },
  { cpf: "45678912300", nome: "Ana Paula Lima" },
  { cpf: "11122233344", nome: "João Pedro Santos" },
];
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import Input from "../components/Input";
import Botao from "../components/Botao";
import Radio from "../components/Radio";
import "../styles/DoarCesta.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

export default function DoarCesta() {
  const navigate = useNavigate();
  const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";
  const tipoUsuario = sessionStorage.getItem("tipoUsuario") || "2";

  const botoesNavbar = [
    { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
    { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
    ...(tipoUsuario === "2"
      ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }]
      : []),
    { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair },
  ];

  const [cpf, setCpf] = useState("");
  const [tipoCesta, setTipoCesta] = useState("");
  const [resultados, setResultados] = useState([]);

  function handleCpfChange(e) {
    const valor = e.target.value.replace(/\D/g, "");
    setCpf(valor);
    if (valor.length > 0) {
      setResultados(
        beneficiadosFake.filter(v => v.cpf.includes(valor))
      );
    } else {
      setResultados([]);
    }
  }

  return (
    <div className="doar-cesta-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
      <div className="doar-cesta-container">
        <div className="doar-cesta-voltar">
          <Voltar onClick={() => navigate("/home")} />
        </div>
        <h1 className="doar-cesta-title">Entregar Cesta</h1>
        <form className="doar-cesta-form" autoComplete="off">
          <Input
            placeholder="Insira o CPF"
            value={cpf}
            onChange={handleCpfChange}
            className="doar-cesta-input"
            maxLength={11}
          />
          {cpf && cpf.length < 11 && resultados.length > 0 && (
            <div className="doar-cesta-resultados">
              {resultados.map((v, idx) => (
                <div
                  className="doar-cesta-resultado"
                  key={idx}
                  style={{ cursor: "pointer" }}
                  onClick={() => setCpf(v.cpf)}
                >
                  {v.nome}
                </div>
              ))}
            </div>
          )}
          <div className="doar-cesta-radio-row">
            <span className="doar-cesta-radio-label">Tipo:</span>
            <Radio
              name="tipoCesta"
              options={[
                { label: "Kit", value: "kit" },
                { label: "Cesta Básica", value: "basica" },
              ]}
              value={tipoCesta}
              onChange={e => setTipoCesta(e.target.value)}
            />
          </div>
          <div className="doar-cesta-btn-row">
            <Botao texto="Doar" type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
}
