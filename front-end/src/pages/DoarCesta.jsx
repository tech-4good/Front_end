import React, { useState } from "react";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import Input from "../components/Input";
import Botao from "../components/Botao";

import iconeVoltar from "../assets/icone-voltar.png";
import { beneficiadoService } from "../services/beneficiadoService";
import { entregaService } from "../services/entregaService";
import { cestaService } from "../services/cestaService";
import "../styles/DoarCesta.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

export default function DoarCesta() {
  const navigate = useNavigate();
  const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";
  const tipoUsuario = sessionStorage.getItem("tipoUsuario") || "2";

  const botoesNavbar = [
    { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
    { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
    ...(tipoUsuario === "2"
      ? []
      : []),
    { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair },
  ];

  const [cpf, setCpf] = useState("");
  const [tipoCesta, setTipoCesta] = useState("");
  const [resultados, setResultados] = useState([]);
  const [processando, setProcessando] = useState(false);
  const [modalNaoEncontrado, setModalNaoEncontrado] = useState(false);
  const [modalErro, setModalErro] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalEstoqueVazio, setModalEstoqueVazio] = useState(false);
  const [modalRestricao, setModalRestricao] = useState({ open: false, tipo: "" });
  const [modalLimiteMes, setModalLimiteMes] = useState({ open: false, data: null });
  const [modalLimiteKit, setModalLimiteKit] = useState({ open: false, data: null });

  // Timeouts automáticos para todos os modais (5 segundos)
  React.useEffect(() => {
    if (modalNaoEncontrado) {
      const timeout = setTimeout(() => setModalNaoEncontrado(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [modalNaoEncontrado]);

  React.useEffect(() => {
    if (modalErro) {
      const timeout = setTimeout(() => setModalErro(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [modalErro]);

  React.useEffect(() => {
    if (modalSucesso) {
      const timeout = setTimeout(() => { setModalSucesso(false); window.location.reload(); }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [modalSucesso]);

  React.useEffect(() => {
    if (modalEstoqueVazio) {
      const timeout = setTimeout(() => setModalEstoqueVazio(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [modalEstoqueVazio]);

  React.useEffect(() => {
    if (modalRestricao.open) {
      const timeout = setTimeout(() => setModalRestricao({ open: false, tipo: "" }), 5000);
      return () => clearTimeout(timeout);
    }
  }, [modalRestricao.open]);

  React.useEffect(() => {
    if (modalLimiteMes.open) {
      const timeout = setTimeout(() => setModalLimiteMes({ open: false, data: null }), 5000);
      return () => clearTimeout(timeout);
    }
  }, [modalLimiteMes.open]);

  React.useEffect(() => {
    if (modalLimiteKit.open) {
      const timeout = setTimeout(() => setModalLimiteKit({ open: false, data: null }), 5000);
      return () => clearTimeout(timeout);
    }
  }, [modalLimiteKit.open]);

  function handleCpfChange(e) {
    const valor = e.target.value.replace(/\D/g, "");
    
    // Aplicar máscara CPF: 000.000.000-00
    let cpfFormatado = valor;
    if (valor.length >= 4) {
      cpfFormatado = valor.slice(0, 3) + '.' + valor.slice(3);
    }
    if (valor.length >= 7) {
      cpfFormatado = cpfFormatado.slice(0, 7) + '.' + cpfFormatado.slice(7);
    }
    if (valor.length >= 10) {
      cpfFormatado = cpfFormatado.slice(0, 11) + '-' + cpfFormatado.slice(11);
    }
    
    setCpf(cpfFormatado);
    
    // Limpar resultados se CPF estiver vazio ou completo
    if (valor.length === 0 || valor.length === 11) {
      setResultados([]);
    } else if (valor.length >= 3) {
      // Só buscar quando tiver pelo menos 3 dígitos
      buscarBeneficiados(valor);
    }
  }

  async function buscarBeneficiados(cpfParcial) {
    try {
      // Buscar todos os beneficiados e filtrar localmente
      const response = await beneficiadoService.listarBeneficiados();
      if (response.success && response.data) {
        const encontrados = response.data.filter(b => 
          b.cpf && b.cpf.replace(/\D/g, "").startsWith(cpfParcial)
        );
        setResultados(encontrados.slice(0, 5)); // Limitar a 5 resultados
      } else {
        setResultados([]);
      }
    } catch (error) {
      console.error("Erro ao buscar beneficiados:", error);
      setResultados([]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Prevenir múltiplos cliques
    if (processando) {
      console.log("⚠️ Já está processando uma entrega, aguarde...");
      return;
    }
    
    if (!cpf || !tipoCesta) {
      setModalErro(true);
      return;
    }

    setProcessando(true);
    
    try {
      // Buscar beneficiado por CPF
      const response = await beneficiadoService.buscarPorCpf(cpf);
      
      if (response.success && response.data) {
        const beneficiado = response.data;
        await processarBeneficiado(beneficiado);
      } else {
        setModalNaoEncontrado(true);
      }

    } catch (error) {
      console.error("Erro ao buscar beneficiado:", error);
      setModalErro(true);
    } finally {
      setProcessando(false);
    }
  }

  async function processarBeneficiado(beneficiado) {
    try {
      // Verificar se tem endereço
      if (!beneficiado.endereco) {
        setModalErro(true);
        return;
      }

      // Definir tipo escolhido no início da função
      const tipoEscolhido = tipoCesta === "kit" ? "KIT" : "BASICA";

      // Verificar tipo permitido pelo endereço
      const tipoPermitido = beneficiado.endereco.tipoCesta;
      if (tipoPermitido !== tipoEscolhido) {
        setModalRestricao({ 
          open: true, 
          tipo: tipoPermitido === "KIT" ? "kit" : "basica" 
        });
        return;
      }

      // Verificar histórico de entregas para validar período
      console.log("🔍 Verificando histórico de entregas para beneficiado:", beneficiado.id_beneficiado || beneficiado.id);
      const historico = await entregaService.buscarHistorico(beneficiado.id_beneficiado || beneficiado.id);
      console.log("📋 Histórico de entregas COMPLETO:", JSON.stringify(historico, null, 2));
      
      // Verificar se é um objeto paginado ou array direto
      const entregas = historico?.content || historico || [];
      console.log("📦 Entregas extraídas:", entregas);
      console.log("📦 Número de entregas:", entregas.length);
      
      if (entregas && entregas.length > 0) {
        console.log("🔍 Analisando cada entrega:");
        entregas.forEach((entrega, index) => {
          console.log(`  Entrega ${index + 1}:`, {
            id: entrega.id || entrega.idEntrega,
            tipo: entrega.tipo || entrega.cesta?.tipo,
            dataRetirada: entrega.dataRetirada || entrega.data_retirada,
            proximaRetirada: entrega.proximaRetirada || entrega.proxima_retirada
          });
        });
        
        // Encontrar TODAS as entregas do mesmo tipo
        const entregasMesmoTipo = entregas.filter(entrega => {
          const tipoEntrega = entrega.tipo || entrega.cesta?.tipo;
          const match = tipoEntrega === tipoEscolhido;
          console.log(`  Comparando: ${tipoEntrega} === ${tipoEscolhido} ? ${match}`);
          return match;
        });
        
        console.log(`📦 Total de entregas do tipo ${tipoEscolhido}:`, entregasMesmoTipo.length);
        
        // Ordenar por data (mais recente primeiro) e pegar a última
        if (entregasMesmoTipo.length > 0) {
          entregasMesmoTipo.sort((a, b) => {
            const dataA = new Date(a.dataRetirada || a.data_retirada);
            const dataB = new Date(b.dataRetirada || b.data_retirada);
            return dataB - dataA; // Ordem decrescente (mais recente primeiro)
          });
          
          const ultimaEntregaMesmoTipo = entregasMesmoTipo[0]; // Pega a mais recente
          
          const dataUltimaEntrega = new Date(ultimaEntregaMesmoTipo.dataRetirada || ultimaEntregaMesmoTipo.data_retirada);
          const hoje = new Date();
          
          // Zerar horas para comparar apenas datas
          dataUltimaEntrega.setHours(0, 0, 0, 0);
          hoje.setHours(0, 0, 0, 0);
          
          const diasDecorridos = Math.floor((hoje - dataUltimaEntrega) / (1000 * 60 * 60 * 24));
          
          console.log(`📅 Última retirada de ${tipoEscolhido}: ${dataUltimaEntrega.toLocaleDateString('pt-BR')}`);
          console.log(`📅 Data de hoje: ${hoje.toLocaleDateString('pt-BR')}`);
          console.log(`📅 Dias decorridos: ${diasDecorridos}`);
          
          // Regras específicas por tipo:
          // Kit: 14 dias (2x por mês)
          // Cesta Básica: 30 dias (1x por mês)
          const diasMinimos = tipoEscolhido === "KIT" ? 14 : 30;
          
          console.log(`⏱️ Período mínimo para ${tipoEscolhido}: ${diasMinimos} dias`);
          
          if (diasDecorridos < diasMinimos) {
            const proximaRetirada = new Date(dataUltimaEntrega);
            proximaRetirada.setDate(proximaRetirada.getDate() + diasMinimos);
            
            console.log(`⏰ Próxima retirada permitida: ${proximaRetirada.toLocaleDateString('pt-BR')}`);
            console.log(`⏰ Dias restantes: ${diasMinimos - diasDecorridos}`);
            
            // Mostrar modal específico baseado no tipo
            if (tipoEscolhido === "KIT") {
              setModalLimiteKit({ open: true, data: proximaRetirada });
            } else {
              setModalLimiteMes({ open: true, data: proximaRetirada });
            }
            return;
          }
        }
      }

      // Buscar cestas disponíveis do tipo permitido
      console.log("🔍 Buscando cestas disponíveis do tipo:", tipoEscolhido);
      const response = await cestaService.listarCestas();
      
      if (!response.success) {
        console.error("❌ Falha na API de cestas:", response.error);
        setModalErro(true);
        return;
      }
      
      console.log("📦 Total de cestas encontradas:", response.data?.length || 0);
      console.log("📦 Cestas detalhadas:", response.data);
      
      if (!response.data || response.data.length === 0) {
        console.warn("⚠️ Nenhuma cesta cadastrada no sistema");
        setModalEstoqueVazio(true);
        return;
      }

      const cestaDisponivel = response.data.find(c => 
        c.tipo === tipoEscolhido && c.quantidadeCestas > 0
      );

      console.log("🎯 Cesta selecionada para doação:", cestaDisponivel);
      console.log("📦 Quantidade em estoque ANTES da doação:", cestaDisponivel?.quantidadeCestas);

      if (!cestaDisponivel) {
        console.log("❌ Nenhuma cesta do tipo solicitado em estoque");
        setModalErro(true);
        return;
      }

      // Calcular próxima retirada conforme regras específicas
      // Kit: 14 dias (2x por mês), Cesta: 30 dias (1x por mês)
      const hoje = new Date();
      
      // Garantir que está usando data local, não UTC
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const dia = String(hoje.getDate()).padStart(2, '0');
      const dataHojeLocal = `${ano}-${mes}-${dia}`;
      
      const proximaRetirada = new Date(hoje);
      const diasProximaRetirada = tipoEscolhido === "KIT" ? 14 : 30;
      proximaRetirada.setDate(proximaRetirada.getDate() + diasProximaRetirada);
      
      const anoProx = proximaRetirada.getFullYear();
      const mesProx = String(proximaRetirada.getMonth() + 1).padStart(2, '0');
      const diaProx = String(proximaRetirada.getDate()).padStart(2, '0');
      const dataProximaLocal = `${anoProx}-${mesProx}-${diaProx}`;

      // Dados da entrega conforme documentação do backend
      console.log("🔍 Estrutura do beneficiado ANTES de montar dadosEntrega:", {
        beneficiado,
        id: beneficiado.id,
        id_beneficiado: beneficiado.id_beneficiado,
        idBeneficiado: beneficiado.idBeneficiado
      });

      const dadosEntrega = {
        dataRetirada: dataHojeLocal,
        proximaRetirada: dataProximaLocal,
        voluntarioId: parseInt(sessionStorage.getItem("userId") || "1"),
        enderecoId: beneficiado.endereco.id_endereco || beneficiado.endereco.id,
        cestaId: cestaDisponivel.idCesta || cestaDisponivel.id,
        beneficiadoId: beneficiado.id_beneficiado || beneficiado.id
      };

      console.log("🎯 Registrando entrega no banco:", dadosEntrega);
      console.log("📅 Data de hoje (local):", dataHojeLocal);
      console.log("📅 Próxima retirada (local):", dataProximaLocal);
      console.log("🔥 [DoarCesta] PRESTES A CHAMAR registrarEntrega()");

      // Registrar entrega no backend
      const resultado = await entregaService.registrarEntrega(dadosEntrega);
      
      console.log("🔥 [DoarCesta] RESULTADO de registrarEntrega():", resultado);
      console.log("🔍 Beneficiado ID que foi enviado:", dadosEntrega.beneficiadoId);
      console.log("🔍 Entrega retornada pelo backend:", resultado.entrega || resultado.data || resultado);
      
      if (resultado.success) {
        console.log("✅ Entrega registrada com sucesso no banco!");
        
        // ✅ DECREMENTAR ESTOQUE
        const cestaId = cestaDisponivel.idCesta || cestaDisponivel.id;
        const quantidadeAtual = cestaDisponivel.quantidadeCestas || cestaDisponivel.quantidade;
        
        console.log("📦 Decrementando estoque da cesta ID:", cestaId);
        console.log("📦 Quantidade atual:", quantidadeAtual);
        console.log("📦 Nova quantidade:", quantidadeAtual - 1);
        
        const novaQuantidade = quantidadeAtual - 1;
        
        // Se quantidade ficar 0, DELETAR a cesta (backend não aceita quantidade = 0)
        if (novaQuantidade === 0) {
          console.log("🗑️ Última cesta doada, DELETANDO registro do estoque...");
          const delecao = await cestaService.deletarCesta(cestaId);
          
          if (delecao.success) {
            console.log("✅ Cesta deletada do estoque com sucesso!");
          } else {
            console.warn("⚠️ Entrega registrada mas falha ao deletar cesta do estoque:", delecao.error);
          }
        } else {
          // Se ainda tem cestas, apenas ATUALIZAR a quantidade
          console.log("📦 Atualizando quantidade para:", novaQuantidade);
          const atualizacaoEstoque = await cestaService.atualizarCesta(cestaId, {
            quantidadeCestas: novaQuantidade
          });
          
          if (atualizacaoEstoque.success) {
            console.log("✅ Estoque atualizado com sucesso!");
          } else {
            console.warn("⚠️ Entrega registrada mas falha ao atualizar estoque:", atualizacaoEstoque.error);
          }
        }
        
        setModalSucesso(true);
      } else {
        console.error("❌ Erro ao registrar entrega:", resultado.error);
        setModalErro(true);
      }
      
    } catch (error) {
      console.error("Erro ao processar entrega:", error);
      setModalErro(true);
    }
  }

  return (
    <div className="doar-cesta-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isEntregarCestaPage={true} />
      <div className="doar-cesta-container">
        <img 
          src={iconeVoltar} 
          alt="Voltar" 
          className="doar-cesta-icone-voltar"
          onClick={() => navigate("/home")}
        />
        <h1 className="doar-cesta-title">Entregar Cesta</h1>
        <form className="doar-cesta-form" autoComplete="off" onSubmit={handleSubmit}>
          <div className="doar-cesta-row">
            <div className="doar-cesta-field doar-cesta-cpf-field">
              <label className="doar-cesta-label">CPF:</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                className="doar-cesta-input doar-cesta-cpf-input"
                maxLength={14}
                autoComplete="off"
              />
              {cpf && cpf.replace(/\D/g, '').length < 11 && resultados.length > 0 && (
                <div className="doar-cesta-resultados">
                  {resultados.map((beneficiado, idx) => (
                    <div
                      className="doar-cesta-resultado"
                      key={idx}
                      onClick={() => {
                        const cpfLimpo = beneficiado.cpf.replace(/\D/g, "");
                        const cpfFormatado = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                        setCpf(cpfFormatado);
                        setResultados([]); // Limpar resultados após seleção
                      }}
                    >
                      {beneficiado.nome}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="doar-cesta-toggle-container">
              <span className={`doar-cesta-toggle-option ${tipoCesta === 'kit' ? 'active' : ''}`}>Kit</span>
              <div className="doar-cesta-toggle-switch" onClick={() => setTipoCesta(tipoCesta === 'kit' ? 'basica' : 'kit')}>
                <div className={`doar-cesta-toggle-slider ${tipoCesta === 'basica' ? 'right' : 'left'}`}></div>
              </div>
              <span className={`doar-cesta-toggle-option ${tipoCesta === 'basica' ? 'active' : ''}`}>Cesta Básica</span>
            </div>
            <div className="doar-cesta-btn-container">
              <Botao texto="Doar" type="submit" className="doar-cesta-btn" />
            </div>
          </div>
          
          <Modal
            isOpen={modalLimiteKit.open}
            onClose={() => setModalLimiteKit({ open: false, data: null })}
            texto={<>
              Este beneficiado ou alguém da família já retirou o kit nos últimos 14 dias.<br/>
              <strong>Kit pode ser retirado de 14 em 14 dias (2x por mês)</strong><br/>
              Próxima retirada permitida a partir de: {modalLimiteKit.data && modalLimiteKit.data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </>}
            showClose={false}
          />
          
          <Modal
            isOpen={modalLimiteMes.open}
            onClose={() => setModalLimiteMes({ open: false, data: null })}
            texto={<>
              Este beneficiado ou alguém da família já retirou a cesta básica nos últimos 30 dias.<br/>
              <strong>Cesta Básica pode ser retirada de 30 em 30 dias (1x por mês)</strong><br/>
              Próxima retirada permitida a partir de: {modalLimiteMes.data && modalLimiteMes.data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </>}
            showClose={false}
          />
          
          <Modal
            isOpen={modalRestricao.open}
            onClose={() => setModalRestricao({ open: false, tipo: "" })}
            texto={modalRestricao.tipo === "kit"
              ? "Este beneficiado só pode retirar o Kit."
              : modalRestricao.tipo === "basica"
                ? "Este beneficiado só pode retirar a Cesta Básica."
                : "Tipo de retirada não permitido."}
            showClose={false}
          />
          
          <Modal
            isOpen={modalSucesso}
            onClose={() => { setModalSucesso(false); window.location.reload(); }}
            texto={"Cesta doada com sucesso!"}
            showClose={false}
          />
          
          <Modal
            isOpen={modalErro}
            onClose={() => setModalErro(false)}
            texto={"Todas as informações devem ser preenchidas."}
            showClose={false}
          />
          
          <Modal
            isOpen={modalEstoqueVazio}
            onClose={() => setModalEstoqueVazio(false)}
            texto={"Nenhuma cesta disponível no estoque. Entre em contato com o administrador."}
            showClose={false}
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
            showClose={false}
          />
        </form>
      </div>
    </div>
  );
}