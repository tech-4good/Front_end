import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import "../styles/Home.css"; 
import "../styles/ConsultaFilhos.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

export default function ConsultaFilhos() {
	// Mascara para data: 00/00/0000
	const formatDate = (value) => {
		let v = value.replace(/\D/g, "");
		v = v.slice(0, 8);
		v = v.replace(/(\d{2})(\d)/, "$1/$2");
		v = v.replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
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

	function getFilhosStorage() {
		return [
			{ label: "Filho 1", nascimento: "20/01/2000", creche: "Não", estuda: "Sim" },
			{ label: "Filho 2", nascimento: "12/03/2004", creche: "Não", estuda: "Sim" },
			{ label: "Filho 3", nascimento: "31/10/2005", creche: "Não", estuda: "Sim" }
		];
	}

	const [filhos, setFilhos] = useState(getFilhosStorage());
	const [filhosOriginais, setFilhosOriginais] = useState(getFilhosStorage());

	const [modalConfirmar, setModalConfirmar] = useState(false);
	const [alteracaoConfirmada, setAlteracaoConfirmada] = useState(false);

	function handleChange(idx, e) {
		const { name, value } = e.target;
		let newValue = value;
		if (name === "nascimento") {
			newValue = formatDate(value);
		}
		setFilhos(prev => prev.map((f, i) => i === idx ? { ...f, [name]: newValue } : f));
	}

	function handleAlterarClick() {
		setModalConfirmar(true);
	}

	function handleConfirmarSim() {
		setFilhosOriginais(filhos);
		setAlteracaoConfirmada(true);
		setModalConfirmar(false);
		setTimeout(() => setAlteracaoConfirmada(false), 2000);
	}

	function handleConfirmarNao() {
		setModalConfirmar(false);
		setFilhos(getFilhosStorage());
		window.location.reload();
	}


	 function handleCadastrarOutroFilho() {
		 navigate('/cadastro-filhos');
	 }


	 const [modalEscolherFilho, setModalEscolherFilho] = useState(false);
	 const [filhoParaExcluir, setFilhoParaExcluir] = useState(null);
	 const [filhoParaExcluirDados, setFilhoParaExcluirDados] = useState(null);
	 const [modalConfirmarExclusao, setModalConfirmarExclusao] = useState(false);
	 const [modalExcluidoSucesso, setModalExcluidoSucesso] = useState(false);
	 // Não precisa mais de snapshot, basta usar o índice da lista atual
	 function handleExcluirFilho(idx) {
		 setFilhos(prev => prev.filter((_, i) => i !== idx));
		 setModalExcluidoSucesso(true);
		 setTimeout(() => setModalExcluidoSucesso(false), 2000);
	 }

	return (
		<div className="consulta-filhos-bg">
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
			<div className="consulta-filhos-container">
				<div className="consulta-filhos-voltar">
					<Voltar onClick={() => navigate("/consulta-beneficiados-menu")} />
				</div>
				<h1 className="consulta-filhos-title">Filhos</h1>
				<form className="consulta-filhos-form">
					<div className="consulta-filhos-lista">
						 {filhos.map((filho, idx) => (
							 <div className="consulta-filhos-card" key={idx}>
								 <div className="consulta-filhos-label">{filho.label}</div>
								 <label>Data de Nascimento:</label>
								 <input name="nascimento" value={filho.nascimento} onChange={e => handleChange(idx, e)} />
								 <label>Usa creche?</label>
								 <input name="creche" value={filho.creche} onChange={e => handleChange(idx, e)} />
								 <label>Estuda?</label>
								 <input name="estuda" value={filho.estuda} onChange={e => handleChange(idx, e)} />
							 </div>
						 ))}
					</div>
					<div className="consulta-filhos-botoes">
						<button type="button" className="consulta-filhos-botao" onClick={handleAlterarClick}>Alterar Informações</button>
						<button type="button" className="consulta-filhos-botao" onClick={handleCadastrarOutroFilho}>Cadastrar outro Filho</button>
						 <button type="button" className="consulta-filhos-botao" onClick={() => setModalEscolherFilho(true)}>Excluir Filho</button>
					</div>
				</form>
				 {/* Modal para escolher qual filho excluir */}
				 <Modal
					 isOpen={modalEscolherFilho}
					 onClose={() => setModalEscolherFilho(false)}
					 texto={"Selecione o filho que deseja excluir:"}
					 showClose={true}
					 botoes={filhos.map((f, i) => ({
						 texto: f.label,
						 onClick: () => {
							 setFilhoParaExcluir(i);
							 setFilhoParaExcluirDados(f);
							 setModalEscolherFilho(false);
							 setModalConfirmarExclusao(true);
						 }
					 }))}
				 />

				 {/* Modal de confirmação de exclusão do filho */}
				 <Modal
					isOpen={modalConfirmarExclusao}
					onClose={() => setModalConfirmarExclusao(false)}
					 texto={`Deseja realmente excluir ${filhoParaExcluirDados ? filhoParaExcluirDados.label : ''}?`}
					showClose={false}
					 botoes={[{
						 texto: "SIM",
						 onClick: () => {
							 setFilhos(prev => {
								 const idxAtual = prev.findIndex(f =>
									 f.nascimento === filhoParaExcluirDados.nascimento &&
									 f.creche === filhoParaExcluirDados.creche &&
									 f.estuda === filhoParaExcluirDados.estuda
								 );
								 if (idxAtual !== -1) {
									 return prev.filter((_, i) => i !== idxAtual);
								 }
								 return prev;
							 });
							 setModalConfirmarExclusao(false);
							 setFilhoParaExcluir(null);
							 setFilhoParaExcluirDados(null);
							 setModalExcluidoSucesso(true);
							 setTimeout(() => setModalExcluidoSucesso(false), 2000);
						 },
						 style: { background: '#fff', color: '#111', border: '2px solid #111' }
					 }, {
						 texto: "NÃO",
						 onClick: () => {
							 setModalConfirmarExclusao(false);
							 setFilhoParaExcluir(null);
							 setFilhoParaExcluirDados(null);
						 },
						 style: { background: '#111', color: '#fff', border: '2px solid #111' }
					 }]}
				 />

				 {/* Modal de sucesso ao excluir filho */}
				 <Modal
					 isOpen={modalExcluidoSucesso}
					 onClose={() => setModalExcluidoSucesso(false)}
					 texto={"Filho excluído com sucesso!"}
					 showClose={false}
				 />

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
			</div>
		</div>
	);
}
