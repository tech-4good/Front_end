// Casos de uso para testes dos beneficiados fake:
// CPF: 22233344455 | Nome: Bruna Reginato | Pode retirar apenas CESTA BÁSICA, ainda não retirou este mês
// CPF: 48763842135 | Nome: Juliana Gomes Oliveira | Pode retirar apenas KIT
// CPF: 12345678901 | Nome: Carlos Silva | Pode retirar apenas CESTA BÁSICA, já retirou este mês (ultimaRetirada: 2025-08-10)
// CPF: 98765432100 | Nome: Maria Souza | Pode retirar apenas KIT
// CPF: 45678912300 | Nome: Ana Paula Lima | Pode retirar apenas CESTA BÁSICA, já retirou este mês (ultimaRetirada: 2025-08-15)
// CPF: 11122233344 | Nome: João Pedro Santos | Pode retirar apenas KIT
// CPF: 33344455566 | Nome: Lucas Almeida | Pode retirar apenas KIT, já retirou há menos de 15 dias (ultimaRetirada: 2025-08-20)

import React, { useState } from "react";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import Input from "../components/Input";
import Botao from "../components/Botao";
import Radio from "../components/Radio";
import "../styles/DoarCesta.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

// Dados fake para busca de CPF
const beneficiadosFake = [
  { cpf: "33344455566", nome: "Lucas Almeida", tipoPermitido: "kit", ultimaRetirada: "2025-08-20" },
  { cpf: "22233344455", nome: "Bruna Reginato", tipoPermitido: "basica" },
  { cpf: "48763842135", nome: "Juliana Gomes Oliveira", tipoPermitido: "kit" },
  { cpf: "12345678901", nome: "Carlos Silva", tipoPermitido: "basica", ultimaRetirada: "2025-08-10" },
  { cpf: "98765432100", nome: "Maria Souza", tipoPermitido: "kit" },
  { cpf: "45678912300", nome: "Ana Paula Lima", tipoPermitido: "basica", ultimaRetirada: "2025-08-15" },
  { cpf: "11122233344", nome: "João Pedro Santos", tipoPermitido: "kit" },
];

export default function DoarCesta() {
  const navigate = useNavigate();
  const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";
  const tipoUsuario = sessionStorage.getItem("tipoUsuario") || "2";

  const botoesNavbar = [
    { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
    { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
    ...(tipoUsuario === "2"
      ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }]
      : []),
    { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair },
  ];

  const [cpf, setCpf] = useState("");
  const [tipoCesta, setTipoCesta] = useState("");
  const [resultados, setResultados] = useState([]);
  const [modalNaoEncontrado, setModalNaoEncontrado] = useState(false);
  const [modalErro, setModalErro] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalRestricao, setModalRestricao] = useState({ open: false, tipo: "" });
  const [modalLimiteMes, setModalLimiteMes] = useState({ open: false, data: null });
  const [modalLimiteKit, setModalLimiteKit] = useState({ open: false, data: null });

  function handleCpfChange(e) {
    const valor = e.target.value.replace(/\D/g, "");
    setCpf(valor);
    if (valor.length > 0) {
      const encontrados = beneficiadosFake.filter(v => v.cpf.includes(valor));
      setResultados(encontrados);
    } else {
      setResultados([]);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!cpf || !tipoCesta) {
      setModalErro(true);
      return;
    }
    const beneficiado = beneficiadosFake.find(v => v.cpf === cpf);
    if (!beneficiado) {
      setModalNaoEncontrado(true);
      return;
    }
    if (beneficiado.tipoPermitido !== tipoCesta) {
      setModalRestricao({ open: true, tipo: beneficiado.tipoPermitido });
      return;
    }
    if (tipoCesta === "basica" && beneficiado.ultimaRetirada) {
      const hoje = new Date();
      const ultima = new Date(beneficiado.ultimaRetirada);
      if (
        hoje.getFullYear() === ultima.getFullYear() &&
        hoje.getMonth() === ultima.getMonth()
      ) {
        const proxima = new Date(ultima);
        proxima.setMonth(proxima.getMonth() + 1);
        setModalLimiteMes({ open: true, data: proxima });
        return;
      }
    }
    if (tipoCesta === "kit" && beneficiado.ultimaRetirada) {
      const hoje = new Date();
      const ultima = new Date(beneficiado.ultimaRetirada);
      const diffMs = hoje - ultima;
      const diffDias = diffMs / (1000 * 60 * 60 * 24);
      if (diffDias < 15) {
        const proxima = new Date(ultima);
        proxima.setDate(proxima.getDate() + 15);
        setModalLimiteKit({ open: true, data: proxima });
        return;
      }
    }
    setModalSucesso(true);
  }

  return (
    <div className="doar-cesta-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
      <div className="doar-cesta-container">
        <div className="doar-cesta-voltar">
          <Voltar onClick={() => navigate("/home")} />
        </div>
        <h1 className="doar-cesta-title">Entregar Cesta</h1>
  <form className="doar-cesta-form" autoComplete="off" onSubmit={handleSubmit}>
          <Input
            placeholder="Insira o CPF"
            value={cpf}
            onChange={handleCpfChange}
            className="doar-cesta-input"
            maxLength={11}
          />
          {cpf && cpf.length < 11 && resultados.length > 0 && (
            <div className="doar-cesta-resultados">
              {resultados.map((v, idx) => (
                <div
                  className="doar-cesta-resultado"
                  key={idx}
                  style={{ cursor: "pointer" }}
                  onClick={() => setCpf(v.cpf)}
                >
                  {v.nome}
                </div>
              ))}
            </div>
          )}
          <div className="doar-cesta-radio-row">
            <span className="doar-cesta-radio-label">Tipo:</span>
            <Radio
              name="tipoCesta"
              options={[
                { label: "Kit", value: "kit" },
                { label: "Cesta Básica", value: "basica" },
              ]}
              value={tipoCesta}
              onChange={e => setTipoCesta(e.target.value)}
            />
          </div>
          <div className="doar-cesta-btn-row">
            <Botao texto="Doar" type="submit" />
          </div>
          <Modal
            isOpen={modalLimiteKit.open}
            onClose={() => setModalLimiteKit({ open: false, data: null })}
            texto={<>
              Este beneficiado ou alguém da família já retirou o kit nos últimos 15 dias.<br/>
              Próxima retirada permitida a partir de: {modalLimiteKit.data && modalLimiteKit.data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </>}
            showClose={true}
          />
          <Modal
            isOpen={modalLimiteMes.open}
            onClose={() => setModalLimiteMes({ open: false, data: null })}
            texto={<>
              Este beneficiado ou alguém da família já retirou a cesta básica este mês.<br/>
              Próxima retirada permitida a partir de: {modalLimiteMes.data && modalLimiteMes.data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </>}
            showClose={true}
          />
          <Modal
            isOpen={modalRestricao.open}
            onClose={() => setModalRestricao({ open: false, tipo: "" })}
            texto={modalRestricao.tipo === "kit"
              ? "Este beneficiado só pode retirar o Kit."
              : modalRestricao.tipo === "basica"
                ? "Este beneficiado só pode retirar a Cesta Básica."
                : "Tipo de retirada não permitido."}
            showClose={true}
          />
          <Modal
            isOpen={modalSucesso}
            onClose={() => { setModalSucesso(false); window.location.reload(); }}
            texto={"Cesta doada com sucesso!"}
            showClose={true}
          />
          <Modal
            isOpen={modalErro}
            onClose={() => setModalErro(false)}
            texto={"Todas as informações devem ser preenchidas."}
            showClose={true}
          />
          <Modal
            isOpen={modalNaoEncontrado}
            onClose={() => setModalNaoEncontrado(false)}
            texto={<>
              CPF não cadastrado.<br/>
              <span style={{textDecoration: 'underline', color: '#0077cc', cursor: 'pointer'}} onClick={() => { setModalNaoEncontrado(false); navigate('/cadastro-beneficiado-menu'); }}>
                Clique aqui para cadastrar beneficiado
              </span>
            </>}
            showClose={true}
          />
        </form>
      </div>
    </div>
  );
}
