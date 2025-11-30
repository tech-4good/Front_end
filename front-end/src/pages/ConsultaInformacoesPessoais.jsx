import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import { beneficiadoService } from "../services/beneficiadoService";
import { getFotoBlobUrl } from "../services/fileService";
import "../styles/ConsultaInformacoesPessoais.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import iconeVoltar from "../assets/icone-voltar.png";

export default function ConsultaInformacoesPessoais() {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [beneficiado, setBeneficiado] = useState(null);
  const [fotoBlobUrl, setFotoBlobUrl] = useState(null);
  const [carregandoFoto, setCarregandoFoto] = useState(false);

  const formatRenda = (value) => {
    let v = value.replace(/\D/g, "");
    if (!v) return "";
    v = v.replace(/^0+(?!$)/, "");
    if (v.length < 3) v = v.padStart(3, "0");
    let reais = v.slice(0, -2);
    let centavos = v.slice(-2);
    reais = reais ? reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "0";
    return `R$ ${reais},${centavos}`;
  };
  const formatRG = (value) => {
    let v = value.replace(/\D/g, "");
    v = v.slice(0, 9);
    if (v.length <= 2) return v;
    if (v.length <= 5) return `${v.slice(0, 2)}.${v.slice(2)}`;
    if (v.length <= 8) return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5)}`;
    return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}-${v.slice(8)}`;
  };
  const navigate = useNavigate();
  const [tipoUsuario, setTipoUsuario] = useState("2");
  const formatPhone = (value) => {
    let numbers = value.replace(/\D/g, "");
    if (numbers.length > 11) numbers = numbers.slice(0, 11);
    if (numbers.length === 0) return "";
    if (numbers.length < 3) return `(${numbers}`;
    if (numbers.length < 7)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(
        6
      )}`.replace(/-$/, "");
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
      7
    )}`.replace(/-$/, "");
  };

  useEffect(() => {
    const tipo = sessionStorage.getItem("tipoUsuario") || "2";
    setTipoUsuario(tipo);
    carregarBeneficiado();
  }, []);

  // Carregar foto quando beneficiado for carregado
  useEffect(() => {
    const carregarFoto = async () => {
      // Verifica se fotoId existe e é válido (não é null, undefined, 0 ou string vazia)
      if (
        beneficiado?.fotoId &&
        beneficiado.fotoId !== 0 &&
        beneficiado.fotoId !== ""
      ) {
        setCarregandoFoto(true);
        try {
          console.log("📸 Carregando foto ID:", beneficiado.fotoId);
          const blobUrl = await getFotoBlobUrl(beneficiado.fotoId);
          setFotoBlobUrl(blobUrl);
          console.log("✅ Foto carregada com sucesso!");
        } catch (error) {
          console.error("❌ Erro ao carregar foto:", error);
          setFotoBlobUrl(null); // Usar placeholder no render
        } finally {
          setCarregandoFoto(false);
        }
      } else {
        console.log(
          "ℹ️ Beneficiado sem foto cadastrada (fotoId:",
          beneficiado?.fotoId,
          ")"
        );
        setFotoBlobUrl(null); // Garantir que não tem foto
        setCarregandoFoto(false);
      }
    };

    carregarFoto();

    // Cleanup: revogar blob URL quando componente desmontar
    return () => {
      if (fotoBlobUrl) {
        URL.revokeObjectURL(fotoBlobUrl);
      }
    };
  }, [beneficiado?.fotoId]);

  const carregarBeneficiado = async () => {
    setCarregando(true);
    setErro("");

    try {
      const cpfSelecionado = sessionStorage.getItem("cpfSelecionado");
      if (!cpfSelecionado) {
        navigate("/consulta-beneficiados");
        return;
      }

      console.log("Carregando informações pessoais para CPF:", cpfSelecionado);
      const response = await beneficiadoService.buscarPorCpf(cpfSelecionado);

      if (response.success) {
        console.log("Dados do beneficiado:", response.data);
        setBeneficiado(response.data);
      } else {
        console.error("Erro ao carregar beneficiado:", response.error);
        setErro(response.error || "Erro ao carregar dados do beneficiado");
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      setErro("Erro inesperado ao carregar dados");
    } finally {
      setCarregando(false);
    }
  };

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

  function getDadosStorage() {
    if (beneficiado) {
      // Converter data de nascimento se vier como array [ano, mes, dia]
      let dataNascimentoFormatada = "";
      if (Array.isArray(beneficiado.dataNascimento)) {
        const [ano, mes, dia] = beneficiado.dataNascimento;
        dataNascimentoFormatada = `${String(dia).padStart(2, "0")}/${String(
          mes
        ).padStart(2, "0")}/${ano}`;
      } else if (beneficiado.dataNascimento) {
        dataNascimentoFormatada = beneficiado.dataNascimento;
      }

      // Formatar renda se existir
      let rendaFormatada = "";
      if (beneficiado.renda) {
        const rendaNum = parseFloat(beneficiado.renda);
        if (!isNaN(rendaNum)) {
          rendaFormatada = `R$ ${rendaNum.toFixed(2).replace(".", ",")}`;
        }
      }

      return {
        nome: beneficiado.nome || "",
        cpf: beneficiado.cpf || "",
        rg: beneficiado.rg || "",
        nascimento: dataNascimentoFormatada,
        telefone: beneficiado.telefone || "",
        escolaridade: beneficiado.escolaridade || "",
        profissao: beneficiado.profissao || "",
        empresa: beneficiado.empresa || "",
        dependentes: beneficiado.dependentes || beneficiado.qtdDependentes || 0,
        estadoCivil: beneficiado.estadoCivil || "",
        religiao: beneficiado.religiao || "",
        renda: rendaFormatada,
        cargo: beneficiado.cargo || "",
        fotoId: beneficiado.fotoId || null, // ✅ ID numérico da foto (campo correto do backend)
      };
    }

    // Fallback para quando ainda não carregou
    return {
      nome: "",
      cpf: "",
      rg: "",
      nascimento: "",
      telefone: "",
      escolaridade: "",
      profissao: "",
      empresa: "",
      dependentes: 0,
      estadoCivil: "",
      religiao: "",
      renda: "",
      cargo: "",
      foto: null,
    };
  }

  const [dadosOriginais, setDadosOriginais] = useState(getDadosStorage());
  const [dados, setDados] = useState(getDadosStorage());

  // Atualizar estados quando beneficiado carregar
  useEffect(() => {
    if (beneficiado) {
      const novosdados = getDadosStorage();
      setDadosOriginais(novosdados);
      setDados(novosdados);

      // Carregar auxílios do beneficiado
      if (beneficiado.auxilios && Array.isArray(beneficiado.auxilios)) {
        setAuxilios(beneficiado.auxilios.map((a) => a.nome || a.tipo || a));
      } else if (beneficiado.auxilios) {
        // Caso seja um objeto ou string
        setAuxilios([beneficiado.auxilios]);
      } else {
        // Caso não tenha auxílios, manter vazio
        setAuxilios([]);
      }
    }
  }, [beneficiado]);

  // Auto-close modal without buttons after 3 seconds
  useEffect(() => {
    if (modalExcluidoSucesso) {
      const timer = setTimeout(() => {
        setModalExcluidoSucesso(false);
        navigate("/consulta-beneficiados");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [modalExcluidoSucesso, navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "cpf") {
      let v = value.replace(/\D/g, "");
      v = v.slice(0, 11);
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
      v = v.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
      setDados((prev) => ({ ...prev, cpf: v }));
    } else if (name === "rg") {
      setDados((prev) => ({ ...prev, rg: formatRG(value) }));
    } else if (name === "telefone") {
      setDados((prev) => ({ ...prev, telefone: formatPhone(value) }));
    } else if (name === "nascimento") {
      let v = value.replace(/\D/g, "");
      v = v.slice(0, 8);
      v = v.replace(/(\d{2})(\d)/, "$1/$2");
      v = v.replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
      setDados((prev) => ({ ...prev, nascimento: v }));
    } else if (name === "renda") {
      setDados((prev) => ({ ...prev, renda: formatRenda(value) }));
    } else if (name === "dependentes") {
      setDados((prev) => ({
        ...prev,
        dependentes: value.replace(/[^0-9]/g, ""),
      }));
    } else {
      setDados((prev) => ({ ...prev, [name]: value }));
    }
  }

  const [auxilios, setAuxilios] = useState([]);

  const [modalEscolherAuxilio, setModalEscolherAuxilio] = useState(false);
  const [auxilioParaExcluir, setAuxilioParaExcluir] = useState(null);
  const [modalConfirmarExclusao, setModalConfirmarExclusao] = useState(false);

  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [alteracaoConfirmada, setAlteracaoConfirmada] = useState(false);

  const [modalExcluirBeneficiado, setModalExcluirBeneficiado] = useState(false);
  const [modalExcluidoSucesso, setModalExcluidoSucesso] = useState(false);

  function handleAlterarClick() {
    setModalConfirmar(true);
  }

  async function handleConfirmarSim() {
    setModalConfirmar(false);
    setCarregando(true);

    try {
      const beneficiadoId = beneficiado.id || beneficiado.idBeneficiado;
      if (!beneficiadoId) {
        setErro("ID do beneficiado não encontrado");
        return;
      }

      // Converter data de DD/MM/YYYY para YYYY-MM-DD
      let dataNascimento = dados.nascimento;
      if (dataNascimento && dataNascimento.includes("/")) {
        const [dia, mes, ano] = dataNascimento.split("/");
        dataNascimento = `${ano}-${mes.padStart(2, "0")}-${dia.padStart(
          2,
          "0"
        )}`;
      }

      // Extrair valor numérico da renda (remover R$ e formatação)
      let rendaMensal = 0;
      if (dados.renda) {
        const rendaNum = dados.renda.replace(/[R$\s.]/g, "").replace(",", ".");
        rendaMensal = parseFloat(rendaNum) || 0;
      }

      const dadosAtualizados = {
        nome: dados.nome,
        cpf: dados.cpf,
        rg: dados.rg,
        dataNascimento: dataNascimento,
        telefone: dados.telefone,
        escolaridade: dados.escolaridade,
        profissao: dados.profissao,
        empresa: dados.empresa,
        estadoCivil: dados.estadoCivil,
        religiao: dados.religiao,
        rendaMensal: rendaMensal,
        cargo: dados.cargo,
        quantidadeDependentes: parseInt(dados.dependentes) || 0,
        enderecoId: beneficiado.enderecoId || beneficiado.endereco?.id,
      };

      console.log(
        "Atualizando beneficiado ID:",
        beneficiadoId,
        "com dados:",
        dadosAtualizados
      );
      const response = await beneficiadoService.atualizarBeneficiado(
        beneficiadoId,
        dadosAtualizados
      );

      if (response.success) {
        setDadosOriginais(dados);
        setAlteracaoConfirmada(true);
        setTimeout(() => setAlteracaoConfirmada(false), 2000);
      } else {
        setErro(response.error || "Erro ao atualizar informações");
      }
    } catch (error) {
      console.error("Erro ao atualizar informações:", error);
      setErro("Erro inesperado ao atualizar informações");
    } finally {
      setCarregando(false);
    }
  }

  function handleConfirmarNao() {
    setModalConfirmar(false);
    setDados(getDadosStorage());
    window.location.reload();
  }

  async function handleExcluirBeneficiado() {
    setModalExcluirBeneficiado(false);
    setCarregando(true);

    try {
      const beneficiadoId = beneficiado.id || beneficiado.idBeneficiado;
      if (!beneficiadoId) {
        setErro("ID do beneficiado não encontrado");
        return;
      }

      console.log("Excluindo beneficiado ID:", beneficiadoId);
      const response = await beneficiadoService.removerBeneficiado(
        beneficiadoId
      );

      if (response.success) {
        setModalExcluidoSucesso(true);
        setTimeout(() => {
          setModalExcluidoSucesso(false);
          navigate("/consulta-beneficiados");
        }, 2000);
      } else {
        setErro(response.error || "Erro ao excluir beneficiado");
      }
    } catch (error) {
      console.error("Erro ao excluir beneficiado:", error);
      setErro("Erro inesperado ao excluir beneficiado");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div>
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isConsultaBeneficiadosPage={true} />
      <div className="consulta-info-container">
        <img 
          src={iconeVoltar} 
          alt="Voltar" 
          className="consulta-info-icone-voltar"
          onClick={() => navigate("/consulta-beneficiados-menu")}
        />
        <h1 className="consulta-info-title">Informações Pessoais</h1>

        {carregando && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>Carregando informações do beneficiado...</p>
          </div>
        )}

        {erro && (
          <div
            style={{ textAlign: "center", padding: "20px", color: "#e74c3c" }}
          >
            <p>{erro}</p>
            <button
              onClick={carregarBeneficiado}
              style={{ marginTop: "10px", padding: "8px 16px" }}
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {!carregando && !erro && beneficiado && (
          <>
            <form className="consulta-info-form" onSubmit={(e) => { e.preventDefault(); handleAlterarClick(); }}>
              {/* Primeira linha - Foto (centralizada) */}
              <div className="consulta-info-row consulta-info-row-single">
                <div className="consulta-info-field" style={{ alignItems: 'center' }}>
                  <label className="consulta-info-label" style={{ textAlign: 'center' }}>Foto do Beneficiado:</label>
                  <div className="consulta-info-foto" style={{ margin: '0 auto' }}>
                    {carregandoFoto ? (
                      <div className="consulta-info-foto-loading">
                        <span>Carregando foto...</span>
                      </div>
                    ) : fotoBlobUrl ? (
                      <img
                        src={fotoBlobUrl}
                        alt="Foto do Beneficiado"
                        className="consulta-info-foto-img"
                        onError={(e) => {
                          console.log("❌ Erro ao exibir foto - Usando placeholder");
                          e.target.parentElement.innerHTML = '<div class="consulta-info-foto-placeholder"><span>📷</span><span>Erro ao carregar foto</span></div>';
                        }}
                      />
                    ) : (
                      <div className="consulta-info-foto-placeholder">
                        <span>📷</span>
                        <span>Sem foto cadastrada</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Segunda linha - Nome, CPF, RG */}
              <div className="consulta-info-row consulta-info-row-triple">
                <div className="consulta-info-field">
                  <label className="consulta-info-label">Nome Completo:</label>
                  <input
                    type="text"
                    name="nome"
                    value={dados.nome}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
                      value = value.replace(/\s{2,}/g, ' ');
                      setDados(prev => ({ ...prev, nome: value }));
                    }}
                    className="consulta-info-input"
                    placeholder="Insira o nome completo"
                  />
                </div>
                <div className="consulta-info-field">
                  <label className="consulta-info-label">CPF:</label>
                  <input
                    type="text"
                    name="cpf"
                    value={dados.cpf}
                    onChange={handleChange}
                    maxLength={14}
                    className="consulta-info-input"
                    placeholder="000.000.000-00"
                    onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                  />
                </div>
                <div className="consulta-info-field">
                  <label className="consulta-info-label">RG:</label>
                  <input
                    type="text"
                    name="rg"
                    value={dados.rg}
                    onChange={handleChange}
                    maxLength={12}
                    className="consulta-info-input"
                    placeholder="00.000.000-0"
                    onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                  />
                </div>
              </div>

              {/* Terceira linha - Data Nascimento, Telefone, Estado Civil */}
              <div className="consulta-info-row consulta-info-row-triple">
                <div className="consulta-info-field">
                  <label className="consulta-info-label">Data de Nascimento:</label>
                  <input
                    type="text"
                    name="dataNascimento"
                    value={dados.dataNascimento}
                    onChange={(e) => {
                      const formatDate = (value) => {
                        let numbers = value.replace(/\D/g, "");
                        if (numbers.length > 8) numbers = numbers.slice(0, 8);
                        if (numbers.length <= 2) return numbers;
                        if (numbers.length <= 4) return numbers.replace(/(\d{2})(\d{0,2})/, "$1/$2");
                        return numbers.replace(/(\d{2})(\d{2})(\d{0,4})/, "$1/$2/$3");
                      };
                      const formattedValue = formatDate(e.target.value);
                      setDados(prev => ({ ...prev, dataNascimento: formattedValue }));
                    }}
                    maxLength={10}
                    className="consulta-info-input"
                    placeholder="dd/mm/aaaa"
                  />
                </div>
                <div className="consulta-info-field">
                  <label className="consulta-info-label">Telefone:</label>
                  <input
                    type="text"
                    name="telefone"
                    value={dados.telefone}
                    onChange={handleChange}
                    maxLength={15}
                    className="consulta-info-input"
                    placeholder="(11) 99999-9999"
                    onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                  />
                </div>
                <div className="consulta-info-field">
                  <label className="consulta-info-label">Estado Civil:</label>
                  <input
                    type="text"
                    name="estadoCivil"
                    value={dados.estadoCivil}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
                      value = value.replace(/\s{2,}/g, ' ');
                      setDados(prev => ({ ...prev, estadoCivil: value }));
                    }}
                    className="consulta-info-input"
                    placeholder="Ex: Solteiro, Casado, etc."
                  />
                </div>
              </div>

              {/* Quarta linha - Religião, Escolaridade, Profissão */}
              <div className="consulta-info-row consulta-info-row-triple">
                <div className="consulta-info-field">
                  <label className="consulta-info-label">Religião:</label>
                  <input
                    type="text"
                    name="religiao"
                    value={dados.religiao}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
                      value = value.replace(/\s{2,}/g, ' ');
                      setDados(prev => ({ ...prev, religiao: value }));
                    }}
                    className="consulta-info-input"
                    placeholder="Ex: Católica, Evangélica, etc."
                  />
                </div>
                <div className="consulta-info-field">
                  <label className="consulta-info-label">Escolaridade:</label>
                  <input
                    type="text"
                    name="escolaridade"
                    value={dados.escolaridade}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
                      value = value.replace(/\s{2,}/g, ' ');
                      setDados(prev => ({ ...prev, escolaridade: value }));
                    }}
                    className="consulta-info-input"
                    placeholder="Escolaridade"
                  />
                </div>
                <div className="consulta-info-field">
                  <label className="consulta-info-label">Profissão:</label>
                  <input
                    type="text"
                    name="profissao"
                    value={dados.profissao}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
                      value = value.replace(/\s{2,}/g, ' ');
                      setDados(prev => ({ ...prev, profissao: value }));
                    }}
                    className="consulta-info-input"
                    placeholder="Ex: Vendedor, Autônomo, etc."
                  />
                </div>
              </div>

              {/* Quinta linha - Quantidade de Dependentes, Cargo, Renda */}
              <div className="consulta-info-row consulta-info-row-triple">
                <div className="consulta-info-field">
                  <label className="consulta-info-label">Quantidade de Dependentes:</label>
                  <input
                    type="text"
                    name="dependentes"
                    value={dados.dependentes}
                    onChange={handleChange}
                    className="consulta-info-input"
                    placeholder="0"
                    maxLength={2}
                    pattern="[0-9]*"
                    onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                  />
                </div>
                <div className="consulta-info-field">
                  <label className="consulta-info-label">Cargo:</label>
                  <input
                    type="text"
                    name="cargo"
                    value={dados.cargo}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
                      value = value.replace(/\s{2,}/g, ' ');
                      setDados(prev => ({ ...prev, cargo: value }));
                    }}
                    className="consulta-info-input"
                    placeholder="Cargo na empresa"
                  />
                </div>
                <div className="consulta-info-field">
                  <label className="consulta-info-label">Renda Mensal:</label>
                  <input
                    type="text"
                    name="renda"
                    value={dados.renda}
                    onChange={handleChange}
                    maxLength={15}
                    className="consulta-info-input"
                    placeholder="R$ 0,00"
                    onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                  />
                </div>
              </div>

              {/* Sexta linha - Empresa (largura total) */}
              <div className="consulta-info-row consulta-info-row-single">
                <div className="consulta-info-field">
                  <label className="consulta-info-label">Empresa:</label>
                  <input
                    type="text"
                    name="empresa"
                    value={dados.empresa}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
                      value = value.replace(/\s{2,}/g, ' ');
                      setDados(prev => ({ ...prev, empresa: value }));
                    }}
                    className="consulta-info-input"
                    placeholder="Nome da empresa"
                  />
                </div>
              </div>

              <div className="consulta-info-botoes-principais">
                <button className="consulta-info-btn" type="submit">
                  Alterar Informações
                </button>
                <button
                  type="button"
                  className="consulta-info-botao-danger"
                  onClick={() => setModalExcluirBeneficiado(true)}
                >
                  Excluir Beneficiado
                </button>
              </div>
            </form>
            <div className="consulta-info-divisor"></div>
            <h2 className="consulta-info-subtitle">Auxílios Governamentais</h2>
            <div className="consulta-info-auxilios">
              {auxilios.length > 0 ? auxilios.map((a, i) => (
                <div key={i} className="consulta-info-auxilio">
                  {a}
                </div>
              )) : (
                <div className="consulta-info-no-auxilios">
                  Nenhum auxílio governamental cadastrado
                </div>
              )}
            </div>
            <div className="consulta-info-botoes">
              <button
                className="consulta-info-botao-secundario"
                onClick={() => navigate("/cadastro-auxilios")}
              >
                Cadastrar Auxílio
              </button>
              <button
                className="consulta-info-botao-secundario"
                onClick={() => setModalEscolherAuxilio(true)}
              >
                Excluir Auxílio
              </button>
            </div>
            {/* Modal de confirmação de alteração */}
            <Modal
              isOpen={modalConfirmar}
              onClose={handleConfirmarNao}
              texto={"Tem certeza que deseja alterar as informações?"}
              showClose={false}
              botoes={[
                {
                  texto: "Sim",
                  onClick: handleConfirmarSim,
                },
                {
                  texto: "Não",
                  onClick: handleConfirmarNao,
                },
              ]}
            />

            {/* Modal de confirmação de exclusão de beneficiado */}
            <Modal
              isOpen={modalExcluirBeneficiado}
              onClose={() => setModalExcluirBeneficiado(false)}
              texto={"Tem certeza que deseja excluir o beneficiado?"}
              showClose={false}
              botoes={[
                {
                  texto: "Sim",
                  onClick: handleExcluirBeneficiado,
                  style: {
                    background: "#fff",
                    color: "#111",
                    border: "2px solid #111",
                  },
                },
                {
                  texto: "Não",
                  onClick: () => setModalExcluirBeneficiado(false),
                  style: {
                    background: "#111",
                    color: "#fff",
                    border: "2px solid #111",
                  },
                },
              ]}
            />

            {/* Modal de sucesso ao excluir beneficiado */}
            <Modal
              isOpen={modalExcluidoSucesso}
              onClose={() => {
                setModalExcluidoSucesso(false);
                navigate("/consulta-beneficiados");
              }}
              texto={"Beneficiado excluído com sucesso!"}
              showClose={false}
            />

            {/* Modal para escolher qual auxílio excluir */}
            <Modal
              isOpen={modalEscolherAuxilio}
              onClose={() => setModalEscolherAuxilio(false)}
              texto={"Selecione o auxílio que deseja excluir:"}
              showClose={false}
              botoes={auxilios.map((a) => ({
                texto: a,
                onClick: () => {
                  setAuxilioParaExcluir(a);
                  setModalEscolherAuxilio(false);
                  setModalConfirmarExclusao(true);
                },
              }))}
            />

            {/* Modal de confirmação de exclusão do auxílio */}
            <Modal
              isOpen={modalConfirmarExclusao}
              onClose={() => setModalConfirmarExclusao(false)}
              texto={`Deseja realmente excluir o auxílio "${auxilioParaExcluir}"?`}
              showClose={false}
              botoes={[
                {
                  texto: "Sim",
                  onClick: () => {
                    setAuxilios(
                      auxilios.filter((a) => a !== auxilioParaExcluir)
                    );
                    setModalConfirmarExclusao(false);
                    setAuxilioParaExcluir(null);
                  },
                },
                {
                  texto: "Não",
                  onClick: () => {
                    setModalConfirmarExclusao(false);
                    setAuxilioParaExcluir(null);
                  },
                },
              ]}
            />
            {/* Modal de feedback de alteração confirmada */}
            <Modal
              isOpen={alteracaoConfirmada}
              onClose={() => setAlteracaoConfirmada(false)}
              texto={"Informações alteradas com sucesso!"}
              showClose={false}
            />
          </>
        )}
        
        {/* Modal de feedback de alteração confirmada */}
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 2000 }}>
          <Modal
            isOpen={alteracaoConfirmada}
            onClose={() => setAlteracaoConfirmada(false)}
            texto={"Informações alteradas com sucesso!"}
            showClose={false}
          />
        </div>
      </div>
    </div>
  );
}
