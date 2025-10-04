import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import { beneficiadoService } from "../services/beneficiadoService";
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
			
			console.log('Carregando endereço para CPF:', cpfSelecionado);
			const response = await beneficiadoService.buscarPorCpf(cpfSelecionado);
			
			if (response.success) {
				console.log('Dados do beneficiado:', response.data);
				setBeneficiado(response.data);
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

	

	function getEnderecoStorage() {
		// Se temos dados do beneficiado, usar eles
		if (beneficiado) {
			return {
				rua: beneficiado.logradouro || "",
				numero: beneficiado.numero || "",
				complemento: beneficiado.complemento || "",
				bairro: beneficiado.bairro || "",
				cidade: beneficiado.cidade || "",
				estado: beneficiado.estado || "",
				cep: beneficiado.cep || "",
				dataEntrada: beneficiado.dataEntrada || "-",
				dataSaida: beneficiado.dataSaida || "-",
				moradia: beneficiado.tipoMoradia || "",
				tipoMoradia: beneficiado.tipoMoradia || "",
				tipoCesta: beneficiado.tipoCesta || "",
				status: beneficiado.status || "",
				criancas: beneficiado.qtdCriancas || "0",
				jovens: beneficiado.qtdJovens || "0",
				adolescentes: beneficiado.qtdAdolescentes || "0",
				idosos: beneficiado.qtdIdosos || "0",
				gestantes: beneficiado.qtdGestantes || "0",
				deficientes: beneficiado.qtdDeficientes || "0",
				outros: beneficiado.qtdOutros || "0",
				tipoCestaAtual: beneficiado.tipoCestaAtual || "",
				tempoCestaAtual: beneficiado.tempoCestaAtual || "",
				tempoCestaRestante: beneficiado.tempoCestaRestante || "",
				tempoASA: beneficiado.tempoASA || ""
			};
		}

		// Fallback para dados locais salvos
		const salvo = localStorage.getItem('enderecoBeneficiado');
		if (salvo) {
			try {
				return JSON.parse(salvo);
			} catch {}
		}

		// Dados padrão enquanto carrega
		return {
			rua: "",
			numero: "",
			complemento: "",
			bairro: "",
			cidade: "",
			estado: "",
			cep: "",
			dataEntrada: "-",
			dataSaida: "-",
			moradia: "",
			tipoMoradia: "",
			tipoCesta: "",
			status: "",
			criancas: "0",
			jovens: "0",
			adolescentes: "0",
			idosos: "0",
			gestantes: "0",
			deficientes: "0",
			outros: "0",
			tipoCestaAtual: "",
			tempoCestaAtual: "",
			tempoCestaRestante: "",
			tempoASA: ""
		};
	}

	const [endereco, setEndereco] = useState({});
	const [enderecoOriginal, setEnderecoOriginal] = useState({});

	// Atualizar endereco quando beneficiado for carregado
	useEffect(() => {
		if (beneficiado) {
			const dadosEndereco = getEnderecoStorage();
			setEndereco(dadosEndereco);
			setEnderecoOriginal(dadosEndereco);
		}
	}, [beneficiado]);

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
				
				{carregando && (
					<div style={{ textAlign: 'center', padding: '20px' }}>
						<p>Carregando endereço do beneficiado...</p>
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
				
				{!carregando && !erro && beneficiado && (
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
					</div>
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
					</form>
				)}
			</div>
		</div>
	);
}
