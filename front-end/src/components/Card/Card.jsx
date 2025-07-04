import React from "react";
import Button from "../Button/Button";
import "./Card.css";

const Card = ({ title, icon, onClick }) => {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="card-icon">{icon}</div>
      <Button onClick={onClick}>Acessar</Button>
    </div>
  );
};

export default Card;
