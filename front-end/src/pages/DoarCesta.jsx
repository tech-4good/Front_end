import React, { useState } from "react";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import Input from "../components/Input";
import Botao from "../components/Botao";
import Radio from "../components/Radio";
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
  const [modalEstoqueVazio, setModalEstoqueVazio] = useState(false);
  const [modalRestricao, setModalRestricao] = useState({ open: false, tipo: "" });
  const [modalLimiteMes, setModalLimiteMes] = useState({ open: false, data: null });
  const [modalLimiteKit, setModalLimiteKit] = useState({ open: false, data: null });

  function handleCpfChange(e) {
    const valor = e.target.value.replace(/\D/g, "");
    setCpf(valor);
    
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
    
    if (!cpf || !tipoCesta) {
      setModalErro(true);
      return;
    }

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
      console.log("📋 Histórico de entregas:", historico);
      
      // Verificar se é um objeto paginado ou array direto
      const entregas = historico?.content || historico || [];
      console.log("📦 Entregas extraídas:", entregas);
      
      if (entregas && entregas.length > 0) {
        // Encontrar TODAS as entregas do mesmo tipo
        const entregasMesmoTipo = entregas.filter(entrega => 
          entrega.tipo === tipoEscolhido || entrega.cesta?.tipo === tipoEscolhido
        );
        
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
      const response = await cestaService.listarCestas();
      
      if (!response.success) {
        console.error("❌ Falha na API de cestas:", response.error);
        setModalErro(true);
        return;
      }
      
      if (!response.data || response.data.length === 0) {
        console.warn("⚠️ Nenhuma cesta cadastrada no sistema");
        setModalEstoqueVazio(true);
        return;
      }

      const cestaDisponivel = response.data.find(c => 
        c.tipo === tipoEscolhido && c.quantidadeCestas > 0
      );

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

      // Registrar entrega no backend
      const resultado = await entregaService.registrarEntrega(dadosEntrega);
      
      if (resultado.success) {
        console.log("✅ Entrega registrada com sucesso no banco!");
        
        // Atualizar estoque - decrementar 1 cesta
        try {
          console.log("📦 Cesta disponível antes da atualização:", cestaDisponivel);
          console.log("🔢 Quantidade atual:", cestaDisponivel.quantidadeCestas);
          
          const quantidadeAtual = cestaDisponivel.quantidadeCestas || 0;
          const novaQuantidade = Math.max(0, quantidadeAtual - 1); // Não deixar negativo
          
          console.log("🔢 Nova quantidade:", novaQuantidade);
          
          // Payload COMPLETO com todos os campos da cesta, alterando apenas quantidade
          const dadosAtualizacao = {
            tipo: cestaDisponivel.tipo,
            quantidadeCestas: novaQuantidade,
            pesoKg: cestaDisponivel.pesoKg,
            dataEntradaEstoque: cestaDisponivel.dataEntradaEstoque
          };
          
          console.log("📝 Dados para atualização do estoque:", dadosAtualizacao);
          console.log("🔑 ID da cesta para atualizar:", cestaDisponivel.idCesta || cestaDisponivel.id);
          
          const resultadoEstoque = await cestaService.atualizarCesta(
            cestaDisponivel.idCesta || cestaDisponivel.id, 
            dadosAtualizacao
          );
          
          if (resultadoEstoque.success) {
            console.log("✅ Estoque atualizado com sucesso!", resultadoEstoque.data);
            console.log("🎯 Quantidade nova no backend:", resultadoEstoque.data?.quantidadeCestas || "verificar");
          } else {
            console.warn("⚠️ Entrega registrada mas falha ao atualizar estoque:", resultadoEstoque.error);
            console.warn("📊 Response completo:", resultadoEstoque);
          }
        } catch (errorEstoque) {
          console.warn("⚠️ Entrega registrada mas erro ao atualizar estoque:", errorEstoque);
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
              {resultados.map((beneficiado, idx) => (
                <div
                  className="doar-cesta-resultado"
                  key={idx}
                  style={{ cursor: "pointer" }}
                  onClick={() => setCpf(beneficiado.cpf.replace(/\D/g, ""))}
                >
                  {beneficiado.nome}
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
              Este beneficiado ou alguém da família já retirou o kit nos últimos 14 dias.<br/>
              <strong>Kit pode ser retirado de 14 em 14 dias (2x por mês)</strong><br/>
              Próxima retirada permitida a partir de: {modalLimiteKit.data && modalLimiteKit.data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </>}
            showClose={true}
          />
          
          <Modal
            isOpen={modalLimiteMes.open}
            onClose={() => setModalLimiteMes({ open: false, data: null })}
            texto={<>
              Este beneficiado ou alguém da família já retirou a cesta básica nos últimos 30 dias.<br/>
              <strong>Cesta Básica pode ser retirada de 30 em 30 dias (1x por mês)</strong><br/>
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
            isOpen={modalEstoqueVazio}
            onClose={() => setModalEstoqueVazio(false)}
            texto={"Nenhuma cesta disponível no estoque. Entre em contato com o administrador."}
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