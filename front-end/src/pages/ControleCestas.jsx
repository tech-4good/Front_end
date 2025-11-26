import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Botao from "../components/Botao";
import Radio from "../components/Radio";
import { cestaService } from "../services/cestaService";
import "../styles/ControleCestas.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import iconeVoltar from "../assets/icone-voltar.png";

export default function ControleCestas() {
  const navigate = useNavigate();
  const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";
  const tipoUsuario = sessionStorage.getItem("tipoUsuario") || "2";

  const botoesNavbar = [
    { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
    { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
    { texto: "Cestas", onClick: () => navigate("/cestas") },
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
  
  // Sistema de modal unificado com timeout
  const [modalGeral, setModalGeral] = useState({ open: false, mensagem: "" });
  const [modalTimeout, setModalTimeout] = useState(null);
  
  const mostrarModal = (mensagem) => {
    setModalGeral({ open: true, mensagem });
    if (modalTimeout) clearTimeout(modalTimeout);
    const timeout = setTimeout(() => setModalGeral({ open: false, mensagem: "" }), 3000);
    setModalTimeout(timeout);
  };

  // Função para permitir apenas números (máximo 3 dígitos)
  const handleQuantidadeChange = (e) => {
    const value = e.target.value;
    // Remove qualquer caractere que não seja dígito e limita a 3 caracteres
    const onlyNumbers = value.replace(/\D/g, '').slice(0, 3);
    setQuantidadeInput(onlyNumbers);
  };

  // Carregar cestas do backend sempre que a página for montada
  useEffect(() => {
    console.log("🔄 ControleCestas carregado - buscando dados atualizados");
    carregarCestas();
  }, []);

  // Atualizar quando a página ganha foco (usuário volta de outra página)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("👀 Página voltou ao foco - atualizando estoque");
        carregarCestas();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  async function carregarCestas() {
    try {
      setCarregando(true);
      console.log("📦 Buscando dados atualizados do estoque...");
      
      const response = await cestaService.listarCestas();
      
      if (response.success && response.data) {
        let totalKits = 0;
        let totalBasicas = 0;
        
        console.log("📊 Dados do estoque recebidos:", response.data);
        
        response.data.forEach(cesta => {
          if (cesta.tipo === "KIT") {
            totalKits += cesta.quantidadeCestas || 0;
          } else if (cesta.tipo === "BASICA") {
            totalBasicas += cesta.quantidadeCestas || 0;
          }
        });
        
        console.log(`✅ Estoque atualizado - Kits: ${totalKits}, Básicas: ${totalBasicas}, Total: ${totalKits + totalBasicas}`);
        
        setQuantidadeKits(totalKits);
        setQuantidadeCestaBasica(totalBasicas);
        setQuantidadeTotal(totalKits + totalBasicas);
      } else {
        console.warn("⚠️ Erro ao carregar cestas ou nenhuma cesta encontrada");
      }
    } catch (error) {
      console.error("❌ Erro ao carregar cestas:", error);
      mostrarModal("Erro ao carregar dados do estoque.");
    } finally {
      setCarregando(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    if (!quantidadeInput || quantidadeInput <= 0) {
      mostrarModal("Por favor, insira uma quantidade válida.");
      return;
    }

    setModalConfirmacao(true);
  }

  async function confirmarAdicao() {
    try {
      const quantidade = parseInt(quantidadeInput);
      const tipoFinal = tipoCesta === "kit" ? "KIT" : "BASICA";
      
      // Estrutura correta conforme backend - data como array [ano, mês, dia]
      const hoje = new Date();
      const dataArray = [
        hoje.getFullYear(),
        hoje.getMonth() + 1, // Mês é 0-indexed, então soma 1
        hoje.getDate()
      ];
      
      const dadosCesta = {
        tipo: tipoFinal,
        pesoKg: tipoFinal === "KIT" ? 2.5 : 15.0,
        dataEntradaEstoque: dataArray,
        quantidadeCestas: quantidade
      };

      console.log("📦 Cadastrando nova cesta:", dadosCesta);
      
      const response = await cestaService.cadastrarCesta(dadosCesta);
      
      if (response.success) {
        // Recarregar dados do backend
        await carregarCestas();
        
        setModalConfirmacao(false);
        mostrarModal(`${quantidade} ${tipoCesta === "kit" ? "Kits" : "Cestas Básicas"} adicionados com sucesso!`);
        setQuantidadeInput("");
      } else {
        console.error("Erro ao cadastrar cesta:", response.error);
        setModalConfirmacao(false);
        mostrarModal(response.error || "Erro ao cadastrar cesta.");
      }
    } catch (error) {
      console.error("Erro ao cadastrar cesta:", error);
      setModalConfirmacao(false);
      mostrarModal("Erro de conexão. Tente novamente.");
    }
  }



  return (
    <div className="controle-cestas-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isCestasPage={true} />
      <div className="controle-cestas-container">
        <img 
          src={iconeVoltar} 
          alt="Voltar" 
          className="controle-cestas-icone-voltar"
          onClick={() => navigate("/home")}
        />
        
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
            <div className="controle-cestas-input-container">
              <label className="controle-cestas-input-label">Insira a quantidade de novas cestas:</label>
              <Input
                placeholder="0"
                value={quantidadeInput}
                onChange={handleQuantidadeChange}
                type="text"
                min="1"
                maxLength="3"
                className="controle-cestas-input"
              />
            </div>
            <Botao texto="Adicionar" type="submit" />
          </div>
        </form>

        {/* Modal de confirmação (mantém botões) */}
        <Modal
          isOpen={modalConfirmacao}
          onClose={() => setModalConfirmacao(false)}
          texto={`Tem certeza que quer adicionar ${quantidadeInput} ${tipoCesta === "kit" ? "Kits" : "Cestas Básicas"}?`}
          botoes={[
            {
              texto: "Sim", 
              onClick: confirmarAdicao
            },
            {
              texto: "Não",
              onClick: () => setModalConfirmacao(false)
            }
          ]}
          showClose={false}
        />

        {/* Modal geral unificado - sem X e com timeout */}
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 2000 }}>
          <Modal
            isOpen={modalGeral.open}
            onClose={() => setModalGeral({ open: false, mensagem: "" })}
            texto={modalGeral.mensagem}
            showClose={false}
          />
        </div>
      </div>
    </div>
  );
}