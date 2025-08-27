import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ControleCesta.css"
import Voltar from "../components/Voltar";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Radio from "../components/Radio";
import Botao from "../components/Botao";

export default function ControleCesta() {
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

  const [quantidadeCestaBasica, setQuantidade] = useState("");
  const [tipoCesta, setTipoCesta] = useState("");
  const [valor, setosValor] = useState([]);

  return (
    <div className="controle-cesta">

    </div>
  );
}

//TODO: Colocar a navbar
//TODO: Botão de voltar 
//TODO: Titulo
//TODO: 3 Cards
//TODO: Card quantidade de cestas
//TODO: Card total cestas
//TODO: Card Quantidade de kits
//TODO: Select kit ou cesta (igual a entregar cesta)
//TODO: Imput quantidade
//TODO: Botão Adicionar
//TODO: Logica e css

//TODO: Aviso de confirmação
// -> Depois do envio do imput/form, o componente é trocado por um aviso e depois reaparece
//TODO: Modal de confirmação