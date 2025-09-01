import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import Input from "../components/Input";
import Botao from "../components/Botao";
import Radio from "../components/Radio";
import "../styles/ControleCestas.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

export default function ControleCestas() {
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

  const [quantidadeCestaBasica, setQuantidadeCestaBasica] = useState(10);
  const [quantidadeKits, setQuantidadeKits] = useState(35);
  const [quantidadeTotal, setQuantidadeTotal] = useState(45);

  const [quantidadeInput, setQuantidadeInput] = useState("");
  const [tipoCesta, setTipoCesta] = useState("kit");

  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [modalSucesso, setModalSucesso] = useState({ open: false, tipo: "", quantidade: 0 });
  const [modalErro, setModalErro] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    
    if (!quantidadeInput || quantidadeInput <= 0) {
      setModalErro(true);
      return;
    }

    setModalConfirmacao(true);
  }

  function confirmarAdicao() {
    const quantidade = parseInt(quantidadeInput);
    
    if (tipoCesta === "kit") {
      setQuantidadeKits(prev => prev + quantidade);
      setQuantidadeTotal(prev => prev + quantidade);
    } else {
      setQuantidadeCestaBasica(prev => prev + quantidade);
      setQuantidadeTotal(prev => prev + quantidade);
    }

    setModalConfirmacao(false);
    setModalSucesso({ 
      open: true, 
      tipo: tipoCesta === "kit" ? "Kits" : "Cestas Básicas",
      quantidade: quantidade 
    });
    setQuantidadeInput("");
  }

  function fecharModalSucesso() {
    setModalSucesso({ open: false, tipo: "", quantidade: 0 });
  }

  return (
    <div className="controle-cestas-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
      <div className="controle-cestas-container">
        <div className="controle-cestas-voltar">
          <Voltar onClick={() => navigate("/home")} />
        </div>
        
        <h1 className="controle-cestas-title">Cestas</h1>
        
        <div className="controle-cestas-cards">
          <div className="controle-cestas-card">
            <h3 className="controle-cestas-card-titulo">Quantidade de<br/>Cestas Básicas</h3>
            <div className="controle-cestas-card-numero">{quantidadeCestaBasica}</div>
          </div>
          
          <div className="controle-cestas-card">
            <h3 className="controle-cestas-card-titulo">Quantidade<br/>Total de Cestas</h3>
            <div className="controle-cestas-card-numero">{quantidadeTotal}</div>
          </div>
          
          <div className="controle-cestas-card">
            <h3 className="controle-cestas-card-titulo">Quantidade de<br/>Kits</h3>
            <div className="controle-cestas-card-numero">{quantidadeKits}</div>
          </div>
        </div>

        <form className="controle-cestas-form" onSubmit={handleSubmit}>
          <div className="controle-cestas-radio-row">
            <span className="controle-cestas-radio-label">Tipo:</span>
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

          <div className="controle-cestas-input-row">
            <Input
              placeholder="Insira a quantidade de novas cestas"
              value={quantidadeInput}
              onChange={(e) => setQuantidadeInput(e.target.value)}
              type="number"
              min="1"
              className="controle-cestas-input"
            />
            <Botao texto="Adicionar" type="submit" />
          </div>
        </form>

        {modalSucesso.open && (
          <div className="controle-cestas-sucesso-modal">
            <span className="controle-cestas-sucesso-texto">
              {modalSucesso.quantidade} {modalSucesso.tipo} adicionados com sucesso!
            </span>
            <button 
              className="controle-cestas-sucesso-fechar"
              onClick={fecharModalSucesso}
            >
              ×
            </button>
          </div>
        )}

        <Modal
          isOpen={modalConfirmacao}
          onClose={() => setModalConfirmacao(false)}
          texto={`Tem certeza que quer adicionar ${quantidadeInput} ${tipoCesta === "kit" ? "Kits" : "Cestas Básicas"}?`}
          botoes={[
            {
              texto: "NÃO",
              onClick: () => setModalConfirmacao(false)
            },
            {
              texto: "SIM", 
              onClick: confirmarAdicao
            }
          ]}
          showClose={false}
        />

        <Modal
          isOpen={modalErro}
          onClose={() => setModalErro(false)}
          texto="Por favor, insira uma quantidade válida."
          showClose={true}
        />
      </div>
    </div>
  );
}