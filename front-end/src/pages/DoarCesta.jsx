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
  const [modalRestricao, setModalRestricao] = useState({ open: false, tipo: "" });
  const [modalLimiteMes, setModalLimiteMes] = useState({ open: false, data: null });
  const [modalLimiteKit, setModalLimiteKit] = useState({ open: false, data: null });

  function handleCpfChange(e) {
    const valor = e.target.value.replace(/\D/g, "");
    setCpf(valor);
    
    // Buscar beneficiados conforme o usuário digita
    if (valor.length > 0) {
      buscarBeneficiados(valor);
    } else {
      setResultados([]);
    }
  }

  async function buscarBeneficiados(cpfParcial) {
    try {
      // Simular busca de beneficiados que começam com o CPF digitado
      const todosBeneficiados = await beneficiadoService.listar();
      const encontrados = todosBeneficiados.filter(b => 
        b.cpf && b.cpf.replace(/\D/g, "").startsWith(cpfParcial)
      );
      setResultados(encontrados.slice(0, 5)); // Limitar a 5 resultados
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
      // Buscar beneficiado completo
      const beneficiado = await beneficiadoService.buscarPorCpf(cpf);
      
      if (!beneficiado) {
        setModalNaoEncontrado(true);
        return;
      }

      // Verificar se tem endereço
      if (!beneficiado.endereco) {
        setModalErro(true);
        return;
      }

      // Verificar se o tipo escolhido é permitido
      const tipoPermitido = beneficiado.endereco.tipoCesta;
      const tipoEscolhido = tipoCesta === "kit" ? "KIT" : "BASICA";
      
      if (tipoPermitido !== tipoEscolhido) {
        setModalRestricao({ 
          open: true, 
          tipo: tipoPermitido === "KIT" ? "kit" : "basica" 
        });
        return;
      }

      // Verificar histórico de entregas
      const historico = await entregaService.buscarHistorico(beneficiado.id);
      
      if (historico && historico.length > 0) {
        const ultimaEntrega = historico[0];
        const proximaPermitida = new Date(ultimaEntrega.proximaRetirada);
        const hoje = new Date();

        if (hoje < proximaPermitida) {
          if (tipoEscolhido === "BASICA") {
            setModalLimiteMes({ 
              open: true, 
              data: proximaPermitida 
            });
            return;
          } else {
            setModalLimiteKit({ 
              open: true, 
              data: proximaPermitida 
            });
            return;
          }
        }
      }

      // Registrar a entrega
      const proximaRetirada = new Date();
      if (tipoEscolhido === "BASICA") {
        proximaRetirada.setMonth(proximaRetirada.getMonth() + 1);
      } else {
        proximaRetirada.setDate(proximaRetirada.getDate() + 30);
      }

      await entregaService.registrarEntrega({
        dataRetirada: new Date().toISOString().split('T')[0],
        proximaRetirada: proximaRetirada.toISOString().split('T')[0],
        enderecoId: beneficiado.endereco.id,
        cestaId: 1, // ID genérico - ajustar conforme necessário
        voluntarioId: parseInt(sessionStorage.getItem("userId") || "1"),
        beneficiadoId: beneficiado.id
      });

      setModalSucesso(true);
      
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
              Este beneficiado ou alguém da família já retirou o kit nos últimos 30 dias.<br/>
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