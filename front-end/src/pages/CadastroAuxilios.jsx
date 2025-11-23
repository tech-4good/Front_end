import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
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

  async function handleSalvar(e) {
    e.preventDefault();
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
      // Buscar beneficiário pelo CPF
      const cpfLimpo = cpfBeneficiado.replace(/\D/g, "");
      const respostaBeneficiados = await beneficiadoService.listar();

      if (respostaBeneficiados.success) {
        const beneficiado = respostaBeneficiados.data.find(
          (b) => b.cpf === cpfLimpo
        );
        if (!beneficiado) {
          setModalErro({
            open: true,
            mensagem: "Beneficiário não encontrado com este CPF.",
          });
          return;
        }

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
      } else {
        setModalErro({
          open: true,
          mensagem:
            "Erro ao buscar beneficiários: " + respostaBeneficiados.error,
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
    if (!nomeAuxilio || nomeAuxilio.trim() === "") {
      setModalCampos(true);
      return;
    }

    setCarregando(true);
    try {
      const resposta = await auxilioService.buscarPorNome(nomeAuxilio.trim());
      if (resposta.success && resposta.data.length > 0) {
        setModalEncontrado({ open: true, auxilio: resposta.data[0] });
      } else {
        setModalNaoEncontrado(true);
      }
    } catch (error) {
      setModalErro({ open: true, mensagem: "Erro ao buscar auxílio" });
    } finally {
      setCarregando(false);
    }
  }

  const handleConfirmarAuxilio = async (criarNovo = false) => {
    setModalEncontrado({ open: false, auxilio: null });
    setModalNaoEncontrado(false);

    // Simular o processo de salvamento automático após confirmação
    const event = { preventDefault: () => {} };
    await handleSalvar(event);
  };

  return (
    <div className="cadastro-filhos-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
      <div className="cadastro-filhos-container">
        <div className="cadastro-filhos-voltar">
          <Voltar onClick={() => navigate("/home")} />
        </div>

        <h1 className="cadastro-filhos-title">Cadastro de Auxílios</h1>

        <form className="cadastro-filhos-form" onSubmit={handleSalvar}>
          {/* CPF */}
          <Input
            label="CPF do Beneficiado:"
            type="text"
            name="cpfBeneficiado"
            placeholder="000.000.000-00"
            value={cpfBeneficiado}
            onChange={(e) => setCpfBeneficiado(formatCPF(e.target.value))}
            maxLength={14}
            style={erros.cpf ? { border: "2px solid #e74c3c" } : {}}
          />
          {erros.cpf && (
            <span style={{ color: "#e74c3c", fontSize: 13 }}>{erros.cpf}</span>
          )}

          {/* Nome do Auxílio + Buscar */}
          <div className="cadastro-auxilios-search-row">
            <div className="cadastro-auxilios-search-input-wrapper">
              <Input
                label="Nome do Auxílio:"
                type="text"
                name="nomeAuxilio"
                placeholder="Digite o nome do auxílio"
                value={nomeAuxilio}
                onChange={(e) => setNomeAuxilio(e.target.value)}
                style={erros.nomeAuxilio ? { border: "2px solid #e74c3c" } : {}}
              />
              {erros.nomeAuxilio && (
                <span style={{ color: "#e74c3c", fontSize: 13 }}>
                  {erros.nomeAuxilio}
                </span>
              )}
            </div>

            <button
              type="button"
              className="consulta-beneficiados-buscar cadastro-auxilios-search-button"
              onClick={handleBuscarAuxilio}
            >
              <FaSearch className="consulta-beneficiados-search-icon" /> Buscar
            </button>
          </div>

          <button
            className="cadastro-filhos-btn-row"
            type="submit"
            style={{ marginTop: 16 }}
            disabled={carregando}
          >
            {carregando ? "Processando..." : "Salvar"}
          </button>
        </form>

        {carregando && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            Processando...
          </div>
        )}

        <Modal
          isOpen={modalCampos}
          onClose={() => setModalCampos(false)}
          texto="Preencha todos os campos antes de salvar."
          showClose={true}
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
            "Auxílio não encontrado!\nDeseja criar e adicionar este novo auxílio?"
          }
          showClose={true}
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
          onClose={() => setModalSucesso(false)}
          texto={"Auxílio cadastrado com sucesso!"}
          showClose={true}
          botoes={[{ texto: "OK", onClick: () => setModalSucesso(false) }]}
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
