import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import Input from "../components/Input";
import Botao from "../components/Botao";
import Radio from "../components/Radio";
import { cestaService } from "../services/cestaService";
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

  const [quantidadeCestaBasica, setQuantidadeCestaBasica] = useState(0);
  const [quantidadeKits, setQuantidadeKits] = useState(0);
  const [quantidadeTotal, setQuantidadeTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);

  const [quantidadeInput, setQuantidadeInput] = useState("");
  const [tipoCesta, setTipoCesta] = useState("kit");

  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [modalSucesso, setModalSucesso] = useState({ open: false, tipo: "", quantidade: 0 });
  const [modalErro, setModalErro] = useState({ open: false, mensagem: "" });

  // Carregar cestas do backend
  useEffect(() => {
    carregarCestas();
  }, []);

  async function carregarCestas() {
    try {
      setCarregando(true);
      const response = await cestaService.listarCestas();
      
      if (response.success && response.data) {
        let totalKits = 0;
        let totalBasicas = 0;
        
        response.data.forEach(cesta => {
          if (cesta.tipo === "KIT") {
            totalKits += cesta.quantidadeCestas || 0;
          } else if (cesta.tipo === "BASICA") {
            totalBasicas += cesta.quantidadeCestas || 0;
          }
        });
        
        setQuantidadeKits(totalKits);
        setQuantidadeCestaBasica(totalBasicas);
        setQuantidadeTotal(totalKits + totalBasicas);
      } else {
        console.warn("Erro ao carregar cestas ou nenhuma cesta encontrada");
      }
    } catch (error) {
      console.error("Erro ao carregar cestas:", error);
      setModalErro({ open: true, mensagem: "Erro ao carregar dados do estoque." });
    } finally {
      setCarregando(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    if (!quantidadeInput || quantidadeInput <= 0) {
      setModalErro({ open: true, mensagem: "Por favor, insira uma quantidade válida." });
      return;
    }

    setModalConfirmacao(true);
  }

  async function confirmarAdicao() {
    try {
      const quantidade = parseInt(quantidadeInput);
      const tipoFinal = tipoCesta === "kit" ? "KIT" : "BASICA";
      
      // Estrutura correta conforme backend
      const dadosCesta = {
        tipo: tipoFinal,
        pesoKg: tipoFinal === "KIT" ? 2.5 : 15.0,
        dataEntradaEstoque: new Date().toISOString().split('T')[0],
        quantidadeCestas: quantidade
      };

      console.log("📦 Cadastrando nova cesta:", dadosCesta);
      
      const response = await cestaService.cadastrarCesta(dadosCesta);
      
      if (response.success) {
        // Recarregar dados do backend
        await carregarCestas();
        
        setModalConfirmacao(false);
        setModalSucesso({ 
          open: true, 
          tipo: tipoCesta === "kit" ? "Kits" : "Cestas Básicas",
          quantidade: quantidade 
        });
        setQuantidadeInput("");
      } else {
        console.error("Erro ao cadastrar cesta:", response.error);
        setModalConfirmacao(false);
        setModalErro({ open: true, mensagem: response.error || "Erro ao cadastrar cesta." });
      }
    } catch (error) {
      console.error("Erro ao cadastrar cesta:", error);
      setModalConfirmacao(false);
      setModalErro({ open: true, mensagem: "Erro de conexão. Tente novamente." });
    }
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
            <div className="controle-cestas-card-numero">
              {carregando ? "..." : quantidadeCestaBasica}
            </div>
          </div>
          
          <div className="controle-cestas-card">
            <h3 className="controle-cestas-card-titulo">Quantidade<br/>Total de Cestas</h3>
            <div className="controle-cestas-card-numero">
              {carregando ? "..." : quantidadeTotal}
            </div>
          </div>
          
          <div className="controle-cestas-card">
            <h3 className="controle-cestas-card-titulo">Quantidade de<br/>Kits</h3>
            <div className="controle-cestas-card-numero">
              {carregando ? "..." : quantidadeKits}
            </div>
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
          isOpen={modalErro.open}
          onClose={() => setModalErro({ open: false, mensagem: "" })}
          texto={modalErro.mensagem}
          showClose={true}
        />
      </div>
    </div>
  );
}