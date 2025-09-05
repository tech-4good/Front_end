import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import "../styles/Home.css"; 
import "../styles/ConsultaBeneficiadosResultado.css";
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

export default function ConsultaBeneficiadosResultado() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tipoUsuario, setTipoUsuario] = useState("2");
  const [beneficiado, setBeneficiado] = useState(null);
  const [retiradas, setRetiradas] = useState([]);
  const [ordem, setOrdem] = useState('desc'); 

  useEffect(() => {
    const tipo = sessionStorage.getItem("tipoUsuario") || "2";
    setTipoUsuario(tipo);

    // Recupera o CPF do state OU do sessionStorage
    let cpf = location.state?.cpf;
    if (!cpf) {
      cpf = sessionStorage.getItem('cpfSelecionado');
    }
    if (cpf) {
      const encontrado = beneficiadosFake.find(v => v.cpf === cpf);
      setBeneficiado(encontrado);

      let retiradas = retiradasFake.filter(r => r.cpf === cpf);

      retiradas = retiradas.sort((a, b) => {
        const da = a.data.split('/').reverse().join('-');
        const db = b.data.split('/').reverse().join('-');
        return ordem === 'desc' ? db.localeCompare(da) : da.localeCompare(db);
      });
      setRetiradas(retiradas);
    } else {
      setBeneficiado(null);
      setRetiradas([]);
    }
  }, [location, ordem]);

  const botoesNavbar = [
    { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
    { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
    ...(tipoUsuario === "2" ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }] : []),
    { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair }
  ];

  const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";

  return (
    <div className="consulta-beneficiados-resultado-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
      <div className="consulta-beneficiados-resultado-container">
        <div className="consulta-beneficiados-resultado-voltar">
          <Voltar onClick={() => navigate('/consulta-beneficiados')}/>
        </div>
        <div className="consulta-beneficiados-resultado-filtro">
          <label className="consulta-beneficiados-resultado-filtro-label">Filtrar por data:</label>
          <select className="consulta-beneficiados-resultado-filtro-select" value={ordem} onChange={e => setOrdem(e.target.value)}>
            <option value="desc">Mais recente</option>
            <option value="asc">Mais antigo</option>
          </select>
        </div>
        <h1 className="consulta-beneficiados-resultado-title">Clique no nome do beneficiado para ver suas informações!</h1>
        {beneficiado ? (
          <div className="consulta-beneficiados-resultado-lista-scroll">
            {retiradas.length > 0 ? (
              retiradas.map((r, idx) => (
                <div className="consulta-beneficiados-resultado-card" key={idx}>
                    <div
                      className="consulta-beneficiados-resultado-nome"
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => {
                        sessionStorage.setItem('cpfSelecionado', beneficiado.cpf);
                        navigate('/consulta-beneficiados-menu', { state: { cpf: beneficiado.cpf } });
                      }}
                    >
                      {beneficiado.nome}
                    </div>
                  <div className="consulta-beneficiados-resultado-tipo">
                    <span className="consulta-beneficiados-resultado-tipo-badge">{r.tipo}</span>
                  </div>
                  <div className="consulta-beneficiados-resultado-data">{r.data}</div>
                </div>
              ))
            ) : (
              <p className="consulta-beneficiados-resultado-nao-encontrado">Nenhuma retirada encontrada.</p>
            )}
          </div>
        ) : (
          <p className="consulta-beneficiados-resultado-nao-encontrado">Beneficiado não encontrado.</p>
        )}
      </div>
    </div>
  );
}
