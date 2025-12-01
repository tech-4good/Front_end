import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import Modal from "../components/Modal";
import Input from "../components/Input";
import "../styles/CadastroAuxilios.css";
import { FaSearch } from "react-icons/fa";

import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import { auxilioService } from "../services/auxilioService";
import { beneficiadoService } from "../services/beneficiadoService";

export default function CadastroAuxilios() {
  const [cpfBeneficiado, setCpfBeneficiado] = useState("");
  const [nomeAuxilio, setNomeAuxilio] = useState("");
  const [modalEncontrado, setModalEncontrado] = useState({
    open: false,
    auxilio: null,
  });
  const [modalNaoEncontrado, setModalNaoEncontrado] = useState(false);
  const [modalCpfNaoEncontrado, setModalCpfNaoEncontrado] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErro, setModalErro] = useState({ open: false, mensagem: "" });
  const [erros, setErros] = useState({});
  const [modalCampos, setModalCampos] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [beneficiadoEncontrado, setBeneficiadoEncontrado] = useState(null);
  const [modalAuxilioJaVinculado, setModalAuxilioJaVinculado] = useState(false);

  const [tipoUsuario, setTipoUsuario] = useState("2");
  const navigate = useNavigate();

  useEffect(() => {
    const tipo = sessionStorage.getItem("tipoUsuario") || "2";
    setTipoUsuario(tipo);
    
    // Preencher CPF automaticamente se vier da tela de consulta
    const cpfPreenchido = sessionStorage.getItem("cpfSelecionado");
    if (cpfPreenchido) {
      setCpfBeneficiado(formatCPF(cpfPreenchido));
      console.log("📋 CPF preenchido automaticamente:", cpfPreenchido);
    }
  }, []);

  // Auto-close modal de campos após 3 segundos
  useEffect(() => {
    if (modalCampos) {
      const timer = setTimeout(() => {
        setModalCampos(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [modalCampos]);

  // Auto-close modal de erro após 3 segundos
  useEffect(() => {
    if (modalErro.open) {
      const timer = setTimeout(() => {
        setModalErro({ open: false, mensagem: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [modalErro.open]);

  // Auto-close modal de CPF não encontrado após 3 segundos
  useEffect(() => {
    if (modalCpfNaoEncontrado) {
      console.log("⏰ Modal CPF não encontrado ativado, fechando em 3s");
      const timer = setTimeout(() => {
        console.log("⏰ Fechando modal CPF não encontrado");
        setModalCpfNaoEncontrado(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [modalCpfNaoEncontrado]);

  // Auto-close modal de auxílio já vinculado após 3 segundos
  useEffect(() => {
    if (modalAuxilioJaVinculado) {
      const timer = setTimeout(() => {
        setModalAuxilioJaVinculado(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [modalAuxilioJaVinculado]);

  // Auto-close modal de sucesso e redirecionar após 2 segundos
  useEffect(() => {
    if (modalSucesso) {
      console.log("🎉 Modal de sucesso ativado, redirecionando em 2s");
      const timer = setTimeout(() => {
        console.log("📋 Redirecionando para menu de cadastro");
        setModalSucesso(false);
        navigate("/cadastro-beneficiado-menu");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [modalSucesso, navigate]);

  const botoesNavbar = [
    { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
    {
      texto: "Perfil",
      onClick: () => navigate("/perfil"),
      icone: iconeUsuario,
    },
    ...(tipoUsuario === "2"
      ? [
          {
            texto: "Fila de Espera",
            onClick: () => navigate("/fila-espera"),
            icone: iconeRelogio,
          },
        ]
      : []),
    { texto: "Sair", onClick: () => navigate("/"), icone: iconeSair },
  ];

  const nomeUsuario = sessionStorage.getItem("nomeUsuario") || "Usuário";

  function formatCPF(value) {
    let numbers = value.replace(/\D/g, "");
    if (numbers.length > 11) numbers = numbers.slice(0, 11);

    if (numbers.length > 9) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
    } else if (numbers.length > 6) {
      return numbers.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
    } else if (numbers.length > 3) {
      return numbers.replace(/(\d{3})(\d{0,3})/, "$1.$2");
    }
    return numbers;
  }

  function formatNomeAuxilio(value) {
    // Remover caracteres que não são letras ou espaços
    let texto = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    
    // Não permitir dois espaços seguidos
    texto = texto.replace(/\s{2,}/g, " ");
    
    // Não permitir espaço no início
    if (texto.startsWith(" ")) {
      texto = texto.substring(1);
    }
    
    return texto;
  }



  async function handleBuscarAuxilio(e) {
    e.preventDefault();
    
    // Validar campos
    if (!cpfBeneficiado || !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpfBeneficiado)) {
      setModalErro({ open: true, mensagem: "Informe um CPF válido" });
      return;
    }
    if (!nomeAuxilio || nomeAuxilio.trim() === "") {
      setModalErro({ open: true, mensagem: "Informe o nome do auxílio" });
      return;
    }

    setCarregando(true);
    try {
      // PASSO 1: Verificar se CPF existe
      const cpfLimpo = cpfBeneficiado.replace(/\D/g, "");
      console.log("🔍 Verificando CPF:", cpfLimpo);
      const respostaBeneficiado = await beneficiadoService.buscarPorCpf(cpfLimpo);
      
      if (!respostaBeneficiado.success) {
        // CPF NÃO ENCONTRADO
        console.log("❌ CPF não encontrado");
        setModalCpfNaoEncontrado(true);
        setCarregando(false);
        return;
      }
      
      // PASSO 2: Buscar auxílio
      console.log("🔍 Buscando auxílio:", nomeAuxilio.trim());
      const respostaAuxilio = await auxilioService.buscarPorNome(nomeAuxilio.trim());
      
      if (respostaAuxilio.success && respostaAuxilio.data.length > 0) {
        // AUXÍLIO ENCONTRADO - Mostrar modal de confirmação
        const auxilioEncontrado = respostaAuxilio.data[0];
        console.log("✅ Auxílio encontrado:", auxilioEncontrado.tipo || auxilioEncontrado.nome);
        
        // Armazenar dados para usar na confirmação
        setBeneficiadoEncontrado(respostaBeneficiado.data);
        setModalEncontrado({ open: true, auxilio: auxilioEncontrado });
        
      } else {
        // AUXÍLIO NÃO ENCONTRADO - Mostrar modal perguntando se quer criar
        console.log("❌ Auxílio não encontrado");
        setBeneficiadoEncontrado(respostaBeneficiado.data);
        setModalNaoEncontrado(true);
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      setModalErro({ open: true, mensagem: "Erro ao processar busca" });
    } finally {
      setCarregando(false);
    }
  }

  const handleConfirmarAuxilio = async (criarNovo = false) => {
    setModalEncontrado({ open: false, auxilio: null });
    setModalNaoEncontrado(false);

    if (criarNovo) {
      // Criar novo auxílio e depois associar
      await criarEAssociarAuxilio();
    } else {
      // Auxílio já existe, só associar
      await associarAuxilioExistente();
    }
  };

  const associarAuxilioExistente = async () => {
    if (!beneficiadoEncontrado || !modalEncontrado.auxilio) return;
    
    setCarregando(true);
    try {
      const auxilioId = modalEncontrado.auxilio.idAuxilio || modalEncontrado.auxilio.id;
      
      // Verificar se o auxílio já está vinculado ao beneficiário
      console.log("🔍 Verificando se auxílio já está vinculado...");
      const auxiliosVinculados = await auxilioService.buscarPorBeneficiario(beneficiadoEncontrado.id);
      
      if (auxiliosVinculados.success && auxiliosVinculados.data.length > 0) {
        const jaVinculado = auxiliosVinculados.data.some(assoc => {
          const idAssociado = assoc.auxilioGovernamental?.idAuxilio || 
                             assoc.auxilioGovernamental?.id || 
                             assoc.auxilioId;
          return idAssociado === auxilioId;
        });
        
        if (jaVinculado) {
          console.log("⚠️ Auxílio já vinculado ao beneficiário!");
          setModalAuxilioJaVinculado(true);
          setCarregando(false);
          return;
        }
      }
      
      // Se não está vinculado, prosseguir com a associação
      console.log("🔗 Associando beneficiado", beneficiadoEncontrado.id, "ao auxílio", auxilioId);
      
      const associacao = await auxilioService.associarBeneficiario(
        beneficiadoEncontrado.id,
        auxilioId
      );
      
      if (associacao.success) {
        console.log("✅ Auxílio associado com sucesso!");
        setModalSucesso(true);
        setCpfBeneficiado("");
        setNomeAuxilio("");
        setBeneficiadoEncontrado(null);
      } else {
        setModalErro({
          open: true,
          mensagem: "Erro ao associar auxílio: " + associacao.error,
        });
      }
    } catch (error) {
      setModalErro({
        open: true,
        mensagem: "Erro ao processar associação",
      });
    } finally {
      setCarregando(false);
    }
  };

  const criarEAssociarAuxilio = async () => {
    if (!beneficiadoEncontrado || !nomeAuxilio) return;
    
    setCarregando(true);
    try {
      // Criar novo auxílio
      console.log("📝 Criando novo auxílio:", nomeAuxilio.trim());
      const novoAuxilio = await auxilioService.cadastrar({
        nome: nomeAuxilio.trim(),
      });
      
      if (novoAuxilio.success) {
        // Associar ao beneficiário
        // API retorna idAuxilio, não id
        const auxilioId = novoAuxilio.data.idAuxilio || novoAuxilio.data.id;
        console.log("✅ Auxílio criado, ID:", auxilioId);
        
        // Verificar se o auxílio já está vinculado (por segurança)
        console.log("🔍 Verificando se auxílio já está vinculado...");
        const auxiliosVinculados = await auxilioService.buscarPorBeneficiario(beneficiadoEncontrado.id);
        
        if (auxiliosVinculados.success && auxiliosVinculados.data.length > 0) {
          const jaVinculado = auxiliosVinculados.data.some(assoc => {
            const idAssociado = assoc.auxilioGovernamental?.idAuxilio || 
                               assoc.auxilioGovernamental?.id || 
                               assoc.auxilioId;
            return idAssociado === auxilioId;
          });
          
          if (jaVinculado) {
            console.log("⚠️ Auxílio já vinculado ao beneficiário!");
            setModalAuxilioJaVinculado(true);
            setCarregando(false);
            return;
          }
        }
        
        console.log("🔗 Associando beneficiado", beneficiadoEncontrado.id, "ao auxílio", auxilioId);
        const associacao = await auxilioService.associarBeneficiario(
          beneficiadoEncontrado.id,
          auxilioId
        );
        
        if (associacao.success) {
          setModalSucesso(true);
          setCpfBeneficiado("");
          setNomeAuxilio("");
          setBeneficiadoEncontrado(null);
        } else {
          setModalErro({
            open: true,
            mensagem: "Erro ao associar auxílio: " + associacao.error,
          });
        }
      } else {
        setModalErro({
          open: true,
          mensagem: "Erro ao criar auxílio: " + novoAuxilio.error,
        });
      }
    } catch (error) {
      setModalErro({
        open: true,
        mensagem: "Erro ao processar criação de auxílio",
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="cadastro-auxilios-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isCadastrarBeneficiadosPage={true} />
      <div className="cadastro-auxilios-container">
        <h1 className="cadastro-auxilios-title">Cadastro de Auxílios</h1>

        <div className="cadastro-auxilios-form">
          {/* Linha única - CPF e Nome do Auxílio lado a lado */}
          <div className="cadastro-auxilios-row">
            <div className="cadastro-auxilios-field">
              <label className="cadastro-auxilios-label">CPF:</label>
              <input
                type="text"
                name="cpfBeneficiado"
                placeholder="000.000.000-00"
                value={cpfBeneficiado}
                onChange={(e) => setCpfBeneficiado(formatCPF(e.target.value))}
                maxLength={14}
                className="cadastro-auxilios-input"
              />
            </div>

            <div className="cadastro-auxilios-field">
              <div className="cadastro-auxilios-input-button-wrapper">
                <div className="cadastro-auxilios-input-wrapper">
                  <label className="cadastro-auxilios-label">Nome do Auxílio:</label>
                  <input
                    type="text"
                    name="nomeAuxilio"
                    placeholder="Digite o nome do auxílio"
                    value={nomeAuxilio}
                    onChange={(e) => setNomeAuxilio(formatNomeAuxilio(e.target.value))}
                    className="cadastro-auxilios-input"
                  />
                </div>
                <button
                  type="button"
                  className="cadastro-auxilios-search-button"
                  onClick={handleBuscarAuxilio}
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>


        </div>

        {carregando && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            Processando...
          </div>
        )}

        <Modal
          isOpen={modalCampos}
          onClose={() => setModalCampos(false)}
          texto="Preencha todos os campos"
          showClose={false}
        />
        <Modal
          isOpen={modalEncontrado.open}
          onClose={() => setModalEncontrado({ open: false, auxilio: null })}
          texto={`Auxílio "${modalEncontrado.auxilio?.tipo || modalEncontrado.auxilio?.nome}" encontrado!\nDeseja vincular este auxílio ao beneficiário?`}
          showClose={true}
          botoes={[
            {
              texto: "Sim",
              onClick: () => handleConfirmarAuxilio(false),
            },
            {
              texto: "Não",
              onClick: () => setModalEncontrado({ open: false, auxilio: null }),
            },
          ]}
        />
        <Modal
          isOpen={modalNaoEncontrado}
          onClose={() => setModalNaoEncontrado(false)}
          texto={
            "Auxílio não encontrado!\nDeseja cadastrar e vincular este novo auxílio ao beneficiário?"
          }
          showClose={false}
          botoes={[
            {
              texto: "Sim",
              onClick: () => handleConfirmarAuxilio(true),
            },
            {
              texto: "Não",
              onClick: () => setModalNaoEncontrado(false),
            },
          ]}
        />
        <Modal
          isOpen={modalSucesso}
          onClose={() => {
            setModalSucesso(false);
            navigate("/cadastro-beneficiado-menu");
          }}
          texto={"Auxílio vinculado com sucesso!"}
          showClose={false}
          botoes={[{ 
            texto: "OK", 
            onClick: () => {
              setModalSucesso(false);
              navigate("/cadastro-beneficiado-menu");
            }
          }]}
        />
        <Modal
          isOpen={modalErro.open}
          onClose={() => setModalErro({ open: false, mensagem: "" })}
          texto="Erro ao processar solicitação"
          showClose={false}
        />
        <Modal
          isOpen={modalCpfNaoEncontrado}
          onClose={() => setModalCpfNaoEncontrado(false)}
          texto="CPF não encontrado na base de dados"
          showClose={false}
        />
        <Modal
          isOpen={modalAuxilioJaVinculado}
          onClose={() => setModalAuxilioJaVinculado(false)}
          texto="Este auxílio já está vinculado a este beneficiário"
          showClose={false}
        />
      </div>
    </div>
  );
}
