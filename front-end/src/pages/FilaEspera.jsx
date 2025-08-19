import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import "../styles/FilaEspera.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

function formatarDataBR(dataStr) {
  const d = new Date(dataStr);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

const enderecosFake = [
  {
    id: 1,
    endereco: "Rua das Flores, 123",
    dataEntrada: "2024-06-01",
    moradores: [
      { id: 1, nome: "Maria Silva", idade: 34 },
      { id: 2, nome: "João Silva", idade: 18 },
    ],
  },
  {
    id: 2,
    endereco: "Av. Brasil, 456",
    dataEntrada: "2024-06-03",
    moradores: [
      { id: 3, nome: "Carlos Souza", idade: 40 },
      { id: 4, nome: "Ana Souza", idade: 38 },
      { id: 5, nome: "Pedro Souza", idade: 19 },
    ],
  },
  {
    id: 3,
    endereco: "Rua Verde, 789",
    dataEntrada: "2024-06-05",
    moradores: [
      { id: 6, nome: "Fernanda Lima", idade: 28 },
    ],
  },
  {
    id: 4,
    endereco: "Rua Azul, 321",
    dataEntrada: "2024-06-07",
    moradores: [
      { id: 7, nome: "Lucas Pereira", idade: 25 },
      { id: 8, nome: "Paula Pereira", idade: 22 },
    ],
  },
  {
    id: 5,
    endereco: "Av. Central, 654",
    dataEntrada: "2024-06-09",
    moradores: [
      { id: 9, nome: "Roberto Lima", idade: 50 },
      { id: 10, nome: "Juliana Lima", idade: 48 },
      { id: 11, nome: "Bruno Lima", idade: 20 },
      { id: 12, nome: "Sofia Lima", idade: 26 },
    ],
  },
  {
    id: 6,
    endereco: "Rua Amarela, 987",
    dataEntrada: "2024-06-11",
    moradores: [
      { id: 13, nome: "Marcos Souza", idade: 33 },
    ],
  },
  {
    id: 7,
    endereco: "Travessa do Sol, 159",
    dataEntrada: "2024-06-13",
    moradores: [
      { id: 14, nome: "Patrícia Gomes", idade: 29 },
      { id: 15, nome: "Rafael Gomes", idade: 31 },
      { id: 16, nome: "Lucas Gomes", idade: 28 },
    ],
  },
  {
    id: 8,
    endereco: "Rua do Porto, 753",
    dataEntrada: "2024-06-15",
    moradores: [
      { id: 17, nome: "Gabriel Costa", idade: 45 },
      { id: 18, nome: "Larissa Costa", idade: 43 },
    ],
  },
  {
    id: 9,
    endereco: "Av. das Palmeiras, 852",
    dataEntrada: "2024-06-17",
    moradores: [
      { id: 19, nome: "Renato Alves", idade: 37 },
      { id: 20, nome: "Camila Alves", idade: 35 },
      { id: 21, nome: "Lucas Alves", idade: 18 },
    ],
  },
  {
    id: 10,
    endereco: "Rua Nova, 111",
    dataEntrada: "2024-06-19",
    moradores: [
      { id: 22, nome: "Isabela Martins", idade: 27 },
      { id: 23, nome: "Flavia Martins", idade: 27 },
      { id: 24, nome: "Lucas Martins", idade: 27 },
      { id: 25, nome: "Matheus Martins", idade: 27 },
      { id: 26, nome: "Fernando Martins", idade: 27 },
      { id: 27, nome: "Ilys Martins", idade: 27 },
      { id: 28, nome: "Bruna Martins", idade: 27 },
      { id: 29, nome: "Vinicius Martins", idade: 27 },
    ],
  },
];

export default function FilaEspera() {
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

  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);

  return (
    <div className="fila-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
      <div className="fila-container">
        <Voltar onClick={() => navigate("/home")} />
        <h1 className="fila-title">Fila de Espera</h1>
        <div className="fila-content">
          <div className="fila-enderecos-lista">
            <div className="fila-enderecos-titulo">Endereços</div>
            <div className="fila-enderecos-scroll">
              {enderecosFake.map((end) => (
                <div
                  key={end.id}
                  className={`fila-endereco-card${enderecoSelecionado?.id === end.id ? " selecionado" : ""}`}
                  onClick={() => setEnderecoSelecionado(end)}
                >
                  <div className="fila-endereco-info">
                    <span className="fila-endereco-nome">{end.endereco}</span>
                    <span className="fila-endereco-data">{formatarDataBR(end.dataEntrada)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="fila-moradores-lista">
            <div className="fila-moradores-titulo">Moradores</div>
            <div className="fila-moradores-scroll">
              {enderecoSelecionado ? (
                enderecoSelecionado.moradores.map((morador) => (
                  <div key={morador.id} className="fila-morador-card">
                    <span className="fila-morador-nome">{morador.nome}</span>
                    <span className="fila-morador-idade">{morador.idade} anos</span>
                  </div>
                ))
              ) : (
                <div className="fila-morador-placeholder">Selecione um endereço para ver os moradores</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}