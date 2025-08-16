import React from "react";
import "../styles/Botao.css";

const Botao = ({ texto, onClick, children, ...props }) => {
	return (
		<button className="botao-personalizado" onClick={onClick} {...props}>
			{children}
			{texto}
		</button>
	);
};

export default Botao;
