
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import { entregaService } from "../services/entregaService";
import "../styles/HistoricoDoacoes.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import iconeVoltar from "../assets/icone-voltar.png";

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
	const [entregas, setEntregas] = useState([]);
	const [entregasOriginais, setEntregasOriginais] = useState([]); // Para manter dados originais
	const [filtroAtivo, setFiltroAtivo] = useState('todos');
	const [carregando, setCarregando] = useState(true);
	const [erro, setErro] = useState(null);
	const [modalPeriodo, setModalPeriodo] = useState(false);
	const [dataInicio, setDataInicio] = useState('');
	const [dataFim, setDataFim] = useState('');
	const [paginaAtual, setPaginaAtual] = useState(1);
	const itensPorPagina = 5;

	useEffect(() => {
		const tipo = sessionStorage.getItem("tipoUsuario") || "2";
		setTipoUsuario(tipo);
		carregarEntregas();
	}, []);

	// Aplicar filtros quando filtroAtivo ou entregasOriginais mudarem
	useEffect(() => {
		aplicarFiltro();
	}, [filtroAtivo, entregasOriginais]);

	const carregarEntregas = async () => {
		setCarregando(true);
		setErro(null);
		
		try {
			console.log("📥 Buscando TODAS as entregas para histórico...");
			const result = await entregaService.buscarTodasEntregas();
			
			if (result.success) {
				console.log("✅ Entregas carregadas:", result.data.length, "entregas");
				
				// Agora result.data já é o array completo de entregas
				const dadosEntregas = result.data || [];
				
				console.log("📦 Array de entregas extraído:", dadosEntregas.length, "itens");
				
				// Processar entregas
				const entregasProcessadas = dadosEntregas.map(entrega => ({
					id: entrega.id,
					cpf: entrega.beneficiado?.cpf || "CPF não disponível",
					nome: entrega.beneficiado?.nome || "Nome não disponível",
					tipo: entrega.cesta?.tipo || "Tipo não especificado",
					data: formatarData(entrega.dataRetirada),
					dataOriginal: entrega.dataRetirada // Para ordenação
				}));
				
				console.log("✅ Entregas processadas:", entregasProcessadas.length, "entregas");
				setEntregasOriginais(entregasProcessadas);
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

	const aplicarFiltro = () => {
		if (entregasOriginais.length === 0) return;

		let dadosFiltrados = [...entregasOriginais];

		// Filtrar por tipo
		if (filtroAtivo === 'kit') {
			dadosFiltrados = dadosFiltrados.filter(e => {
				const tipo = (e.tipo || '').toLowerCase();
				return tipo.includes('kit');
			});
		} else if (filtroAtivo === 'cesta') {
			dadosFiltrados = dadosFiltrados.filter(e => {
				const tipo = (e.tipo || '').toLowerCase();
				return tipo.includes('cesta') || tipo.includes('basica');
			});
		}

		// Filtrar por período customizado
		if (filtroAtivo === 'periodo-customizado' && dataInicio && dataFim) {
			const timestampInicio = new Date(dataInicio).getTime();
			const timestampFim = new Date(dataFim).getTime();
			
			dadosFiltrados = dadosFiltrados.filter(e => {
				const timestamp = getTimestamp(e);
				return timestamp >= timestampInicio && timestamp <= timestampFim;
			});
		}

		// Ordenar por data
		if (filtroAtivo === 'mais-novo' || filtroAtivo === 'todos') {
			dadosFiltrados.sort((a, b) => {
				const timestampA = getTimestamp(a);
				const timestampB = getTimestamp(b);
				return timestampB - timestampA; // Mais novo primeiro
			});
		} else if (filtroAtivo === 'mais-antigo') {
			dadosFiltrados.sort((a, b) => {
				const timestampA = getTimestamp(a);
				const timestampB = getTimestamp(b);
				return timestampA - timestampB; // Mais antigo primeiro
			});
		} else if (filtroAtivo === 'periodo-customizado') {
			dadosFiltrados.sort((a, b) => {
				const timestampA = getTimestamp(a);
				const timestampB = getTimestamp(b);
				return timestampB - timestampA; // Mais novo primeiro por padrão
			});
		}

		setEntregas(dadosFiltrados);
	};

	const handleFiltroChange = (e) => {
		const novoFiltro = e.target.value;
		if (novoFiltro === 'periodo-customizado') {
			setModalPeriodo(true);
		} else {
			setFiltroAtivo(novoFiltro);
		}
	};

	const aplicarPeriodoCustomizado = () => {
		if (dataInicio && dataFim) {
			setFiltroAtivo('periodo-customizado');
			setModalPeriodo(false);
		}
	};

	const getTimestamp = (entrega) => {
		if (entrega.dataOriginal && Array.isArray(entrega.dataOriginal)) {
			return new Date(entrega.dataOriginal[0], entrega.dataOriginal[1] - 1, entrega.dataOriginal[2]).getTime();
		}
		return dataParaTimestamp(entrega.data);
	};

	const formatarTipo = (tipo) => {
		if (!tipo) return 'N/A';
		const tipoLower = tipo.toLowerCase();
		if (tipoLower.includes('kit')) return 'Kit';
		if (tipoLower.includes('cesta') || tipoLower.includes('basica')) return 'Cesta Básica';
		return tipo;
	};

	// Aplicar paginação nos dados filtrados
	const entregasOrdenadas = entregas;

	// Resetar página quando mudar o filtro
	useEffect(() => {
		setPaginaAtual(1);
	}, [filtroAtivo]);

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

	// Gerar páginas visíveis para navegação
	const gerarPaginasVisiveis = () => {
		const paginas = [];
		const maxPaginasVisiveis = 5;
		
		// A página atual sempre fica na primeira posição e mostra as próximas 4
		let inicio = paginaAtual;
		let fim = Math.min(totalPaginas, inicio + maxPaginasVisiveis - 1);
		
		// Se não temos páginas suficientes à direita, ajustar para trás
		if (fim - inicio < maxPaginasVisiveis - 1 && inicio > 1) {
			inicio = Math.max(1, fim - maxPaginasVisiveis + 1);
		}
		
		for (let i = inicio; i <= fim; i++) {
			paginas.push(i);
		}
		
		return paginas;
	};

	const botoesNavbar = [
		{ texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
		{ texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
		...(tipoUsuario === "2" ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }] : []),
		{ texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
	];

	const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";
	return (
		<div>
			<Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isHistoricoCestasPage={true} />
			<div className="historico-doacoes-container">
				<img 
					src={iconeVoltar} 
					alt="Voltar" 
					className="historico-doacoes-icone-voltar"
					onClick={() => navigate('/home')}
				/>
				
			<div className="historico-doacoes-filtro">
				<label className="historico-doacoes-filtro-label">Filtrar por:</label>
				<select 
					className="historico-doacoes-filtro-select" 
					value={filtroAtivo} 
					onChange={handleFiltroChange}
				>
					<option value="todos">Todos</option>
					<option value="kit">Kit</option>
					<option value="cesta">Cesta Básica</option>
					<option value="mais-novo">Mais novo primeiro</option>
					<option value="mais-antigo">Mais antigo primeiro</option>
					<option value="periodo-customizado">Período Customizado</option>
				</select>
			</div>			<div className="historico-doacoes-title-container">
				<h1 className="historico-doacoes-title">
					Clique no nome do beneficiado para ver suas informações!
				</h1>
			</div>				<div className="historico-doacoes-lista">
					{carregando ? (
						<div className="historico-doacoes-loading">Carregando histórico...</div>
					) : erro ? (
						<div className="historico-doacoes-erro">{erro}</div>
					) : entregasPaginadas.length > 0 ? (
						entregasPaginadas.map((entrega) => (
							<div className="historico-doacoes-card" key={entrega.id}>
								<div
									className="historico-doacoes-nome"
									onClick={() => {
										sessionStorage.setItem('cpfSelecionado', entrega.cpf);
										navigate('/consulta-beneficiados-menu', { state: { cpf: entrega.cpf } });
									}}
								>
									{entrega.nome}
								</div>
								<div className="historico-doacoes-tipo-badge">{formatarTipo(entrega.tipo)}</div>
								<div className="historico-doacoes-data">{entrega.data}</div>
							</div>
						))
					) : (
						<div className="historico-doacoes-nao-encontrado">Nenhum atendimento encontrado.</div>
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
						
						{/* Páginas clicáveis */}
						{gerarPaginasVisiveis().map(numeroPagina => (
							<button
								key={numeroPagina}
								className={`historico-doacoes-numero-pagina ${
									numeroPagina === paginaAtual ? 'ativo' : ''
								}`}
								onClick={() => irParaPagina(numeroPagina)}
							>
								{numeroPagina}
							</button>
						))}
						
						{/* Mostrar ... e última página se necessário */}
						{gerarPaginasVisiveis()[gerarPaginasVisiveis().length - 1] < totalPaginas && (
							<>
								<span className="historico-doacoes-pontos">...</span>
								<button
									className="historico-doacoes-numero-pagina"
									onClick={() => irParaPagina(totalPaginas)}
								>
									{totalPaginas}
								</button>
							</>
						)}
						
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
			
			{/* Modal para período customizado */}
			<Modal
				isOpen={modalPeriodo}
				onClose={() => {
					setModalPeriodo(false);
					setDataInicio('');
					setDataFim('');
				}}
				texto={
					<div style={{ textAlign: 'left' }}>
						<h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Selecione o Período</h3>
						<div style={{ marginBottom: '15px' }}>
							<label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Data Início:</label>
							<input
								type="date"
								value={dataInicio}
								onChange={(e) => setDataInicio(e.target.value)}
								style={{
									width: '100%',
									padding: '10px',
									border: '2px solid #ddd',
									borderRadius: '6px',
									fontSize: '16px'
								}}
							/>
						</div>
						<div style={{ marginBottom: '20px' }}>
							<label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Data Fim:</label>
							<input
								type="date"
								value={dataFim}
								onChange={(e) => setDataFim(e.target.value)}
								style={{
									width: '100%',
									padding: '10px',
									border: '2px solid #ddd',
									borderRadius: '6px',
									fontSize: '16px'
								}}
							/>
						</div>
				</div>
				}
				showClose={false}
				botoes={[
					{
						texto: "Cancelar",
						onClick: () => {
							setModalPeriodo(false);
							setDataInicio('');
							setDataFim('');
						}
					},
					{
						texto: "Aplicar",
						onClick: aplicarPeriodoCustomizado
					}
				]}
			/>
		</div>
	);
}