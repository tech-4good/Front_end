
import React from "react";
import "../styles/Modal.css";
import Botao from "./Botao";
import { X } from "lucide-react";

const Modal = ({
	isOpen,
	onClose,
	texto,
	children,
	showClose = true,
	botoes = []
}) => {
	if (!isOpen) return null;

	return (
		<div className="modal-overlay">
			<div className="modal-content">
				{showClose && (
					<button className="modal-close" onClick={onClose} aria-label="Fechar">
						<X size={36} />
					</button>
				)}
				<div className="modal-texto">{texto}</div>
				{children}
				{botoes.length > 0 && (
					<div className="modal-botoes">
						{botoes.map((btn, idx) => (
							<Botao key={idx} {...btn} />
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Modal;
