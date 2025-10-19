import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import { beneficiadoService } from "../services/beneficiadoService";
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
	const [carregando, setCarregando] = useState(true);
	const [erro, setErro] = useState(null);
	const [beneficiado, setBeneficiado] = useState(null);
	
	useEffect(() => {
		const tipo = sessionStorage.getItem("tipoUsuario") || "2";
		setTipoUsuario(tipo);
		const cpf = sessionStorage.getItem("cpfSelecionado") || "463.864.234-21";
		sessionStorage.setItem("cpfSelecionado", cpf);
		
		carregarBeneficiado();
	}, []);

	const carregarBeneficiado = async () => {
		try {
			setCarregando(true);
			setErro(null);
			
			const cpfSelecionado = sessionStorage.getItem("cpfSelecionado");
			if (!cpfSelecionado) {
				setErro("CPF não encontrado na sessão");
				return;
			}
			
			const response = await beneficiadoService.buscarPorCpf(cpfSelecionado);
			
			if (response.success) {
				setBeneficiado(response.data);
				
				// Se o beneficiado tem ID, buscar filhos específicos
				if (response.data.id || response.data.idBeneficiado) {
					const beneficiadoId = response.data.id || response.data.idBeneficiado;
					
					const responseFilhos = await beneficiadoService.listarFilhosPorBeneficiado(beneficiadoId);
					
					if (responseFilhos.success && Array.isArray(responseFilhos.data)) {
						// Atualizar beneficiado com a lista de filhos
						setBeneficiado({
							...response.data,
							filhos: responseFilhos.data
						});
					}
				}
			} else {
				console.error('Erro ao carregar beneficiado:', response.error);
				setErro(response.error || "Erro ao carregar dados do beneficiado");
			}
		} catch (error) {
			console.error('Erro inesperado:', error);
			setErro("Erro inesperado ao carregar dados");
		} finally {
			setCarregando(false);
		}
	};

	const botoesNavbar = [
		{ texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
		{ texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
		...(tipoUsuario === "2" ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }] : []),
		{ texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
	];
	const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";

	function getFilhosStorage() {
		// Se temos dados do beneficiado e filhos, usar eles
		if (beneficiado && beneficiado.filhos && Array.isArray(beneficiado.filhos)) {
			return beneficiado.filhos.map((filho, index) => {
				// Converter data se vier como array [ano, mes, dia]
				let dataNascimento = "";
				if (Array.isArray(filho.dataNascimento)) {
					const [ano, mes, dia] = filho.dataNascimento;
					dataNascimento = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
				} else if (filho.dataNascimento) {
					dataNascimento = filho.dataNascimento;
				}
				
				return {
					id: filho.idFilhoBeneficiado || filho.id || filho.idFilho,
					label: filho.nome || `Filho ${index + 1}`,
					nascimento: dataNascimento,
					creche: filho.hasCreche ? "Sim" : "Não",
					estuda: filho.isEstudante ? "Sim" : "Não"
				};
			});
		}

		// Se não há filhos, retornar array vazio
		return [];
	}

	const [filhos, setFilhos] = useState([]);
	const [filhosOriginais, setFilhosOriginais] = useState([]);

	// Atualizar filhos quando beneficiado for carregado
	useEffect(() => {
		if (beneficiado) {
			const dadosFilhos = getFilhosStorage();
			setFilhos(dadosFilhos);
			setFilhosOriginais(dadosFilhos);
		}
	}, [beneficiado]);

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
				
				{carregando && (
					<div style={{ textAlign: 'center', padding: '20px' }}>
						<p>Carregando filhos do beneficiado...</p>
					</div>
				)}
				
				{erro && (
					<div style={{ textAlign: 'center', padding: '20px', color: '#e74c3c' }}>
						<p>{erro}</p>
						<button onClick={carregarBeneficiado} style={{ marginTop: '10px', padding: '8px 16px' }}>
							Tentar Novamente
						</button>
					</div>
				)}
				
				{!carregando && !erro && (
					<>
						{filhos.length === 0 && (
							<div style={{ textAlign: 'center', padding: '20px' }}>
								<p>Este beneficiado não possui filhos cadastrados.</p>
							</div>
						)}
						
						{filhos.length > 0 && (
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
						)
					}
				
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
					</>
				)}
			</div>
		</div>
	);
}
