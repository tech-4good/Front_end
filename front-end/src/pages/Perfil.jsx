
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Perfil.css";
import Voltar from "../components/Voltar";
import Navbar from "../components/Navbar";
import iconeOlhoAberto from "../assets/icone-olho-aberto.png";
import iconeOlhoFechado from "../assets/icone-olho-fechado.png";

export default function Perfil() {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [form, setForm] = useState({
		nome: "Aline Farias",
		telefone: "(11) 95679-0489",
		email: "aliner@hotmail.com",
		senha: "123456789",
		cpf: "486.957.083-74",
	});

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleTogglePassword = () => {
		setShowPassword((prev) => !prev);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		alert("Informações alteradas!");
	};

	       
	       const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";
	       return (
		       <div>
			       <Navbar nomeUsuario={nomeUsuario} />
			       <div className="perfil-container">
				       <Voltar onClick={() => navigate("/home")} />
				       <h1 className="perfil-title">Perfil</h1>
				       <form className="perfil-form" onSubmit={handleSubmit}>
					<div className="perfil-row">
						<div className="perfil-field">
							<label>Nome Completo:</label>
							<input
								type="text"
								name="nome"
								value={form.nome}
								onChange={handleChange}
								disabled
							/>
						</div>
						<div className="perfil-field">
							<label>Telefone:</label>
							<input
								type="text"
								name="telefone"
								value={form.telefone}
								onChange={handleChange}
								disabled
							/>
						</div>
					</div>
					<div className="perfil-row">
						<div className="perfil-field">
							<label>E-mail:</label>
							<input
								type="email"
								name="email"
								value={form.email}
								onChange={handleChange}
								disabled
							/>
						</div>
						<div className="perfil-field perfil-senha-field">
							<label>Senha:</label>
							<div className="perfil-senha-wrapper">
								<input
									type={showPassword ? "text" : "password"}
									name="senha"
									value={form.senha}
									onChange={handleChange}
									disabled
								/>
								<button
									type="button"
									className="perfil-senha-toggle"
									onClick={handleTogglePassword}
									tabIndex={-1}
								>
									<img
										src={showPassword ? iconeOlhoAberto : iconeOlhoFechado}
										alt={showPassword ? "Ocultar senha" : "Mostrar senha"}
									/>
								</button>
							</div>
						</div>
					</div>
					<div className="perfil-row">
						<div className="perfil-field">
							<label>CPF:</label>
							<input
								type="text"
								name="cpf"
								value={form.cpf}
								onChange={handleChange}
								disabled
							/>
						</div>
					</div>
					<button className="perfil-btn" type="submit" disabled>
						Alterar Informações
					</button>
				</form>
			</div>
		</div>
	);
}
