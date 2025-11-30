import { useEffect, useState } from "react";
import { masks } from "../utils/masks";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

import Input from "../components/Input";
import Select from "../components/Select";
import Botao from "../components/Botao";
import Modal from "../components/Modal";
import { enderecoService } from "../services/enderecoService";
import "../styles/CadastroEndereco1.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import iconeVoltar from "../assets/icone-voltar.png";

export default function CadastroEndereco1() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state?.formData || {};

  const [formData, setFormData] = useState({
    rua: initialData.rua || "",
    numero: initialData.numero || "",
    complemento: initialData.complemento || "",
    bairro: initialData.bairro || "",
    cidade: initialData.cidade || "",
    estado: initialData.estado || "",
    cep: initialData.cep || "",
    ...initialData
  });

  // Sistema de modal unificado com timeout
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
    if (["rua", "bairro", "cidade", "complemento"].includes(field)) {
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
        
      }
    } catch (error) {
      console.error('❌ Erro ao buscar CEP:', error);
      mostrarModal(error.message || 'Erro ao buscar CEP. Preencha manualmente.');
      
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

  const handleNextPage = () => {
    if (!validateStep1()) return;
    
    // Navegar para o passo 2 passando os dados
    navigate("/cadastro-endereco-2", { state: { formData } });
  };

  const handlePreviousPage = () => {
    navigate("/home");
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
    <div className="cadastro-endereco1-bg">
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} isCadastroEnderecoPage={true} />
      
      <div className="cadastro-endereco1-container">
        <img 
          src={iconeVoltar} 
          alt="Voltar" 
          className="cadastro-endereco1-icone-voltar"
          onClick={handlePreviousPage}
        />
        
        <h1 className="cadastro-endereco1-title">Cadastro de Endereço</h1>
        
        {/* Indicador de progresso */}
        <div className="cadastro-endereco1-progress-container">
          <div className="cadastro-endereco1-progress-step active">
            <div className="cadastro-endereco1-progress-circle"></div>
            <span className="cadastro-endereco1-progress-label">Passo 1</span>
          </div>
          <div className="cadastro-endereco1-progress-line"></div>
          <div className="cadastro-endereco1-progress-step">
            <div className="cadastro-endereco1-progress-circle"></div>
            <span className="cadastro-endereco1-progress-label">Passo 2</span>
          </div>
        </div>
        
        <form className="cadastro-endereco1-form" onSubmit={(e) => { e.preventDefault(); handleNextPage(); }}>
          {/* Primeira linha - CEP e Rua */}
          <div className="cadastro-endereco1-row">
            <div className="cadastro-endereco1-field">
              <label className="cadastro-endereco1-label">CEP:</label>
              <Input
                type="text"
                value={formData.cep || ""}
                onChange={(e) => handleInputChange("cep", e.target.value, "cep")}
                placeholder="00000-000"
                maxLength={9}
                className="cadastro-endereco1-input"
              />
            </div>
            <div className="cadastro-endereco1-field">
              <label className="cadastro-endereco1-label">Rua/Avenida:</label>
              <Input
                type="text"
                value={formData.rua || ""}
                onChange={(e) => handleInputChange("rua", e.target.value)}
                placeholder="Insira o nome da rua"
                className="cadastro-endereco1-input"
                disabled={!camposEditaveis && cepEncontrado}
              />
            </div>
          </div>

          {/* Segunda linha - Cidade e Bairro */}
          <div className="cadastro-endereco1-row">
            <div className="cadastro-endereco1-field">
              <label className="cadastro-endereco1-label">Cidade:</label>
              <Input
                type="text"
                value={formData.cidade || ""}
                onChange={(e) => handleInputChange("cidade", e.target.value)}
                placeholder="Insira a cidade"
                className="cadastro-endereco1-input"
                disabled={!camposEditaveis && cepEncontrado}
              />
            </div>
            <div className="cadastro-endereco1-field">
              <label className="cadastro-endereco1-label">Bairro:</label>
              <Input
                type="text"
                value={formData.bairro || ""}
                onChange={(e) => handleInputChange("bairro", e.target.value)}
                placeholder="Insira o bairro"
                className="cadastro-endereco1-input"
                disabled={!camposEditaveis && cepEncontrado}
              />
            </div>
          </div>

          {/* Terceira linha - Número, Complemento, Estado */}
          <div className="cadastro-endereco1-row cadastro-endereco1-row-triple">
            <div className="cadastro-endereco1-field">
              <label className="cadastro-endereco1-label">Número:</label>
              <Input
                type="text"
                value={formData.numero || ""}
                onChange={(e) => handleInputChange("numero", e.target.value)}
                placeholder="0"
                className="cadastro-endereco1-input cadastro-endereco1-input-highlight"
              />
            </div>
            <div className="cadastro-endereco1-field">
              <label className="cadastro-endereco1-label">Complemento:</label>
              <Input
                type="text"
                value={formData.complemento || ""}
                onChange={(e) => handleInputChange("complemento", e.target.value)}
                placeholder="A"
                className="cadastro-endereco1-input"
              />
            </div>
            <div className="cadastro-endereco1-field">
              <label className="cadastro-endereco1-label">Estado:</label>
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
                className="cadastro-endereco1-select"
              />
            </div>
          </div>

          <Botao texto="Próximo" type="submit" className="cadastro-endereco1-btn" />
        </form>
      </div>

      {/* Modal unificado com timeout de 3 segundos */}
      <Modal
        isOpen={modalGeral.open}
        texto={modalGeral.mensagem}
        showClose={false}
      />
    </div>
  );
}
