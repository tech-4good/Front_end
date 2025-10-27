
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import { entregaService } from "../services/entregaService";
import "../styles/Home.css";
import "../styles/HistoricoDoacoes.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

// Função auxiliar para formatar data de array [ano, mes, dia] para DD/MM/YYYY
const formatarData = (dataArray) => {
	if (!dataArray || !Array.isArray(dataArray)) return "Data inválida";
	const [ano, mes, dia] = dataArray;
	return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
};

// Função para converter data DD/MM/YYYY para objeto Date para ordenação
const dataParaTimestamp = (dataString) => {
	const [dia, mes, ano] = dataString.split('/');
	return new Date(ano, mes - 1, dia).getTime();
};

export default function HistoricoDoacoes() {
	const navigate = useNavigate();
	const [tipoUsuario, setTipoUsuario] = useState("2");
	const [ordem, setOrdem] = useState('desc');
	const [entregas, setEntregas] = useState([]);
	const [carregando, setCarregando] = useState(true);
	const [erro, setErro] = useState(null);
	const [paginaAtual, setPaginaAtual] = useState(1);
	const itensPorPagina = 5;

	useEffect(() => {
		const tipo = sessionStorage.getItem("tipoUsuario") || "2";
		setTipoUsuario(tipo);
		carregarEntregas();
	}, []);

	const carregarEntregas = async () => {
		setCarregando(true);
		setErro(null);
		
		try {
			const result = await entregaService.listarEntregas();
			
			if (result.success) {
				console.log("✅ Entregas carregadas:", result.data);
				
				// Backend retorna objeto paginado: { content: [], totalPages, totalElements, ... }
				const dadosEntregas = result.data?.content || result.data || [];
				
				console.log("📦 Array de entregas extraído:", dadosEntregas);
				
				// Processar entregas
				const entregasProcessadas = dadosEntregas.map(entrega => ({
					id: entrega.id,
					cpf: entrega.beneficiado?.cpf || "CPF não disponível",
					nome: entrega.beneficiado?.nome || "Nome não disponível",
					tipo: entrega.cesta?.tipo || "Tipo não especificado",
					data: formatarData(entrega.dataRetirada),
					dataOriginal: entrega.dataRetirada // Para ordenação
				}));
				
				console.log("✅ Entregas processadas:", entregasProcessadas);
				setEntregas(entregasProcessadas);
			} else {
				setErro(result.error || "Erro ao carregar histórico");
				console.error("❌ Erro ao carregar entregas:", result.error);
			}
		} catch (error) {
			console.error("❌ Erro ao carregar entregas:", error);
			setErro("Erro ao carregar histórico de atendimentos");
		} finally {
			setCarregando(false);
		}
	};

	// Aplicar ordenação
	const entregasOrdenadas = [...entregas].sort((a, b) => {
		const timestampA = dataParaTimestamp(a.data);
		const timestampB = dataParaTimestamp(b.data);
		return ordem === 'desc' ? timestampB - timestampA : timestampA - timestampB;
	});

	// Resetar página quando mudar a ordem
	useEffect(() => {
		setPaginaAtual(1);
	}, [ordem]);

	// Cálculos da paginação
	const totalPaginas = Math.ceil(entregasOrdenadas.length / itensPorPagina);
	const indiceInicio = (paginaAtual - 1) * itensPorPagina;
	const indiceFim = indiceInicio + itensPorPagina;
	const entregasPaginadas = entregasOrdenadas.slice(indiceInicio, indiceFim);

	const irParaPagina = (pagina) => {
		if (pagina >= 1 && pagina <= totalPaginas) {
			setPaginaAtual(pagina);
		}
	};

	const botoesNavbar = [
		{ texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
		{ texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
		...(tipoUsuario === "2" ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }] : []),
		{ texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
	];

	const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";
	return (
		<div className="historico-doacoes-bg">
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
			<div className="historico-doacoes-container">
				<div className="historico-doacoes-voltar">
					<Voltar onClick={() => navigate('/home')}/>
				</div>
				<div className="historico-doacoes-filtro">
					<label className="historico-doacoes-filtro-label">Filtrar por data:</label>
					<select className="historico-doacoes-filtro-select" value={ordem} onChange={e => setOrdem(e.target.value)}>
						<option value="desc">Mais recente</option>
						<option value="asc">Mais antigo</option>
					</select>
				</div>
				<h1 className="historico-doacoes-title">Histórico de Atendimentos</h1>
				<div className="historico-doacoes-lista">
					{carregando ? (
						<p className="historico-doacoes-nao-encontrado">Carregando histórico...</p>
					) : erro ? (
						<p className="historico-doacoes-nao-encontrado" style={{ color: '#e74c3c' }}>
							{erro}
						</p>
					) : entregasPaginadas.length > 0 ? (
						entregasPaginadas.map((entrega) => (
							<div className="historico-doacoes-card" key={entrega.id}>
								<div
									className="historico-doacoes-nome"
									style={{ cursor: 'pointer', textDecoration: 'underline' }}
									onClick={() => {
										sessionStorage.setItem('cpfSelecionado', entrega.cpf);
										navigate('/consulta-beneficiados-menu', { state: { cpf: entrega.cpf } });
									}}
								>
									{entrega.nome}
								</div>
								<span className="historico-doacoes-tipo-badge">{entrega.tipo}</span>
								<span className="historico-doacoes-data">{entrega.data}</span>
							</div>
						))
					) : (
						<p className="historico-doacoes-nao-encontrado">Nenhum atendimento encontrado.</p>
					)}
				</div>
				
				{/* Controles de Paginação */}
				{totalPaginas > 1 && (
					<div className="historico-doacoes-paginacao">
						<button 
							className="historico-doacoes-btn-pagina"
							onClick={() => irParaPagina(paginaAtual - 1)}
							disabled={paginaAtual === 1}
						>
							‹
						</button>
						
						<div className="historico-doacoes-info-pagina">
							<span className="historico-doacoes-pagina-atual">{paginaAtual}</span>
							<span className="historico-doacoes-pontos">• • •</span>
							<span className="historico-doacoes-total-paginas">{totalPaginas}</span>
						</div>
						
						<button 
							className="historico-doacoes-btn-pagina"
							onClick={() => irParaPagina(paginaAtual + 1)}
							disabled={paginaAtual === totalPaginas}
						>
							›
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
