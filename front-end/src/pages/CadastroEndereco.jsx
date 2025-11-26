import { useEffect, useState } from "react";
import { inputsFirstStep, inputsSecondStep, inputsQuantidadePessoas } from "../utils/cadastroEndereco";
import { masks } from "../utils/masks";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MenuEndereco from "../components/MenuEndereco";



import Input from "../components/Input";
import Select from "../components/Select";
import Botao from "../components/Botao";
import Modal from "../components/Modal";
import { beneficiadoService } from "../services/beneficiadoService";
import { enderecoService } from "../services/enderecoService";
import "../styles/CadastroEndereco.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import iconeVoltar from "../assets/icone-voltar.png";

export default function CadastroEndereco() {
  const [page, setPage] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    datadeentrada: "",
    datadesada: "",
    moradia: "",
    tipodemoradia: "Apartamento",
    tipodecesta: "Kit",
    status: "Disponível",
    quantidadedecriancas: "",
    quantidadedeadolescentes: "",
    quantidadedejovens: "",
    quantidadedeidosos: "",
    quantidadedegestantes: "",
    quantidadededeficientes: "",
    quantidadedeoutros: "",
  });

  const [modalErro, setModalErro] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [loading, setCadastrando] = useState(false);
  const [enderecoId, setEnderecoId] = useState(null);
  
  // Sistema de modal unificado com timeout (igual ao perfil)
  const [modalGeral, setModalGeral] = useState({ open: false, mensagem: "" });
  const [modalTimeout, setModalTimeout] = useState(null);
  
  const mostrarModal = (mensagem) => {
    setModalGeral({ open: true, mensagem });
    if (modalTimeout) clearTimeout(modalTimeout);
    const timeout = setTimeout(() => setModalGeral({ open: false, mensagem: "" }), 5000);
    setModalTimeout(timeout);
  };
  
  // Estados para controle da busca de CEP
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepEncontrado, setCepEncontrado] = useState(false);
  const [camposEditaveis, setCamposEditaveis] = useState(true);

  const handleInputChange = (field, value, maskType = null) => {
    let processedValue = value;

    if (maskType && masks[maskType]) {
      processedValue = masks[maskType](value);
    }

    // Validação específica para o campo número - apenas dígitos e máximo 5 caracteres
    if (field === "numero") {
      processedValue = value.replace(/\D/g, '').slice(0, 5);
    }

    // Validação para campos de texto - apenas letras e espaços únicos
    if (["rua", "bairro", "cidade", "complemento", "moradia"].includes(field)) {
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

  // 🌐 Função para buscar CEP via ViaCep
  const buscarEnderecoPorCep = async (cep) => {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Só busca se tiver 8 dígitos
    if (cepLimpo.length !== 8) {
      return;
    }
    
    setLoadingCep(true);
    setCepEncontrado(false);
    
    try {
      const resultado = await enderecoService.buscarCep(cepLimpo);
      
      if (resultado.success) {
        const dados = resultado.data;
        
        // Extrai apenas a sigla do estado (ex: "SP - São Paulo" → "SP")
        const estadoSigla = dados.estado ? dados.estado.split(' - ')[0].trim() : '';
        
        // Preenche os campos automaticamente
        setFormData((prev) => ({
          ...prev,
          rua: dados.logradouro || '',
          bairro: dados.bairro || '',
          cidade: dados.cidade || '',
          estado: estadoSigla,
          complemento: dados.complemento || prev.complemento // Mantém o que usuário digitou se ViaCep não retornar
        }));
        
        setCepEncontrado(true);
        
        // Se algum campo vier vazio, permite edição
        if (!dados.logradouro || !dados.bairro) {
          setCamposEditaveis(true);
        } else {
          setCamposEditaveis(false);
        }
        
        // Feedback visual de sucesso (opcional)
        // Você pode adicionar uma mensagem de sucesso aqui se quiser
        
      }
    } catch (error) {
      console.error('❌ Erro ao buscar CEP:', error);
      setMensagemErro(error.message || 'Erro ao buscar CEP. Preencha manualmente.');
      setModalErro(true);
      
      // Permite edição manual em caso de erro
      setCamposEditaveis(true);
      
      // Limpa os campos preenchidos automaticamente
      setFormData((prev) => ({
        ...prev,
        rua: '',
        bairro: '',
        cidade: '',
        estado: ''
      }));
    } finally {
      setLoadingCep(false);
    }
  };

  // 🔄 Effect para buscar CEP automaticamente quando usuário digitar 8 dígitos
  useEffect(() => {
    const cepLimpo = formData.cep.replace(/\D/g, '');
    
    if (cepLimpo.length === 8) {
      buscarEnderecoPorCep(formData.cep);
    } else {
      // Se CEP for apagado ou incompleto, permite edição de todos os campos
      setCamposEditaveis(true);
      setCepEncontrado(false);
    }
  }, [formData.cep]);

  // Função para converter data DD/MM/AAAA para YYYY-MM-DD
  const convertDateToISO = (dateStr) => {
    if (!dateStr || dateStr.length !== 10) return null;
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Função para preparar dados para o backend
  const prepararDadosEndereco = () => {
    console.log('=== DEBUG PREPARAR DADOS ===');
    console.log('formData completo:', formData);
    console.log('formData.rua:', formData.rua, '(tipo:', typeof formData.rua, ')');
    console.log('formData.numero:', formData.numero, '(tipo:', typeof formData.numero, ')');
    console.log('formData.datadeentrada:', formData.datadeentrada);
    console.log('formData.datadesada:', formData.datadesada);
    
    const dados = {
      rua: formData.rua || "",
      numero: formData.numero && formData.numero.trim() !== "" ? formData.numero.trim() : "", // Garantir que não seja null e trim espaços
      complemento: formData.complemento || "",
      bairro: formData.bairro || "",
      cidade: formData.cidade || "",
      estado: formData.estado || "",
      cep: formData.cep || "",
      dataEntrada: convertDateToISO(formData.datadeentrada),
      dataSaida: formData.datadesada && formData.datadesada.trim() !== "" ? convertDateToISO(formData.datadesada) : null, // Incluir data de saída apenas se preenchida
      tipoMoradia: formData.tipodemoradia || "",
      statusMoradia: formData.moradia || "",
      tipoCesta: formData.tipodecesta === "Cesta Básica" ? "BASICA" : 
                 formData.tipodecesta === "Kit" ? "KIT" : 
                 "KIT", // default
      statusCesta: formData.status || "Disponível"
    };
    
    console.log('=== DADOS PREPARADOS ===');
    console.log('dados.rua:', dados.rua);
    console.log('dados.numero:', dados.numero);
    console.log('dados.dataEntrada:', dados.dataEntrada);
    console.log('dados.dataSaida:', dados.dataSaida);
    
    return dados;
  };

  // Função para realizar o cadastro no backend
  const realizarCadastroEndereco = async () => {
    setCadastrando(true);
    
    try {
      const dadosEndereco = prepararDadosEndereco();
      console.log('Dados do formulário original:', formData);
      console.log('Dados preparados para envio:', dadosEndereco);
      
      const response = await beneficiadoService.cadastrarEndereco(dadosEndereco);
      
      if (response.success) {
        console.log('✅ Endereço cadastrado com sucesso:', response.data);
        setEnderecoId(response.data.id);
        
        // 🏠 CADASTRAR DADOS NA TABELA TIPO_MORADOR
        console.log('🏠 Iniciando cadastro na tabela tipo_morador...');
        
        // Obter CPF e ID do beneficiado da sessão
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
            fk_cpf: cpfBeneficiado.replace(/\D/g, ''), // Remove formatação do CPF
            fk_endereco: response.data.id
          };
          
          console.log('🏠 Dados preparados para tipo_morador:', dadosTipoMorador);
          
          const tipoMoradorResponse = await beneficiadoService.cadastrarTipoMorador(dadosTipoMorador);
          
          if (tipoMoradorResponse.success) {
            if (tipoMoradorResponse.warning) {
              console.log('🏠 ⚠️ Tipo de morador salvo localmente (backend indisponível):', tipoMoradorResponse.data);
              console.log('🏠 💡 Os dados serão enviados ao backend quando ele estiver disponível');
            } else {
              console.log('🏠 ✅ Tipo de morador cadastrado com sucesso no backend:', tipoMoradorResponse.data);
            }
          } else {
            console.log('🏠 ❌ Erro ao cadastrar tipo de morador:', tipoMoradorResponse.error);
            // Não bloquear o fluxo se tipo_morador falhar
          }
        } else {
          console.log('🏠 ⚠️ CPF ou ID do beneficiado não encontrados na sessão - pulando cadastro de tipo_morador');
        }
        
        return true;
      } else {
        console.error('❌ Erro no cadastro de endereço:', response.error);
        setMensagemErro(response.error || 'Erro ao cadastrar endereço.');
        setModalErro(true);
        return false;
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      setMensagemErro('Erro inesperado. Tente novamente.');
      setModalErro(true);
      return false;
    } finally {
      setCadastrando(false);
    }
  };

  const getFieldKey = (label) => {
    // Mapeamento específico para cada label
    const labelMapping = {
      "Rua/Avenida": "rua",
      "Número": "numero",
      "Complemento": "complemento",
      "Bairro": "bairro",
      "Cidade": "cidade",
      "Estado": "estado",
      "CEP": "cep",
      "Data de Entrada": "datadeentrada",
      "Data de Saída": "datadesada",
      "Moradia": "moradia",
      "Tipo de Moradia": "tipodemoradia",
      "Tipo de Cesta": "tipodecesta",
      "Status": "status",
      "Quantidade de Crianças": "quantidadedecriancas",
      "Quantidade de Adolescentes": "quantidadedeadolescentes",
      "Quantidade de Jovens": "quantidadedejovens",
      "Quantidade de Idosos": "quantidadedeidosos",
      "Quantidade de Gestantes": "quantidadedegestantes",
      "Quantidade de Deficientes": "quantidadededeficientes",
      "Quantidade de Outros": "quantidadedeoutros"
    };
    
    const mappedKey = labelMapping[label];
    if (mappedKey) {
      return mappedKey;
    }
    
    // Fallback para o método antigo se não encontrar no mapeamento
    const fallbackKey = label.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '');
    console.warn(`Label "${label}" não encontrado no mapeamento, usando fallback: "${fallbackKey}"`);
    return fallbackKey;
  };

  const validateStep1 = () => {
    const camposObrigatorios = [
      { key: "cep", name: "CEP" },
      { key: "rua", name: "Rua/Avenida" },
      { key: "numero", name: "Número" },
      { key: "bairro", name: "Bairro" },
      { key: "cidade", name: "Cidade" },
      { key: "estado", name: "Estado" }
    ];
    
    const camposVazios = [];
    
    // Verifica campos obrigatórios
    for (let campo of camposObrigatorios) {
      if (!formData[campo.key] || formData[campo.key].trim() === "") {
        camposVazios.push(campo.name);
      }
    }
    
    // Verifica se estado não está na opção padrão
    if (formData.estado === "Selecionar estado" || formData.estado === "") {
      if (!camposVazios.includes("Estado")) {
        camposVazios.push("Estado");
      }
    }
    
    // Valida formato do CEP
    if (formData.cep && !/^\d{5}-\d{3}$/.test(formData.cep)) {
      mostrarModal("CEP deve estar no formato 00000-000.");
      return false;
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

  const validateStep2 = () => {
    const camposObrigatorios = [
      { key: "datadeentrada", name: "Data de Entrada" },
      { key: "moradia", name: "Moradia" },
      { key: "tipodemoradia", name: "Tipo de Moradia" },
      { key: "tipodecesta", name: "Tipo de Cesta" },
      { key: "status", name: "Status" }
    ];
    
    const camposVazios = [];
    
    // Verifica campos obrigatórios (Data de Saída é opcional)
    for (let campo of camposObrigatorios) {
      if (!formData[campo.key] || formData[campo.key].trim() === "") {
        camposVazios.push(campo.name);
      }
    }
    
    // Verifica se selects não estão nas opções padrão
    if (formData.tipodemoradia === "Selecione o tipo" || formData.tipodemoradia === "") {
      if (!camposVazios.includes("Tipo de Moradia")) {
        camposVazios.push("Tipo de Moradia");
      }
    }
    
    if (formData.tipodecesta === "Selecione o tipo" || formData.tipodecesta === "") {
      if (!camposVazios.includes("Tipo de Cesta")) {
        camposVazios.push("Tipo de Cesta");
      }
    }
    
    if (formData.status === "Selecione o status" || formData.status === "") {
      if (!camposVazios.includes("Status")) {
        camposVazios.push("Status");
      }
    }

    if (camposVazios.length > 0) {
      const mensagem = camposVazios.length === 1 
        ? `O campo ${camposVazios[0]} é obrigatório.`
        : `Os seguintes campos são obrigatórios:\n\n• ${camposVazios.join("\n• ")}`;
      mostrarModal(mensagem);
      return false;
    }

    const dateFields = [
      { key: "datadeentrada", name: "Data de Entrada" },
      { key: "datadesada", name: "Data de Saída" }
    ];
    
    for (let field of dateFields) {
      const dateValue = formData[field.key];
      // Validar formato apenas se o campo estiver preenchido
      if (dateValue && dateValue.trim() !== "" && !/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
        mostrarModal(`O campo "${field.name}" deve estar no formato DD/MM/AAAA.`);
        return false;
      }
      
      if (dateValue && dateValue.length === 10) {
        const [day, month, year] = dateValue.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        
        if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
          mostrarModal(`O campo "${field.name}" contém uma data inválida.`);
          return false;
        }
      }
    }

    if (formData.datadeentrada && formData.datadesada && 
        formData.datadeentrada.length === 10 && formData.datadesada.length === 10) {
      const [dayEntrada, monthEntrada, yearEntrada] = formData.datadeentrada.split('/').map(Number);
      const [daySaida, monthSaida, yearSaida] = formData.datadesada.split('/').map(Number);
      
      const dataEntrada = new Date(yearEntrada, monthEntrada - 1, dayEntrada);
      const dataSaida = new Date(yearSaida, monthSaida - 1, daySaida);
      
      if (dataEntrada >= dataSaida) {
        mostrarModal("A Data de Entrada deve ser anterior à Data de Saída.");
        return false;
      }
    }

    return true;
  };

  const validateStep4 = () => {
    const quantidadeFields = [
      { key: "quantidadedecriancas", name: "Quantidade de Crianças" },
      { key: "quantidadedegestantes", name: "Quantidade de Gestantes" },
      { key: "quantidadedeadolescentes", name: "Quantidade de Adolescentes" },
      { key: "quantidadededeficientes", name: "Quantidade de Deficientes" },
      { key: "quantidadedejovens", name: "Quantidade de Jovens" },
      { key: "quantidadedeidosos", name: "Quantidade de Idosos" },
      { key: "quantidadedeoutros", name: "Quantidade de Outros" }
    ];
    
    // Verifica se pelo menos um campo está preenchido
    const hasQuantidade = quantidadeFields.some(field => {
      const value = formData[field.key];
      return value && value.trim() !== "" && value !== "0";
    });
    
    if (!hasQuantidade) {
      mostrarModal("Preencha pelo menos uma quantidade de pessoas.");
      return false;
    }

    // Valida apenas os campos que estão preenchidos
    for (let field of quantidadeFields) {
      const value = formData[field.key];
      if (value && value.trim() !== "" && value !== "0") {
        const numValue = parseInt(value, 10);
        
        if (isNaN(numValue) || numValue < 1) {
          mostrarModal(`O campo "${field.name}" deve conter um número válido maior que 0.`);
          return false;
        }
        
        if (numValue > 99) {
          mostrarModal(`O campo "${field.name}" não pode ser maior que 99.`);
          return false;
        }
      }
    }

    return true;
  };

  const handleNextPage = () => {
    if (page === 1) {
      if (!validateStep1()) return;
    }
    
    if (page === 2) {
      if (!validateStep2()) return;
    }
    
    if (page < 5) {
      setPage((prev) => prev + 1);
      if (page < 2) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handleRegister = async () => {
    if (page === 2) {
      if (!validateStep2()) return;
      // Mostrar modal de sucesso ao invés de ir para próxima page
      mostrarModal("Indo para o cadastro de quantidade de pessoas!");
      // Redirecionar para quantidade de pessoas após 3 segundos
      setTimeout(() => {
        setPage(4);
      }, 3000);
    } else if (page === 4) {
      if (!validateStep4()) return;
      
      // Realizar cadastro no backend
      const sucesso = await realizarCadastroEndereco();
      if (sucesso) {
        // Mostrar modal de sucesso
        mostrarModal("Quantidade de pessoas enviado com sucesso!");
        // Redirecionar para home após 3 segundos
        setTimeout(() => {
          navigate("/home");
        }, 3000);
      }
    }
  };

  const handlePreviousPage = () => {
    if (page === 1) {
      navigate("/home");
    } else if (page > 1) {
      setPage((prev) => prev - 1);
      if (page <= 3 && page > 1) {
        setCurrentStep((prev) => prev - 1);
      }
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
    <div className="cadastro-endereco-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isCadastroEnderecoPage={true} />
      
      {page === 1 && (
        <div className="cadastro-endereco-container">
          <img 
            src={iconeVoltar} 
            alt="Voltar" 
            className="cadastro-endereco-icone-voltar"
            onClick={handlePreviousPage}
          />
          
          <h1 className="cadastro-endereco-title">Cadastro de Endereço</h1>
          
          <div className="cadastro-endereco-passo">Passo: 1/2</div>
          
          <form className="cadastro-endereco-form" onSubmit={(e) => { e.preventDefault(); handleNextPage(); }}>
            {/* Campo CEP centralizado */}
            <div className="cadastro-endereco-field-group">
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">CEP:</label>
                <Input
                  type="text"
                  value={formData.cep || ""}
                  onChange={(e) => handleInputChange("cep", e.target.value, "cep")}
                  placeholder="00000-000"
                  maxLength={9}
                  className="cadastro-endereco-input"
                />
              </div>
            </div>

            {/* Rua e Número */}
            <div className="cadastro-endereco-row">
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Rua/Avenida:</label>
                <Input
                  type="text"
                  value={formData.rua || ""}
                  onChange={(e) => handleInputChange("rua", e.target.value)}
                  placeholder="Insira o nome da rua"
                  className="cadastro-endereco-input"
                  disabled={!camposEditaveis && cepEncontrado}
                />
              </div>
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Número:</label>
                <Input
                  type="text"
                  value={formData.numero || ""}
                  onChange={(e) => handleInputChange("numero", e.target.value)}
                  placeholder="Insira o número"
                  className="cadastro-endereco-input cadastro-endereco-input-highlight"
                />
              </div>
            </div>

            {/* Complemento e Bairro */}
            <div className="cadastro-endereco-row">
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Complemento:</label>
                <Input
                  type="text"
                  value={formData.complemento || ""}
                  onChange={(e) => handleInputChange("complemento", e.target.value)}
                  placeholder="Insira o complemento"
                  className="cadastro-endereco-input"
                />
              </div>
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Bairro:</label>
                <Input
                  type="text"
                  value={formData.bairro || ""}
                  onChange={(e) => handleInputChange("bairro", e.target.value)}
                  placeholder="Insira o bairro"
                  className="cadastro-endereco-input"
                  disabled={!camposEditaveis && cepEncontrado}
                />
              </div>
            </div>

            {/* Cidade e Estado */}
            <div className="cadastro-endereco-row">
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Cidade:</label>
                <Input
                  type="text"
                  value={formData.cidade || ""}
                  onChange={(e) => handleInputChange("cidade", e.target.value)}
                  placeholder="Insira a cidade"
                  className="cadastro-endereco-input"
                  disabled={!camposEditaveis && cepEncontrado}
                />
              </div>
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Estado:</label>
                <Select
                  options={[
                    { value: "AC", label: "AC" }, { value: "AL", label: "AL" }, { value: "AP", label: "AP" },
                    { value: "AM", label: "AM" }, { value: "BA", label: "BA" }, { value: "CE", label: "CE" },
                    { value: "DF", label: "DF" }, { value: "ES", label: "ES" }, { value: "GO", label: "GO" },
                    { value: "MA", label: "MA" }, { value: "MT", label: "MT" }, { value: "MS", label: "MS" },
                    { value: "MG", label: "MG" }, { value: "PA", label: "PA" }, { value: "PB", label: "PB" },
                    { value: "PR", label: "PR" }, { value: "PE", label: "PE" }, { value: "PI", label: "PI" },
                    { value: "RJ", label: "RJ" }, { value: "RN", label: "RN" }, { value: "RS", label: "RS" },
                    { value: "RO", label: "RO" }, { value: "RR", label: "RR" }, { value: "SC", label: "SC" },
                    { value: "SP", label: "SP" }, { value: "SE", label: "SE" }, { value: "TO", label: "TO" }
                  ]}
                  value={formData.estado || ""}
                  onChange={(e) => handleInputChange("estado", e.target.value)}
                  placeholder="Selecionar estado"
                  className="cadastro-endereco-select"
                />
              </div>
            </div>

            <Botao texto="Próximo" type="submit" className="cadastro-endereco-btn" />
          </form>
        </div>
      )}

      {page === 2 && (
        <div className="cadastro-endereco-container">
          <img 
            src={iconeVoltar} 
            alt="Voltar" 
            className="cadastro-endereco-icone-voltar"
            onClick={handlePreviousPage}
          />
          
          <h1 className="cadastro-endereco-title">Cadastro de Endereço</h1>
          
          <div className="cadastro-endereco-passo">Passo: 2/2</div>
          
          <form className="cadastro-endereco-form" onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
            {/* Data de Entrada e Data de Saída */}
            <div className="cadastro-endereco-row">
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Data de Entrada:</label>
                <Input
                  type="text"
                  value={formData.datadeentrada || ""}
                  onChange={(e) => handleInputChange("datadeentrada", e.target.value, "date")}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  className="cadastro-endereco-input"
                />
              </div>
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Data de Saída:</label>
                <Input
                  type="text"
                  value={formData.datadesada || ""}
                  onChange={(e) => handleInputChange("datadesada", e.target.value, "date")}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  className="cadastro-endereco-input cadastro-endereco-input-highlight"
                />
              </div>
            </div>

            {/* Moradia e Tipo de Moradia */}
            <div className="cadastro-endereco-row">
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Moradia:</label>
                <Input
                  type="text"
                  value={formData.moradia || ""}
                  onChange={(e) => handleInputChange("moradia", e.target.value)}
                  placeholder="Quitada"
                  className="cadastro-endereco-input"
                />
              </div>
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Tipo de Moradia:</label>
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
                  className="cadastro-endereco-select"
                />
              </div>
            </div>

            {/* Tipo de Cesta e Status */}
            <div className="cadastro-endereco-row">
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Tipo de Cesta:</label>
                <Select
                  options={[
                    { value: "Kit", label: "Kit" },
                    { value: "Cesta Básica", label: "Cesta Básica" }
                  ]}
                  value={formData.tipodecesta || ""}
                  onChange={(e) => handleInputChange("tipodecesta", e.target.value)}
                  placeholder="Selecione o tipo"
                  className="cadastro-endereco-select"
                />
              </div>
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Status:</label>
                <Select
                  options={[
                    { value: "Disponível", label: "Disponível" },
                    { value: "Ocupado", label: "Ocupado" },
                    { value: "Indisponível", label: "Indisponível" }
                  ]}
                  value={formData.status || ""}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  placeholder="Selecione o status"
                  className="cadastro-endereco-select"
                />
              </div>
            </div>

            <div className="cadastro-endereco-botoes">
              <Botao 
                texto="Voltar" 
                onClick={handlePreviousPage}
                className="cadastro-endereco-btn-voltar"
              />
              <Botao 
                texto={loading ? "Cadastrando..." : "Próximo"} 
                type="submit" 
                className="cadastro-endereco-btn" 
                disabled={loading}
              />
            </div>
          </form>
        </div>
      )}



      {page === 4 && (
        <div className="cadastro-endereco-container">
          <h1 className="cadastro-endereco-title">Cadastro de Endereço</h1>
          
          <form className="cadastro-endereco-form" onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
            {/* Quantidade de Crianças sozinho */}
            <div className="cadastro-endereco-field-group">
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Quantidade de Crianças:</label>
                <Input
                  type="text"
                  value={formData.quantidadedecriancas || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove não números
                    if (value.length <= 2) {
                      handleInputChange("quantidadedecriancas", value);
                    }
                  }}
                  placeholder="Insira um número"
                  className="cadastro-endereco-input"
                  maxLength={2}
                />
              </div>
            </div>

            {/* Quantidade de Gestantes e Adolescentes */}
            <div className="cadastro-endereco-row">
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Quantidade de Gestantes:</label>
                <Input
                  type="text"
                  value={formData.quantidadedegestantes || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove não números
                    if (value.length <= 2) {
                      handleInputChange("quantidadedegestantes", value);
                    }
                  }}
                  placeholder="Insira um número"
                  className="cadastro-endereco-input"
                  maxLength={2}
                />
              </div>
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Quantidade de Adolescentes:</label>
                <Input
                  type="text"
                  value={formData.quantidadedeadolescentes || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove não números
                    if (value.length <= 2) {
                      handleInputChange("quantidadedeadolescentes", value);
                    }
                  }}
                  placeholder="Insira um número"
                  className="cadastro-endereco-input"
                  maxLength={2}
                />
              </div>
            </div>

            {/* Quantidade de Deficientes e Jovens */}
            <div className="cadastro-endereco-row">
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Quantidade de Deficientes:</label>
                <Input
                  type="text"
                  value={formData.quantidadededeficientes || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove não números
                    if (value.length <= 2) {
                      handleInputChange("quantidadededeficientes", value);
                    }
                  }}
                  placeholder="Insira um número"
                  className="cadastro-endereco-input"
                  maxLength={2}
                />
              </div>
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Quantidade de Jovens:</label>
                <Input
                  type="text"
                  value={formData.quantidadedejovens || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove não números
                    if (value.length <= 2) {
                      handleInputChange("quantidadedejovens", value);
                    }
                  }}
                  placeholder="Insira um número"
                  className="cadastro-endereco-input"
                  maxLength={2}
                />
              </div>
            </div>

            {/* Quantidade de Idosos e Outros */}
            <div className="cadastro-endereco-row">
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Quantidade de Idosos:</label>
                <Input
                  type="text"
                  value={formData.quantidadedeidosos || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove não números
                    if (value.length <= 2) {
                      handleInputChange("quantidadedeidosos", value);
                    }
                  }}
                  placeholder="Insira um número"
                  className="cadastro-endereco-input"
                  maxLength={2}
                />
              </div>
              <div className="cadastro-endereco-field">
                <label className="cadastro-endereco-label">Quantidade de Outros:</label>
                <Input
                  type="text"
                  value={formData.quantidadedeoutros || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove não números
                    if (value.length <= 2) {
                      handleInputChange("quantidadedeoutros", value);
                    }
                  }}
                  placeholder="Insira um número"
                  className="cadastro-endereco-input"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="cadastro-endereco-botoes" style={{ justifyContent: 'center', marginTop: '10px' }}>
              <Botao 
                texto={loading ? "Cadastrando..." : "Enviar"} 
                type="submit" 
                className="cadastro-endereco-btn" 
                disabled={loading}
                style={{ margin: '0' }}
              />
            </div>
          </form>
        </div>
      )}



      <Modal
        isOpen={modalErro}
        onClose={() => setModalErro(false)}
        texto={mensagemErro}
        showClose={true}
      />
      
      {/* Modal unificado com timeout de 3 segundos */}
      <Modal
        isOpen={modalGeral.open}
        texto={modalGeral.mensagem}
        showClose={false}
      />
    </div>
  );
}