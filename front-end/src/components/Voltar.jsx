
import React from "react";
import "../styles/Voltar.css";
import { ArrowLeft } from "lucide-react";

const Voltar = ({ texto = "Voltar", onClick, style }) => {
	return (
		<button style={style} className="voltar-btn" onClick={onClick} type="button"> 
			<ArrowLeft className="voltar-icone" />
			<span className="voltar-texto">{texto}</span>
		</button>
	);
};

export default Voltar;
//teste n vai afetar os outros