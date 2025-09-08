import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import Voltar from "../components/Voltar";
import Botao from "../components/Botao";
import "../styles/CadastroBeneficiadoMenu.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

export default function CadastroBeneficiadoMenu() {
  const navigate = useNavigate();
  const [modalSucesso, setModalSucesso] = useState(false);
  const [nomeBeneficiado, setNomeBeneficiado] = useState("");

  useEffect(() => {
    if (localStorage.getItem("modalSucessoBeneficiado") === "true") {
      const nome = sessionStorage.getItem("nomeBeneficiado") || "";
      setNomeBeneficiado(nome);
      setModalSucesso(true);
      localStorage.removeItem("modalSucessoBeneficiado");
    }
  }, []);
  const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";
  const tipoUsuario = sessionStorage.getItem("tipoUsuario") || "2";

  const botoesNavbar = [
    { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
    { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
    ...(tipoUsuario === "2"
      ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }]
      : []),
    { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
  ];

  return (
    <div className="cadastrobeneficiado-container">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
      <div className="cadastrobeneficiado-voltar">
        <Voltar onClick={() => navigate("/home")} />
      </div>
      <div className="cadastrobeneficiado-card">
        <div className="cadastrobeneficiado-title">Cadastre um Beneficiado!</div>
        <div className="cadastrobeneficiado-subtitle">
          Escolha um tipo de cadastro!
        </div>
        <div className="cadastrobeneficiado-botoes">
          <Botao
            texto="Simples"
            className="cadastrobeneficiado-botao"
            onClick={() => navigate("/cadastro-beneficiado-simples1")}
          />
          <Botao
            texto="Completo"
            className="cadastrobeneficiado-botao"
            onClick={() => navigate("/cadastro-beneficiado-completo1")}
          />
        </div>
      </div>
      <Modal
        isOpen={modalSucesso}
        onClose={() => setModalSucesso(false)}
        texto={`Beneficiado ${nomeBeneficiado} cadastrado com sucesso!`}
      />
    </div>
  );
}
