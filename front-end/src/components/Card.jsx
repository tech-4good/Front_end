import React from "react";
import "../styles/Card.css";
import Botao from "./Botao";

const Card = ({ titulo, icone, textoBotao, onClickBotao }) => {
	return (
		<div className="card-personalizado">
			<h2 className="card-titulo">{titulo}</h2>
			<div className="card-icone">{icone}</div>
			<Botao texto={textoBotao} onClick={onClickBotao} />
		</div>
	);
};

export default Card;
