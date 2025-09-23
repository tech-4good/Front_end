import React, { useState, useEffect } from "react";
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

  // Mapeamento de tipos conforme backend
  const TIPOS_CESTA_MAP = {
    'KIT': 'Kit',
    'BASICA': 'Cesta Básica'
  };

  const botoesNavbar = [
    { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
    { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
    ...(tipoUsuario === "2"
      ? [{ texto: "Fila de Espera", onClick: () => navigate("/fila-espera"), icone: iconeRelogio }]
      : []),
    { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair },
  ];

  const [cpf, setCpf] = useState("");
  const [beneficiado, setBeneficiado] = useState(null);
  const [cestasDisponiveis, setCestasDisponiveis] = useState([]);
  const [cestaEscolhida, setCestaEscolhida] = useState(null);
  const [loadingBuscar, setLoadingBuscar] = useState(false);
  const [loadingConfirmar, setLoadingConfirmar] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Estados dos modais
  const [modalNaoEncontrado, setModalNaoEncontrado] = useState(false);
  const [modalErro, setModalErro] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalLimiteMes, setModalLimiteMes] = useState({ open: false, data: null });
  const [modalLimiteKit, setModalLimiteKit] = useState({ open: false, data: null });
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    carregarCestasDisponiveis();
  }, []);

  const carregarCestasDisponiveis = async () => {
    try {
      const cestas = await cestaService.listarCestas();
      setCestasDisponiveis(cestas || []);
    } catch (error) {
      console.error("Erro ao carregar cestas disponíveis:", error);
      setCestasDisponiveis([]);
    }
  };

  function handleCpfChange(e) {
    const valor = e.target.value.replace(/\D/g, "");
    setCpf(valor);
    // Limpar dados anteriores quando CPF muda
    if (beneficiado) {
      setBeneficiado(null);
      setCestaEscolhida(null);
      setErrorMessage("");
    }
  }

  async function buscarBeneficiado() {
    if (!cpf || cpf.length < 11) {
      setErrorMessage("CPF deve ter 11 dígitos");
      return;
    }

    setLoadingBuscar(true);
    setErrorMessage("");

    try {
      const beneficiadoEncontrado = await beneficiadoService.buscarPorCpf(cpf);
      
      if (!beneficiadoEncontrado) {
        setModalNaoEncontrado(true);
        setBeneficiado(null);
        return;
      }

      // Verificar elegibilidade baseada no endereço
      if (!beneficiadoEncontrado.endereco) {
        setModalErro(true);
        setModalMessage("Beneficiado não possui endereço cadastrado.");
        return;
      }

      if (beneficiadoEncontrado.endereco.status !== "ABERTO") {
        setModalErro(true);
        setModalMessage("Endereço do beneficiado está inativo.");
        return;
      }

      // Verificar histórico de entregas
      const historico = await entregaService.buscarHistorico(beneficiadoEncontrado.id);
      const podeRetirar = validarElegibilidade(beneficiadoEncontrado.endereco, historico);
      
      if (!podeRetirar.pode) {
        if (podeRetirar.motivo === "JA_RETIROU_MES") {
          setModalLimiteMes({ 
            open: true, 
            data: new Date(podeRetirar.ultimaRetirada).toLocaleDateString() 
          });
        } else if (podeRetirar.motivo === "PRAZO_KIT") {
          setModalLimiteKit({ 
            open: true, 
            data: new Date(podeRetirar.proximaRetirada).toLocaleDateString() 
          });
        }
        setBeneficiado(null);
        return;
      }

      setBeneficiado(beneficiadoEncontrado);

    } catch (error) {
      console.error("Erro ao buscar beneficiado:", error);
      setModalErro(true);
      setModalMessage("Erro ao buscar beneficiado. Tente novamente.");
    } finally {
      setLoadingBuscar(false);
    }
  }

  function validarElegibilidade(endereco, historico) {
    const hoje = new Date();
    
    // Verificar data de saída
    if (endereco.dataSaida && new Date(endereco.dataSaida) < hoje) {
      return { pode: false, motivo: "DATA_SAIDA_VENCIDA" };
    }

    // Verificar histórico de entregas
    if (historico && historico.length > 0) {
      const ultimaEntrega = historico[0]; // Assumindo que vem ordenado por data
      const ultimaData = new Date(ultimaEntrega.dataRetirada);
      const proximaPermitida = new Date(ultimaEntrega.proximaRetirada);

      if (hoje < proximaPermitida) {
        if (endereco.tipoCesta === "BASICA") {
          return { 
            pode: false, 
            motivo: "JA_RETIROU_MES", 
            ultimaRetirada: ultimaData.toISOString() 
          };
        } else {
          return { 
            pode: false, 
            motivo: "PRAZO_KIT", 
            proximaRetirada: proximaPermitida.toISOString() 
          };
        }
      }
    }

    return { pode: true };
  }

  function calcularProximaRetirada(tipoCesta) {
    const hoje = new Date();
    const proxima = new Date(hoje);
    
    if (tipoCesta === "BASICA") {
      // Próximo mês
      proxima.setMonth(proxima.getMonth() + 1);
    } else {
      // 30 dias para kit
      proxima.setDate(proxima.getDate() + 30);
    }
    
    return proxima.toISOString().split('T')[0];
  }

  async function confirmarEntrega() {
    if (!beneficiado || !cestaEscolhida) {
      setModalErro(true);
      setModalMessage("Selecione uma cesta antes de confirmar.");
      return;
    }

    setLoadingConfirmar(true);

    try {
      const entrega = {
        dataRetirada: new Date().toISOString().split('T')[0],
        proximaRetirada: calcularProximaRetirada(beneficiado.endereco.tipoCesta),
        enderecoId: beneficiado.endereco.id,
        cestaId: cestaEscolhida.idCesta,
        voluntarioId: parseInt(sessionStorage.getItem("userId")),
        beneficiadoId: beneficiado.id
      };

      const resultado = await entregaService.registrarEntrega(entrega);

      if (resultado) {
        setModalSucesso(true);
        setModalMessage("Entrega registrada com sucesso!");
        
        // Recarregar cestas disponíveis para atualizar estoque
        await carregarCestasDisponiveis();
        
        // Limpar formulário
        setCpf("");
        setBeneficiado(null);
        setCestaEscolhida(null);
      }

    } catch (error) {
      console.error("Erro ao registrar entrega:", error);
      setModalErro(true);
      setModalMessage(error.message || "Erro ao registrar entrega. Tente novamente.");
    } finally {
      setLoadingConfirmar(false);
    }
  }

  // Filtrar cestas do tipo permitido pelo beneficiado
  const cestasFiltradas = beneficiado ? 
    cestasDisponiveis.filter(cesta => 
      cesta.tipo === beneficiado.endereco.tipoCesta && cesta.quantidadeCestas > 0
    ) : [];

  return (
    <div className="doar-cesta-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
      <div className="doar-cesta-container">
        <div className="doar-cesta-voltar">
          <Voltar onClick={() => navigate("/home")} />
        </div>
        <h1 className="doar-cesta-title">Entregar Cesta</h1>
        <div className="doar-cesta-form-container">
          <div className="doar-cesta-buscar">
            <Input
              placeholder="Insira o CPF (apenas números)"
              value={cpf}
              onChange={handleCpfChange}
              className="doar-cesta-input"
              maxLength={11}
            />
            {errorMessage && (
              <div className="doar-cesta-error">{errorMessage}</div>
            )}
            <Botao 
              texto={loadingBuscar ? "Buscando..." : "Buscar Beneficiado"} 
              onClick={buscarBeneficiado}
              disabled={loadingBuscar || cpf.length < 11}
            />
          </div>

          {beneficiado && (
            <div className="doar-cesta-beneficiado-info">
              <h3>Beneficiado Encontrado</h3>
              <p><strong>Nome:</strong> {beneficiado.nome}</p>
              <p><strong>CPF:</strong> {beneficiado.cpf}</p>
              <p><strong>Tipo Permitido:</strong> {TIPOS_CESTA_MAP[beneficiado.endereco.tipoCesta]}</p>
              
              <div className="doar-cesta-tipos">
                <h4>Cestas Disponíveis:</h4>
                {cestasFiltradas.length > 0 ? (
                  <div className="doar-cesta-radio-row">
                    {cestasFiltradas.map(cesta => (
                      <Radio
                        key={cesta.idCesta}
                        name="cestaEscolhida"
                        options={[{
                          label: `${TIPOS_CESTA_MAP[cesta.tipo]} - ${cesta.pesoKg}kg (${cesta.quantidadeCestas} disponíveis)`,
                          value: cesta.idCesta.toString()
                        }]}
                        value={cestaEscolhida?.idCesta?.toString() || ""}
                        onChange={e => {
                          const cesta = cestasFiltradas.find(c => c.idCesta.toString() === e.target.value);
                          setCestaEscolhida(cesta);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="doar-cesta-sem-estoque">
                    Não há {TIPOS_CESTA_MAP[beneficiado.endereco.tipoCesta].toLowerCase()} disponível em estoque.
                  </p>
                )}
              </div>

              <div className="doar-cesta-btn-row">
                <Botao 
                  texto={loadingConfirmar ? "Confirmando..." : "Confirmar Entrega"} 
                  onClick={confirmarEntrega}
                  disabled={loadingConfirmar || !cestaEscolhida || cestasFiltradas.length === 0}
                />
              </div>
            </div>
          )}

          <Modal
            isOpen={modalLimiteKit.open}
            onClose={() => setModalLimiteKit({ open: false, data: null })}
            texto={<>
              Este beneficiado já retirou nos últimos 30 dias.<br/>
              Próxima retirada permitida a partir de: {modalLimiteKit.data}
            </>}
            showClose={true}
          />
          
          <Modal
            isOpen={modalLimiteMes.open}
            onClose={() => setModalLimiteMes({ open: false, data: null })}
            texto={<>
              Este beneficiado já retirou este mês.<br/>
              Próxima retirada permitida no próximo mês.
            </>}
            showClose={true}
          />
          
          <Modal
            isOpen={modalSucesso}
            onClose={() => { 
              setModalSucesso(false); 
              setModalMessage("");
            }}
            texto={modalMessage || "Entrega registrada com sucesso!"}
            showClose={true}
          />
          
          <Modal
            isOpen={modalErro}
            onClose={() => {
              setModalErro(false);
              setModalMessage("");
            }}
            texto={modalMessage || "Erro ao processar solicitação."}
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
        </div>
      </div>
    </div>
  );
}