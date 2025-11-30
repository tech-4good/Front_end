import { useEffect, useState } from "react";
import { masks } from "../utils/masks";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

import Input from "../components/Input";
import Select from "../components/Select";
import Botao from "../components/Botao";
import Modal from "../components/Modal";
import { beneficiadoService } from "../services/beneficiadoService";
import CadastroQuantidadePessoas from "./CadastroQuantidadePessoas";
import "../styles/CadastroEndereco2.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import iconeVoltar from "../assets/icone-voltar.png";

export default function CadastroEndereco2() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state?.formData || {};

  const [formData, setFormData] = useState({
    ...initialData,
    datadeentrada: initialData.datadeentrada || "",
    datadesada: initialData.datadesada || "",
    moradia: initialData.moradia || "",
    tipodemoradia: initialData.tipodemoradia || "Apartamento",
    tipodecesta: initialData.tipodecesta || "Kit",
    status: initialData.status || "Disponível",
    quantidadedecriancas: initialData.quantidadedecriancas || "",
    quantidadedeadolescentes: initialData.quantidadedeadolescentes || "",
    quantidadedejovens: initialData.quantidadedejovens || "",
    quantidadedeidosos: initialData.quantidadedeidosos || "",
    quantidadedegestantes: initialData.quantidadedegestantes || "",
    quantidadededeficientes: initialData.quantidadededeficientes || "",
    quantidadedeoutros: initialData.quantidadedeoutros || "",
  });

  const [loading, setCadastrando] = useState(false);
  const [enderecoId, setEnderecoId] = useState(null);
  
  // Sistema de modal unificado com timeout
  const [modalGeral, setModalGeral] = useState({ open: false, mensagem: "" });
  const [modalTimeout, setModalTimeout] = useState(null);
  
  const mostrarModal = (mensagem) => {
    setModalGeral({ open: true, mensagem });
    if (modalTimeout) clearTimeout(modalTimeout);
    const timeout = setTimeout(() => setModalGeral({ open: false, mensagem: "" }), 5000);
    setModalTimeout(timeout);
  };

  const handleInputChange = (field, value, maskType = null) => {
    let processedValue = value;

    if (maskType && masks[maskType]) {
      processedValue = masks[maskType](value);
    }

    // Validação para campos de texto - apenas letras e espaços únicos
    if (["moradia"].includes(field)) {
      // Remove caracteres que não são letras ou espaços
      processedValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
      // Remove espaços duplos ou múltiplos
      processedValue = processedValue.replace(/\s+/g, ' ');
      // Remove espaço no início
      if (processedValue.startsWith(' ')) {
        processedValue = processedValue.substring(1);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));
  };

  // Função para converter data DD/MM/AAAA para YYYY-MM-DD
  const convertDateToISO = (dateStr) => {
    if (!dateStr || dateStr.length !== 10) return null;
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Função para preparar dados para o backend
  const prepararDadosEndereco = () => {
    const dados = {
      rua: formData.rua || "",
      numero: formData.numero && formData.numero.trim() !== "" ? formData.numero.trim() : "",
      complemento: formData.complemento || "",
      bairro: formData.bairro || "",
      cidade: formData.cidade || "",
      estado: formData.estado || "",
      cep: formData.cep || "",
      dataEntrada: convertDateToISO(formData.datadeentrada),
      dataSaida: formData.datadesada && formData.datadesada.trim() !== "" ? convertDateToISO(formData.datadesada) : null,
      tipoMoradia: formData.tipodemoradia || "",
      statusMoradia: formData.moradia || "",
      tipoCesta: formData.tipodecesta === "Cesta Básica" ? "BASICA" : 
                 formData.tipodecesta === "Kit" ? "KIT" : 
                 "KIT", // default
      statusCesta: formData.status || "Disponível"
    };
    
    return dados;
  };

  // Função para realizar o cadastro no backend
  const realizarCadastroEndereco = async () => {
    setCadastrando(true);
    
    try {
      const dadosEndereco = prepararDadosEndereco();
      
      const response = await beneficiadoService.cadastrarEndereco(dadosEndereco);
      
      if (response.success) {
        setEnderecoId(response.data.id);
        
        // Cadastrar dados na tabela tipo_morador
        const cpfBeneficiado = sessionStorage.getItem("cpfSelecionado");
        const beneficiadoId = sessionStorage.getItem("beneficiadoId");
        
        if (cpfBeneficiado && response.data.id) {
          const dadosTipoMorador = {
            quantidade_crianca: parseInt(formData.quantidadedecriancas) || 0,
            quantidade_adolescente: parseInt(formData.quantidadedeadolescentes) || 0,
            quantidade_jovem: parseInt(formData.quantidadedejovens) || 0,
            quantidade_idoso: parseInt(formData.quantidadedeidosos) || 0,
            quantidade_gestante: parseInt(formData.quantidadedegestantes) || 0,
            quantidade_deficiente: parseInt(formData.quantidadededeficientes) || 0,
            quantidade_outros: parseInt(formData.quantidadedeoutros) || 0,
            fk_beneficiado: beneficiadoId ? parseInt(beneficiadoId) : null,
            fk_cpf: cpfBeneficiado.replace(/\D/g, ''),
            fk_endereco: response.data.id
          };
          
          await beneficiadoService.cadastrarTipoMorador(dadosTipoMorador);
        }
        
        return true;
      } else {
        mostrarModal(response.error || 'Erro ao cadastrar endereço.');
        return false;
      }
    } catch (error) {
      mostrarModal('Erro inesperado. Tente novamente.');
      return false;
    } finally {
      setCadastrando(false);
    }
  };

  const validateStep2 = () => {
    const camposObrigatorios = [
      { key: "datadeentrada", name: "Data de Entrada" },
      { key: "moradia", name: "Moradia" },
      { key: "tipodemoradia", name: "Tipo de Moradia" },
      { key: "tipodecesta", name: "Tipo de Cesta" },
      { key: "status", name: "Status" }
    ];
    
    const camposVazios = [];
    
    for (let campo of camposObrigatorios) {
      if (!formData[campo.key] || formData[campo.key].trim() === "") {
        camposVazios.push(campo.name);
      }
    }
    
    if (camposVazios.length > 0) {
      const mensagem = camposVazios.length === 1 
        ? `O campo ${camposVazios[0]} é obrigatório.`
        : `Os seguintes campos são obrigatórios:\n\n• ${camposVazios.join("\n• ")}`;
      mostrarModal(mensagem);
      return false;
    }

    return true;
  };

  const validateQuantidades = () => {
    const quantidadeFields = [
      { key: "quantidadedecriancas", name: "Quantidade de Crianças" },
      { key: "quantidadedegestantes", name: "Quantidade de Gestantes" },
      { key: "quantidadedeadolescentes", name: "Quantidade de Adolescentes" },
      { key: "quantidadededeficientes", name: "Quantidade de Deficientes" },
      { key: "quantidadedejovens", name: "Quantidade de Jovens" },
      { key: "quantidadedeidosos", name: "Quantidade de Idosos" },
      { key: "quantidadedeoutros", name: "Quantidade de Outros" }
    ];
    
    const hasQuantidade = quantidadeFields.some(field => {
      const value = formData[field.key];
      return value && value.trim() !== "" && value !== "0";
    });
    
    if (!hasQuantidade) {
      mostrarModal("Preencha pelo menos uma quantidade de pessoas.");
      return false;
    }

    return true;
  };

  const [page, setPage] = useState(2);

  const handleRegister = async () => {
    if (page === 2) {
      if (!validateStep2()) return;
      mostrarModal("Indo para o cadastro de quantidade de pessoas!");
      setTimeout(() => {
        setPage(4);
      }, 3000);
    } else if (page === 4) {
      if (!validateQuantidades()) return;
      
      const sucesso = await realizarCadastroEndereco();
      if (sucesso) {
        mostrarModal("Quantidade de pessoas enviado com sucesso!");
        setTimeout(() => {
          navigate("/home");
        }, 3000);
      }
    }
  };

  const handlePreviousPage = () => {
    if (page === 2) {
      navigate("/cadastro-endereco-1", { state: { formData } });
    } else if (page === 4) {
      setPage(2);
    }
  };

  const [tipoUsuario, setTipoUsuario] = useState("2");
  useEffect(() => {
    const tipo = sessionStorage.getItem("tipoUsuario") || "2";
    setTipoUsuario(tipo);
  }, []);

  const botoesNavbar = [
    { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
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

  return (
    <div className="cadastro-endereco2-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isCadastroEnderecoPage={true} />
      
      {page === 2 && (
        <div className="cadastro-endereco2-container">
          <img 
            src={iconeVoltar} 
            alt="Voltar" 
            className="cadastro-endereco2-icone-voltar"
            onClick={handlePreviousPage}
          />
          
          <h1 className="cadastro-endereco2-title">Cadastro de Endereço</h1>
          
          {/* Indicador de progresso */}
          <div className="cadastro-endereco2-progress-container">
            <div className="cadastro-endereco2-progress-step completed">
              <div className="cadastro-endereco2-progress-circle"></div>
              <span className="cadastro-endereco2-progress-label">Passo 1</span>
            </div>
            <div className="cadastro-endereco2-progress-line completed"></div>
            <div className="cadastro-endereco2-progress-step active">
              <div className="cadastro-endereco2-progress-circle"></div>
              <span className="cadastro-endereco2-progress-label">Passo 2</span>
            </div>
          </div>
          
          <form className="cadastro-endereco2-form" onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
            {/* Data de Entrada e Data de Saída */}
            <div className="cadastro-endereco2-row">
              <div className="cadastro-endereco2-field">
                <label className="cadastro-endereco2-label">Data de Entrada:</label>
                <Input
                  type="text"
                  value={formData.datadeentrada || ""}
                  onChange={(e) => handleInputChange("datadeentrada", e.target.value, "date")}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  className="cadastro-endereco2-input"
                />
              </div>
              <div className="cadastro-endereco2-field">
                <label className="cadastro-endereco2-label">Data de Saída:</label>
                <Input
                  type="text"
                  value={formData.datadesada || ""}
                  onChange={(e) => handleInputChange("datadesada", e.target.value, "date")}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  className="cadastro-endereco2-input cadastro-endereco2-input-highlight"
                />
              </div>
            </div>

            {/* Moradia e Tipo de Moradia */}
            <div className="cadastro-endereco2-row">
              <div className="cadastro-endereco2-field">
                <label className="cadastro-endereco2-label">Moradia:</label>
                <Input
                  type="text"
                  value={formData.moradia || ""}
                  onChange={(e) => handleInputChange("moradia", e.target.value)}
                  placeholder="Quitada"
                  className="cadastro-endereco2-input"
                />
              </div>
              <div className="cadastro-endereco2-field cadastro-endereco2-field-tipo-moradia">
                <label className="cadastro-endereco2-label">Tipo de Moradia:</label>
                <Select
                  options={[
                    { value: "Apartamento", label: "Apartamento" },
                    { value: "Casa", label: "Casa" },
                    { value: "Sobrado", label: "Sobrado" },
                    { value: "Kitnet", label: "Kitnet" },
                    { value: "Outros", label: "Outros" }
                  ]}
                  value={formData.tipodemoradia || ""}
                  onChange={(e) => handleInputChange("tipodemoradia", e.target.value)}
                  placeholder="Selecione o tipo"
                  className="cadastro-endereco2-select"
                />
              </div>
            </div>

            {/* Tipo de Cesta e Status */}
            <div className="cadastro-endereco2-row">
              <div className="cadastro-endereco2-field cadastro-endereco2-field-tipo-cesta">
                <label className="cadastro-endereco2-label">Tipo de Cesta:</label>
                <Select
                  options={[
                    { value: "Kit", label: "Kit" },
                    { value: "Cesta Básica", label: "Cesta Básica" }
                  ]}
                  value={formData.tipodecesta || ""}
                  onChange={(e) => handleInputChange("tipodecesta", e.target.value)}
                  placeholder="Selecione o tipo"
                  className="cadastro-endereco2-select"
                />
              </div>
              <div className="cadastro-endereco2-field cadastro-endereco2-field-status">
                <label className="cadastro-endereco2-label">Status:</label>
                <Select
                  options={[
                    { value: "Disponível", label: "Disponível" },
                    { value: "Ocupado", label: "Ocupado" },
                    { value: "Indisponível", label: "Indisponível" }
                  ]}
                  value={formData.status || ""}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  placeholder="Selecione o status"
                  className="cadastro-endereco2-select"
                />
              </div>
            </div>

            <div className="cadastro-endereco2-botoes">
              <Botao 
                texto="Voltar" 
                onClick={handlePreviousPage}
                className="cadastro-endereco2-btn-voltar"
              />
              <Botao 
                texto={loading ? "Cadastrando..." : "Próximo"} 
                type="submit" 
                className="cadastro-endereco2-btn" 
                disabled={loading}
              />
            </div>
          </form>
        </div>
      )}

      {page === 4 && (
        <CadastroQuantidadePessoas 
          formData={formData}
          handleInputChange={handleInputChange}
          loading={loading}
          onSubmit={handleRegister}
        />
      )}

      {/* Modal unificado com timeout de 3 segundos */}
      <Modal
        isOpen={modalGeral.open}
        texto={modalGeral.mensagem}
        showClose={false}
      />
    </div>
  );
}
