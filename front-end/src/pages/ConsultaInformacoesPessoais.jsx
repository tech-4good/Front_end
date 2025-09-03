import React, { useEffect, useState } from "react";
import foto3x4 from "../assets/foto3x4.png";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import Modal from "../components/Modal";
import "../styles/Home.css"; 
import "../styles/ConsultaInformacoesPessoais.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

export default function ConsultaInformacoesPessoais() {
	const navigate = useNavigate();
	const [tipoUsuario, setTipoUsuario] = useState("2");

	useEffect(() => {
		const tipo = sessionStorage.getItem("tipoUsuario") || "2";
		setTipoUsuario(tipo);
	}, []);

	const botoesNavbar = [
		{ texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
		{ texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
		...(tipoUsuario === "2" ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }] : []),
		{ texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
	];

	const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";


	const [dadosOriginais, setDadosOriginais] = useState({
		nome: "Bruna Reginato",
		cpf: "463.864.234-21",
		rg: "435678732",
		nascimento: "20/04/2000",
		telefone: "(11) 9345-67435",
		escolaridade: "Ensino Médio Completo",
		profissao: "Auxiliar de Limpeza",
		empresa: "SPTECH",
		dependentes: 2,
		estadoCivil: "Solteiro",
		religiao: "Evangélico",
		renda: "R$ 600,00",
		cargo: "Júnior",
		foto: null
	});
	const [dados, setDados] = useState(dadosOriginais);

	function handleChange(e) {
		const { name, value } = e.target;
		setDados(prev => ({ ...prev, [name]: value }));
	}

	const auxilios = ["Bolsa Família", "Auxílio Emergencial", "Auxílio Gás"];

	const [modalConfirmar, setModalConfirmar] = useState(false);
	const [alteracaoConfirmada, setAlteracaoConfirmada] = useState(false);


	function handleAlterarClick() {
		setModalConfirmar(true);
	}

	function handleConfirmarSim() {
		setDadosOriginais(dados);
		setAlteracaoConfirmada(true);
		setModalConfirmar(false);
		setTimeout(() => setAlteracaoConfirmada(false), 2000);
	}

	function handleConfirmarNao() {
		setModalConfirmar(false);
		window.location.reload();
	}

	return (
		<div className="consulta-info-bg">
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
			<div className="consulta-info-container">
				<div className="consulta-info-voltar">
					<Voltar onClick={() => navigate("/consulta-beneficiados-menu")} />
				</div>
				<h1 className="consulta-info-title">Informações Pessoais</h1>
				<div className="consulta-info-form">
					<div className="consulta-info-col">
						<label>Nome Completo:</label>
						<input name="nome" value={dados.nome} onChange={handleChange} />
						<label>RG:</label>
						<input name="rg" value={dados.rg} onChange={handleChange} />
						<label>Telefone:</label>
						<input name="telefone" value={dados.telefone} onChange={handleChange} />
						<label>Escolaridade:</label>
						<input name="escolaridade" value={dados.escolaridade} onChange={handleChange} />
						<label>Profissão:</label>
						<input name="profissao" value={dados.profissao} onChange={handleChange} />
						<label>Empresa:</label>
						<input name="empresa" value={dados.empresa} onChange={handleChange} />
						<label>Quantidade de Dependentes:</label>
						<input name="dependentes" value={dados.dependentes} onChange={handleChange} />
					</div>
					<div className="consulta-info-col">
						<label>CPF:</label>
						<input name="cpf" value={dados.cpf} onChange={handleChange} />
						<label>Data de Nascimento:</label>
						<input name="nascimento" value={dados.nascimento} onChange={handleChange} />
						<label>Estado Civil:</label>
						<input name="estadoCivil" value={dados.estadoCivil} onChange={handleChange} />
						<label>Religião:</label>
						<input name="religiao" value={dados.religiao} onChange={handleChange} />
						<label>Renda Mensal:</label>
						<input name="renda" value={dados.renda} onChange={handleChange} />
						<label>Cargo:</label>
						<input name="cargo" value={dados.cargo} onChange={handleChange} />
						<label>Foto do Beneficiado:</label>
						<div className="consulta-info-foto">
							<img src={foto3x4} alt="Foto do Beneficiado" style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: "10px" }} />
						</div>
					</div>
				</div>
				<hr className="consulta-info-divisor" />
				<h2 className="consulta-info-subtitle">Auxílios Governamentais</h2>
				<div className="consulta-info-auxilios">
					{auxilios.map((a, i) => (
						<input key={i} value={a} readOnly className="consulta-info-auxilio" />
					))}
				</div>
								<div className="consulta-info-botoes">
									<button className="consulta-info-botao" onClick={handleAlterarClick}>Alterar Informações</button>
									<button className="consulta-info-botao">Cadastrar outro Auxílio</button>
									<button className="consulta-info-botao">Excluir Beneficiado</button>
									<button className="consulta-info-botao">Excluir Auxílio</button>
								</div>
								{/* Modal de confirmação */}
								<Modal
									isOpen={modalConfirmar}
									onClose={handleConfirmarNao}
									texto={"Tem certeza que deseja alterar as informações?"}
									showClose={false}
									botoes={[{
										texto: "SIM",
										onClick: handleConfirmarSim
									}, {
										texto: "NÃO",
										onClick: handleConfirmarNao
									}]}
								/>
								{/* Modal de feedback de alteração confirmada */}
								<Modal
									isOpen={alteracaoConfirmada}
									onClose={() => setAlteracaoConfirmada(false)}
									texto={"Informações alteradas com sucesso!"}
									showClose={false}
								/>
						</div>
					</div>
				);
			}
