
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import "../styles/Home.css";
import "../styles/HistoricoDoacoes.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

const beneficiadosFake = [
	{ cpf: "33344455566", nome: "Lucas Almeida" },
	{ cpf: "22233344455", nome: "Bruna Reginato" },
	{ cpf: "48763842135", nome: "Juliana Gomes Oliveira" },
	{ cpf: "12345678901", nome: "Carlos Silva" },
	{ cpf: "98765432100", nome: "Maria Souza" },
	{ cpf: "45678912300", nome: "Ana Paula Lima" },
	{ cpf: "11122233344", nome: "João Pedro Santos" },
];

const retiradasFake = [
	// Bruna Reginato
	{ cpf: "22233344455", tipo: "Kit", data: "09/03/2025" },
	{ cpf: "22233344455", tipo: "Kit", data: "23/02/2025" },
	{ cpf: "22233344455", tipo: "Kit", data: "15/02/2025" },
	{ cpf: "22233344455", tipo: "Kit", data: "01/02/2025" },
	{ cpf: "22233344455", tipo: "Kit", data: "29/01/2025" },
	// Lucas Almeida
	{ cpf: "33344455566", tipo: "Cesta", data: "10/03/2025" },
	{ cpf: "33344455566", tipo: "Cesta", data: "25/02/2025" },
	// Juliana Gomes Oliveira
	{ cpf: "48763842135", tipo: "Kit", data: "05/03/2025" },
	// Carlos Silva
	{ cpf: "12345678901", tipo: "Cesta", data: "12/03/2025" },
	{ cpf: "12345678901", tipo: "Cesta", data: "28/02/2025" },
	// Maria Souza
	{ cpf: "98765432100", tipo: "Kit", data: "08/03/2025" },
	// Ana Paula Lima
	{ cpf: "45678912300", tipo: "Cesta", data: "03/03/2025" },
	// João Pedro Santos
	{ cpf: "11122233344", tipo: "Kit", data: "11/03/2025" },
];


export default function HistoricoDoacoes() {
	const navigate = useNavigate();
	const [tipoUsuario, setTipoUsuario] = useState("2");
	const [ordem, setOrdem] = useState('desc');
	const [retiradasAleatorias, setRetiradasAleatorias] = useState([]);
	const [paginaAtual, setPaginaAtual] = useState(1);
	const itensPorPagina = 5;

	useEffect(() => {
		const tipo = sessionStorage.getItem("tipoUsuario") || "2";
		setTipoUsuario(tipo);

		let retiradasComBeneficiado = retiradasFake.map(r => {
			const beneficiado = beneficiadosFake.find(b => b.cpf === r.cpf);
			return {
				...r,
				nome: beneficiado ? beneficiado.nome : "Desconhecido"
			};
		});

		retiradasComBeneficiado = retiradasComBeneficiado.sort((a, b) => {
			const da = a.data.split('/').reverse().join('-');
			const db = b.data.split('/').reverse().join('-');
			return ordem === 'desc' ? db.localeCompare(da) : da.localeCompare(db);
		});
		setRetiradasAleatorias(retiradasComBeneficiado);
		setPaginaAtual(1); // Reset para página 1 quando mudar a ordem
	}, [ordem]);

	// Cálculos da paginação
	const totalPaginas = Math.ceil(retiradasAleatorias.length / itensPorPagina);
	const indiceInicio = (paginaAtual - 1) * itensPorPagina;
	const indiceFim = indiceInicio + itensPorPagina;
	const retiradasPaginadas = retiradasAleatorias.slice(indiceInicio, indiceFim);

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
					{retiradasPaginadas.length > 0 ? (
						retiradasPaginadas.map((r, idx) => (
							<div className="historico-doacoes-card" key={r.cpf + r.data + idx}>
								<div
									className="historico-doacoes-nome"
									style={{ cursor: 'pointer', textDecoration: 'underline' }}
									onClick={() => {
										sessionStorage.setItem('cpfSelecionado', r.cpf);
										navigate('/consulta-beneficiados-menu', { state: { cpf: r.cpf } });
									}}
								>
									{r.nome}
								</div>
								<span className="historico-doacoes-tipo-badge">{r.tipo}</span>
								<span className="historico-doacoes-data">{r.data}</span>
							</div>
						))
					) : (
						<p className="historico-doacoes-nao-encontrado">Nenhuma retirada encontrada.</p>
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
