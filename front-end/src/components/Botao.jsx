import React from "react";
import "../styles/Botao.css";

const Botao = ({ texto, onClick, ...props }) => {
	return (
		<button className="botao-personalizado" onClick={onClick} {...props}>
			{texto}
		</button>
	);
};

export default Botao;
