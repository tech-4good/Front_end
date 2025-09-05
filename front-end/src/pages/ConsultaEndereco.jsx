import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import "../styles/Home.css"; 
import "../styles/ConsultaEndereco.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

export default function ConsultaEndereco() {
	const formatCEP = (value) => {
		let v = value.replace(/\D/g, "");
		v = v.slice(0, 8);
		if (v.length > 5) {
			v = v.replace(/(\d{5})(\d{1,3})/, "$1-$2");
		}
		return v;
	};

	const formatDate = (value) => {
		let v = value.replace(/\D/g, "");
		v = v.slice(0, 8);
		v = v.replace(/(\d{2})(\d)/, "$1/$2");
		v = v.replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
		return v;
	};

	const onlyNumbers = (value, maxLength = null) => {
		let v = value.replace(/\D/g, "");
		if (maxLength) v = v.slice(0, maxLength);
		return v;
	};
	const navigate = useNavigate();
	const [tipoUsuario, setTipoUsuario] = useState("2");
	
	useEffect(() => {
		const tipo = sessionStorage.getItem("tipoUsuario") || "2";
		setTipoUsuario(tipo);
		
		const cpf = sessionStorage.getItem("cpfSelecionado") || "463.864.234-21";
		sessionStorage.setItem("cpfSelecionado", cpf);
	}, []);

	const botoesNavbar = [
		{ texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
		{ texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
		...(tipoUsuario === "2" ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }] : []),
		{ texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
	];
	const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";

	

	function getEnderecoStorage() {
		const salvo = localStorage.getItem('enderecoBeneficiado');
		if (salvo) {
			try {
				return JSON.parse(salvo);
			} catch {}
		}
		return {
			rua: "Rua Osvaldo Cruz",
			numero: "36",
			complemento: "A",
			bairro: "Japão Liberdade",
			cidade: "São Paulo",
			estado: "São Paulo",
			cep: "06432-345",
			dataEntrada: "20/02/2005",
			dataSaida: "-",
			moradia: "Alugada",
			tipoMoradia: "Apartamento",
			tipoCesta: "Kit",
			status: "Disponível",
			criancas: "1",
			jovens: "1",
			adolescentes: "2",
			idosos: "1",
			gestantes: "0",
			deficientes: "0",
			outros: "2",
			tipoCestaAtual: "Cesta Básica",
			tempoCestaAtual: "2 meses",
			tempoCestaRestante: "4 meses",
			tempoASA: "2 anos e 3 meses"
		};
	}

	const [endereco, setEndereco] = useState(getEnderecoStorage());
	const [enderecoOriginal, setEnderecoOriginal] = useState(getEnderecoStorage());

	const [modalConfirmar, setModalConfirmar] = useState(false);
	const [alteracaoConfirmada, setAlteracaoConfirmada] = useState(false);
	const [modalExcluirEndereco, setModalExcluirEndereco] = useState(false);
	const [modalExcluidoSucesso, setModalExcluidoSucesso] = useState(false);

	function handleChange(e) {
		const { name, value } = e.target;
		let newValue = value;
		if (name === "cep") {
			newValue = formatCEP(value);
		} else if (name === "dataEntrada" || name === "dataSaida") {
			newValue = formatDate(value);
		} else if (["numero", "criancas", "jovens", "adolescentes", "idosos", "gestantes", "deficientes", "outros"].includes(name)) {
			newValue = onlyNumbers(value, 3);
		}
		setEndereco(prev => ({ ...prev, [name]: newValue }));
	}

	function handleAlterarClick() {
		setModalConfirmar(true);
	}

	function handleConfirmarSim() {
		setEnderecoOriginal(endereco);
		localStorage.setItem('enderecoBeneficiado', JSON.stringify(endereco));
		setAlteracaoConfirmada(true);
		setModalConfirmar(false);
		setTimeout(() => setAlteracaoConfirmada(false), 2000);
	}

	function handleConfirmarNao() {
		setModalConfirmar(false);
		setEndereco(getEnderecoStorage());
		window.location.reload();
	}

	return (
		<div className="consulta-endereco-bg">
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
			<div className="consulta-endereco-container">
				<div className="consulta-endereco-voltar">
					<Voltar onClick={() => navigate("/consulta-beneficiados-menu")} />
				</div>
				<h1 className="consulta-endereco-title">Endereço</h1>
				<form className="consulta-endereco-form">
					<div className="consulta-endereco-row">
						<div className="consulta-endereco-col">
							<label>Rua/Avenida:</label>
							<input name="rua" value={endereco.rua} onChange={handleChange} />
							<label>Complemento:</label>
							<input name="complemento" value={endereco.complemento} onChange={handleChange} />
							<label>Cidade:</label>
							<input name="cidade" value={endereco.cidade} onChange={handleChange} />
							<label>CEP:</label>
							<input name="cep" value={endereco.cep} onChange={handleChange} />
						</div>
						<div className="consulta-endereco-col">
							<label>Número:</label>
							<input name="numero" value={endereco.numero} onChange={handleChange} />
							<label>Bairro:</label>
							<input name="bairro" value={endereco.bairro} onChange={handleChange} />
							<label>Estado:</label>
							<input name="estado" value={endereco.estado} onChange={handleChange} />
						</div>
					</div>
					<hr className="consulta-endereco-divisor" />
					<div className="consulta-endereco-row">
						<div className="consulta-endereco-col">
							<label>Data de Entrada:</label>
							<input name="dataEntrada" value={endereco.dataEntrada} onChange={handleChange} type="text" />
							<label>Moradia:</label>
							<input name="moradia" value={endereco.moradia} onChange={handleChange} />
							<label>Tipo de Cesta:</label>
							<input name="tipoCesta" value={endereco.tipoCesta} onChange={handleChange} />
						</div>
						<div className="consulta-endereco-col">
							<label>Data de Saída:</label>
							<input name="dataSaida" value={endereco.dataSaida} onChange={handleChange} type="text" />
							<label>Tipo de Moradia:</label>
							<input name="tipoMoradia" value={endereco.tipoMoradia} onChange={handleChange} />
							<label>Status:</label>
							<input name="status" value={endereco.status} onChange={handleChange} />
						</div>
					</div>
					<hr className="consulta-endereco-divisor" />
					<div className="consulta-endereco-row">
						<div className="consulta-endereco-col">
							<label>Quantidade de Crianças:</label>
							<input name="criancas" value={endereco.criancas} onChange={handleChange} />
							<label>Quantidade de Adolescentes:</label>
							<input name="adolescentes" value={endereco.adolescentes} onChange={handleChange} />
							<label>Quantidade de Gestantes:</label>
							<input name="gestantes" value={endereco.gestantes} onChange={handleChange} />
							<label>Quantidade de Outros:</label>
							<input name="outros" value={endereco.outros} onChange={handleChange} />
						</div>
						<div className="consulta-endereco-col">
							<label>Quantidade de Jovens:</label>
							<input name="jovens" value={endereco.jovens} onChange={handleChange} />
							<label>Quantidade de Idosos:</label>
							<input name="idosos" value={endereco.idosos} onChange={handleChange} />
							<label>Quantidade de Deficientes:</label>
							<input name="deficientes" value={endereco.deficientes} onChange={handleChange} />
						</div>
					</div>
					<hr className="consulta-endereco-divisor" />
					<div className="consulta-endereco-row">
						<div className="consulta-endereco-col">
							<label>Tipo de Cesta Atual:</label>
							<input name="tipoCestaAtual" value={endereco.tipoCestaAtual} onChange={handleChange} />
							<label>Tempo na Cesta Restante Atual:</label>
							<input name="tempoCestaRestante" value={endereco.tempoCestaRestante} onChange={handleChange} />
						</div>
						<div className="consulta-endereco-col">
							<label>Tempo na Cesta Atual:</label>
							<input name="tempoCestaAtual" value={endereco.tempoCestaAtual} onChange={handleChange} />
							<label>Tempo na Cadastrado na ASA:</label>
							<input name="tempoASA" value={endereco.tempoASA} onChange={handleChange} />
						</div>
					</div>
					<div className="consulta-endereco-botoes">
						<button type="button" className="consulta-endereco-botao" onClick={handleAlterarClick}>Alterar Informações</button>
			{/* Modal de confirmação de alteração */}
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
						<button type="button" className="consulta-endereco-botao" onClick={() => setModalExcluirEndereco(true)}>Excluir Endereço</button>
			{/* Modal de confirmação de exclusão de endereço */}
			<Modal
				isOpen={modalExcluirEndereco}
				onClose={() => setModalExcluirEndereco(false)}
				texto={"Tem certeza que deseja excluir o endereço?"}
				showClose={false}
				botoes={[{
					texto: "SIM",
					onClick: () => {
						setModalExcluirEndereco(false);
						setModalExcluidoSucesso(true);
						setTimeout(() => {
							setModalExcluidoSucesso(false);
							navigate('/consulta-beneficiados-menu');
						}, 2000);
					},
					style: { background: '#fff', color: '#111', border: '2px solid #111' }
				}, {
					texto: "NÃO",
					onClick: () => setModalExcluirEndereco(false),
					style: { background: '#111', color: '#fff', border: '2px solid #111' }
				}]}
			/>
			{/* Modal de sucesso ao excluir endereço */}
			<Modal
				isOpen={modalExcluidoSucesso}
				onClose={() => {
					setModalExcluidoSucesso(false);
					navigate('/consulta-beneficiados-menu');
				}}
				texto={"Endereço excluído com sucesso!"}
				showClose={false}
			/>
					</div>
				</form>
			</div>
		</div>
	);
}
