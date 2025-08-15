import React from "react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import "../styles/Home.css";

import iconEndereco from "../assets/icone-casa.png";
import iconBeneficiados from "../../assets/users.png";
import iconEntregar from "../../assets/entrega.png";
import iconConsultar from "../../assets/lupa.png";
import iconRelatorio from "../../assets/painel.png";
import iconHistorico from "../../assets/historico.png";
import iconCestas from "../../assets/caixa-aberta.png";
import iconVoluntarios from "../../assets/user.png";

const cards = [
  {
    title: "Cadastrar Endereço",
    icon: (
      <img src={iconEndereco} alt="Cadastrar Endereço" width={44} height={44} />
    ),
    onClick: () => {},
  },
  {
    title: "Cadastrar Beneficiados",
    icon: (
      <img
        src={iconBeneficiados}
        alt="Cadastrar Beneficiados"
        width={44}
        height={44}
      />
    ),
    onClick: () => {},
  },
  {
    title: "Entregar Cesta",
    icon: (
      <img src={iconEntregar} alt="Entregar Cesta" width={44} height={44} />
    ),
    onClick: () => {},
  },
  {
    title: "Consultar Beneficiados",
    icon: (
      <img
        src={iconConsultar}
        alt="Consultar Beneficiados"
        width={44}
        height={44}
      />
    ),
    onClick: () => {},
  },
  {
    title: "Relatório",
    icon: <img src={iconRelatorio} alt="Relatório" width={44} height={44} />,
    onClick: () => {},
  },
  {
    title: "Histórico de Cestas",
    icon: (
      <img
        src={iconHistorico}
        alt="Histórico de Cestas"
        width={44}
        height={44}
      />
    ),
    onClick: () => {},
  },
  {
    title: "Cestas",
    icon: <img src={iconCestas} alt="Cestas" width={44} height={44} />,
    onClick: () => {},
  },
  {
    title: "Voluntários",
    icon: (
      <img src={iconVoluntarios} alt="Voluntários" width={44} height={44} />
    ),
    onClick: () => {},
  },
];

const Home = () => {
  return (
    <div className="home-page">
      <NavBar userName="Aline" />
      <div className="home-content">
        <h1 className="home-title">Central de Acesso</h1>
        <p className="home-subtitle">
          Escolha uma das opções abaixo para acessar as informações desejadas
        </p>
        <div className="card-grid">
          {cards.map((card, idx) => (
            <Card
              key={idx}
              title={card.title}
              icon={card.icon}
              onClick={card.onClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
