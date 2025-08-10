
import React from "react";
import "../styles/Voltar.css";
import { ArrowLeft } from "lucide-react";

const Voltar = ({ texto = "Voltar", onClick }) => {
	return (
		<button className="voltar-btn" onClick={onClick} type="button">
			<ArrowLeft className="voltar-icone" />
			<span className="voltar-texto">{texto}</span>
		</button>
	);
};

export default Voltar;
