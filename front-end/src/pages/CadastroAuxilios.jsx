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

  const [tipoUsuario, setTipoUsuario] = useState("2");
  const navigate = useNavigate();

  useEffect(() => {
    const tipo = sessionStorage.getItem("tipoUsuario") || "2";
    setTipoUsuario(tipo);
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

  // Auto-close modal de sucesso e redirecionar após 2 segundos
  useEffect(() => {
    if (modalSucesso) {
      console.log("🎉 Modal de sucesso ativado, redirecionando em 2s");
      const timer = setTimeout(() => {
        console.log("🏠 Redirecionando para home");
        setModalSucesso(false);
        navigate("/home");
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

  async function handleSalvar(e) {
    e.preventDefault();
    console.log("🚀 Iniciando handleSalvar");
    console.log("📝 CPF informado:", cpfBeneficiado);
    console.log("📝 Auxílio informado:", nomeAuxilio);
    let newErros = {};

    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpfBeneficiado)) {
      newErros.cpf = "CPF inválido";
    }
    if (!nomeAuxilio || nomeAuxilio.trim() === "")
      newErros.nomeAuxilio = "Informe o nome do auxílio";

    setErros(newErros);

    if (Object.keys(newErros).length > 0) {
      setModalCampos(true);
      return;
    }

    setCarregando(true);
    try {
      // Buscar beneficiário pelo CPF diretamente no backend
      const cpfLimpo = cpfBeneficiado.replace(/\D/g, "");
      console.log("🔍 Buscando CPF:", cpfLimpo);
      const respostaBeneficiado = await beneficiadoService.buscarPorCpf(cpfLimpo);
      console.log("📋 Resposta da busca:", respostaBeneficiado);

      if (!respostaBeneficiado.success) {
        console.log("❌ CPF não encontrado, mostrando modal");
        setModalCpfNaoEncontrado(true);
        setCarregando(false);
        return;
      }

      const beneficiado = respostaBeneficiado.data;

        // Verificar se o auxílio existe ou criar um novo
        let auxilioId = null;
        const respostaAuxilios = await auxilioService.buscarPorNome(
          nomeAuxilio.trim()
        );

        if (respostaAuxilios.success && respostaAuxilios.data.length > 0) {
          auxilioId = respostaAuxilios.data[0].id;
        } else {
          // Criar novo auxílio
          const novoAuxilio = await auxilioService.cadastrar({
            nome: nomeAuxilio.trim(),
          });
          if (novoAuxilio.success) {
            auxilioId = novoAuxilio.data.id;
          } else {
            setModalErro({
              open: true,
              mensagem: "Erro ao criar auxílio: " + novoAuxilio.error,
            });
            return;
          }
        }

        // Associar auxílio ao beneficiário
        const associacao = await auxilioService.associarBeneficiario(
          beneficiado.id,
          auxilioId
        );
        if (associacao.success) {
          setModalSucesso(true);
          setCpfBeneficiado("");
          setNomeAuxilio("");
        } else {
          setModalErro({
            open: true,
            mensagem: "Erro ao associar auxílio: " + associacao.error,
          });
        }

    } catch (error) {
      setModalErro({
        open: true,
        mensagem: "Erro ao processar cadastro de auxílio",
      });
    } finally {
      setCarregando(false);
    }
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
      // PASSO 1: Buscar auxílio
      console.log("🔍 Buscando auxílio:", nomeAuxilio.trim());
      const respostaAuxilio = await auxilioService.buscarPorNome(nomeAuxilio.trim());
      
      if (respostaAuxilio.success && respostaAuxilio.data.length > 0) {
        // AUXÍLIO ENCONTRADO - agora verificar CPF
        const auxilioEncontrado = respostaAuxilio.data[0];
        console.log("✅ Auxílio encontrado:", auxilioEncontrado.nome);
        
        // PASSO 2: Verificar se CPF existe
        const cpfLimpo = cpfBeneficiado.replace(/\D/g, "");
        console.log("🔍 Verificando CPF:", cpfLimpo);
        const respostaBeneficiado = await beneficiadoService.buscarPorCpf(cpfLimpo);
        
        if (!respostaBeneficiado.success) {
          // CPF NÃO ENCONTRADO
          console.log("❌ CPF não encontrado");
          setModalCpfNaoEncontrado(true);
          return;
        }
        
        // CPF ENCONTRADO - associar auxílio ao beneficiário
        const beneficiado = respostaBeneficiado.data;
        console.log("✅ Beneficiado encontrado:", beneficiado.nome);
        
        // PASSO 3: Associar auxílio ao beneficiário
        const associacao = await auxilioService.associarBeneficiario(
          beneficiado.id,
          auxilioEncontrado.id
        );
        
        if (associacao.success) {
          console.log("✅ Auxílio associado com sucesso!");
          setModalSucesso(true);
        } else {
          setModalErro({
            open: true,
            mensagem: "Erro ao associar auxílio: " + associacao.error,
          });
        }
        
      } else {
        // AUXÍLIO NÃO ENCONTRADO
        console.log("❌ Auxílio não encontrado");
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

  const criarEAssociarAuxilio = async () => {
    if (!cpfBeneficiado || !nomeAuxilio) return;
    
    setCarregando(true);
    try {
      // Verificar CPF primeiro
      const cpfLimpo = cpfBeneficiado.replace(/\D/g, "");
      const respostaBeneficiado = await beneficiadoService.buscarPorCpf(cpfLimpo);
      
      if (!respostaBeneficiado.success) {
        setModalCpfNaoEncontrado(true);
        return;
      }
      
      const beneficiado = respostaBeneficiado.data;
      
      // Criar novo auxílio
      const novoAuxilio = await auxilioService.cadastrar({
        nome: nomeAuxilio.trim(),
      });
      
      if (novoAuxilio.success) {
        // Associar ao beneficiário
        const associacao = await auxilioService.associarBeneficiario(
          beneficiado.id,
          novoAuxilio.data.id
        );
        
        if (associacao.success) {
          setModalSucesso(true);
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

  const associarAuxilioExistente = async () => {
    // Esta função não é mais necessária pois a lógica já está no handleBuscarAuxilio
    console.log("Associação já foi feita no handleBuscarAuxilio");
  };

  return (
    <div className="cadastro-auxilios-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isCadastrarBeneficiadosPage={true} />
      <div className="cadastro-auxilios-container">
        <h1 className="cadastro-auxilios-title">Cadastro de Auxílios</h1>

        <form className="cadastro-auxilios-form" onSubmit={handleSalvar}>
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


        </form>

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
          texto={`Auxílio "${modalEncontrado.auxilio?.nome}" encontrado!\nDeseja adicionar este auxílio ao beneficiário?`}
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
            "Auxílio não encontrado!\nDeseja criar e adicionar este novo auxílio ao beneficiário?"
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
            navigate("/home");
          }}
          texto={"Auxílio cadastrado com sucesso!"}
          showClose={false}
          botoes={[{ 
            texto: "OK", 
            onClick: () => {
              setModalSucesso(false);
              navigate("/home");
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
      </div>
    </div>
  );
}
