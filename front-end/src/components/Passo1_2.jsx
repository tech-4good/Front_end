import "../styles/Passo1_2.css";        
import { useNavigate } from "react-router-dom";
import React from "react";

const Passo1_2 = ({ texto = "Passo 1/2", onClick, style }) => {
	return (
		<button style={style} className="passo1_2-btn" onClick={onClick} type="button"> 
			<span className="passo1_2-texto">{texto}</span>
		</button>
	);
};

export default Passo1_2;