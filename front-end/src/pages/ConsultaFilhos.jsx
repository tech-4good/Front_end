import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { beneficiadoService } from "../services/beneficiadoService";
import "../styles/ConsultaFilhos.css";
import iconeVoltar from "../assets/icone-voltar.png";

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
		{ texto: "Início", onClick: () => navigate("/home") },
		{ texto: "Perfil", onClick: () => navigate("/perfil") },

		{ texto: "Sair", onClick: () => navigate("/") }
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

	async function handleConfirmarSim() {
		setModalConfirmar(false);
		setCarregando(true);
		
		try {
			// Atualizar cada filho que foi modificado
			const promessas = filhos.map(async (filho, index) => {
				const filhoOriginal = filhosOriginais[index];
				
				// Verificar se houve mudança
				if (filhoOriginal && (
					filho.creche !== filhoOriginal.creche || 
					filho.estuda !== filhoOriginal.estuda
				)) {
					console.log("🔄 Atualizando filho ID:", filho.id);
					
					const dadosAtualizacao = {
						isEstudante: filho.estuda === "Sim",
						hasCreche: filho.creche === "Sim"
					};
					
					const response = await beneficiadoService.atualizarFilho(filho.id, dadosAtualizacao);
					
					if (!response.success) {
						console.error("❌ Erro ao atualizar filho:", response.error);
						throw new Error(response.error);
					}
					
					console.log("✅ Filho atualizado com sucesso!");
					return response;
				}
			});
			
			await Promise.all(promessas);
			
			setFilhosOriginais(filhos);
			setAlteracaoConfirmada(true);
			setTimeout(() => setAlteracaoConfirmada(false), 2000);
		} catch (error) {
			console.error("❌ Erro ao atualizar filhos:", error);
			setErro("Erro ao atualizar informações dos filhos");
		} finally {
			setCarregando(false);
		}
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
	 const [modalErroExclusao, setModalErroExclusao] = useState(false);
	 
	 async function handleExcluirFilho(filhoId) {
		 if (!filhoId) {
			 console.error("❌ ID do filho não encontrado");
			 setModalErroExclusao(true);
			 setTimeout(() => setModalErroExclusao(false), 3000);
			 return;
		 }
		 
		 setCarregando(true);
		 try {
			 console.log("🗑️ Removendo filho ID:", filhoId);
			 const response = await beneficiadoService.removerFilho(filhoId);
			 
			 if (response.success) {
				 console.log("✅ Filho removido com sucesso!");
				 // Atualizar lista local
				 setFilhos(prev => prev.filter(f => f.id !== filhoId));
				 setModalExcluidoSucesso(true);
				 setTimeout(() => setModalExcluidoSucesso(false), 2000);
			 } else {
				 console.error("❌ Erro ao remover filho:", response.error);
				 setModalErroExclusao(true);
				 setTimeout(() => setModalErroExclusao(false), 3000);
			 }
		 } catch (error) {
			 console.error("❌ Erro inesperado ao remover filho:", error);
			 setModalErroExclusao(true);
			 setTimeout(() => setModalErroExclusao(false), 3000);
		 } finally {
			 setCarregando(false);
		 }
	 }

	return (
		<div>
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isConsultaBeneficiadosPage={true} />
			<div className="consulta-filhos-container">
				<img 
					src={iconeVoltar} 
					alt="Voltar" 
					className="consulta-filhos-icone-voltar"
					onClick={() => navigate("/consulta-beneficiados-menu")}
				/>
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
							<div style={{ textAlign: 'center', padding: '20px', color: '#264040', fontSize: '18px' }}>
								<p>Este beneficiado não possui filhos cadastrados.</p>
							</div>
						)}
						
						{filhos.length > 0 && (
							<div className="consulta-filhos-form">
								<div className="consulta-filhos-grid">
									{filhos.map((filho, idx) => (
										<div key={idx} className="consulta-filhos-card-item">
											<h3 className="consulta-filhos-card-title">{filho.label}</h3>
											<div className="consulta-filhos-card-content">
												<div className="consulta-filhos-field">
													<label className="consulta-filhos-field-label">Data de Nascimento:</label>
													<input 
														className="consulta-filhos-input"
														name="nascimento" 
														value={filho.nascimento} 
														readOnly
														disabled
														style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
														title="A data de nascimento não pode ser alterada"
													/>
												</div>
												<div className="consulta-filhos-field">
													<label className="consulta-filhos-field-label">Usa creche?</label>
													<select 
														className="consulta-filhos-input"
														name="creche" 
														value={filho.creche} 
														onChange={e => handleChange(idx, e)}
													>
														<option value="Não">Não</option>
														<option value="Sim">Sim</option>
													</select>
												</div>
												<div className="consulta-filhos-field">
													<label className="consulta-filhos-field-label">Estuda?</label>
													<select 
														className="consulta-filhos-input"
														name="estuda" 
														value={filho.estuda} 
														onChange={e => handleChange(idx, e)}
													>
														<option value="Não">Não</option>
														<option value="Sim">Sim</option>
													</select>
												</div>
											</div>
										</div>
									))}
								</div>
								
								<div className="consulta-filhos-botoes">
									<button type="button" className="consulta-filhos-botao" onClick={handleAlterarClick}>
										Alterar Informações
									</button>
									<button type="button" className="consulta-filhos-botao" onClick={handleCadastrarOutroFilho}>
										Cadastrar outro Filho
									</button>
									<button type="button" className="consulta-filhos-botao" onClick={() => setModalEscolherFilho(true)}>
										Excluir Filho
									</button>
								</div>
							</div>
						)}
				
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
								texto: "Sim",
								onClick: async () => {
									setModalConfirmarExclusao(false);
									await handleExcluirFilho(filhoParaExcluirDados?.id);
									setFilhoParaExcluir(null);
									setFilhoParaExcluirDados(null);
								},
								style: { background: '#fff', color: '#111', border: '2px solid #111' }
							}, {
								texto: "Não",
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
						
						{/* Modal de erro ao excluir filho */}
						<Modal
							isOpen={modalErroExclusao}
							onClose={() => setModalErroExclusao(false)}
							texto={"Erro ao excluir filho. Tente novamente."}
							showClose={false}
						/>

						{/* Modal de confirmação de alteração */}
						<Modal
							isOpen={modalConfirmar}
							onClose={handleConfirmarNao}
							texto={"Tem certeza que deseja alterar as informações?"}
							showClose={false}
							botoes={[{
								texto: "Sim",
								onClick: handleConfirmarSim
							}, {
								texto: "Não",
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
