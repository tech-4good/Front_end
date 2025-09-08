import { useEffect, useState } from "react";
import { inputsFirstStep, inputsSecondStep, inputsQuantidadePessoas } from "../utils/cadastroEndereco";
import { masks } from "../utils/masks";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MenuEndereco from "../components/MenuEndereco";
import SucessoEndereco from "../components/SucessoEndereco";
import QuantidadePessoas from "../components/QuantidadePessoas";
import SucessoFinal from "../components/SucessoFinal";
import Input from "../components/Input";
import Select from "../components/Select";
import Botao from "../components/Botao";
import Modal from "../components/Modal";
import "../styles/CadastroEndereco.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

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
    tipodemoradia: "Casa",
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

  const handleInputChange = (field, value, maskType = null) => {
    let processedValue = value;

    if (maskType && masks[maskType]) {
      processedValue = masks[maskType](value);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));
  };

  const getFieldKey = (label) => {
    return label.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '');
  };

  const validateStep1 = () => {
    const requiredInputs = inputsFirstStep.filter(input => 
      input.label !== "Complemento"
    );
    
    for (let input of requiredInputs) {
      const fieldKey = getFieldKey(input.label);
      if (!formData[fieldKey] || formData[fieldKey].trim() === "") {
        setMensagemErro(`O campo "${input.label}" é obrigatório.`);
        setModalErro(true);
        return false;
      }
    }

    if (formData.cep && !/^\d{5}-\d{3}$/.test(formData.cep)) {
      setMensagemErro("CEP deve estar no formato 00000-000.");
      setModalErro(true);
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    const requiredFields = [
      { key: "datadeentrada", name: "Data de Entrada" },
      { key: "datadesada", name: "Data de Saída" },
      { key: "moradia", name: "Moradia" }
    ];
    
    for (let field of requiredFields) {
      if (!formData[field.key] || formData[field.key].trim() === "") {
        setMensagemErro(`O campo "${field.name}" é obrigatório.`);
        setModalErro(true);
        return false;
      }
    }

    const dateFields = [
      { key: "datadeentrada", name: "Data de Entrada" },
      { key: "datadesada", name: "Data de Saída" }
    ];
    
    for (let field of dateFields) {
      const dateValue = formData[field.key];
      if (dateValue && !/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
        setMensagemErro(`O campo "${field.name}" deve estar no formato DD/MM/AAAA.`);
        setModalErro(true);
        return false;
      }
      
      if (dateValue && dateValue.length === 10) {
        const [day, month, year] = dateValue.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        
        if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
          setMensagemErro(`O campo "${field.name}" contém uma data inválida.`);
          setModalErro(true);
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
        setMensagemErro("A Data de Entrada deve ser anterior à Data de Saída.");
        setModalErro(true);
        return false;
      }
    }

    return true;
  };

  const validateStep4 = () => {
    const quantidadeFields = [
      { key: "quantidadedecriancas", name: "Quantidade de Crianças" },
      { key: "quantidadedeadolescentes", name: "Quantidade de Adolescentes" },
      { key: "quantidadedejovens", name: "Quantidade de Jovens" },
      { key: "quantidadedeidosos", name: "Quantidade de Idosos" },
      { key: "quantidadedegestantes", name: "Quantidade de Gestantes" },
      { key: "quantidadededeficientes", name: "Quantidade de Deficientes" },
      { key: "quantidadedeoutros", name: "Quantidade de Outros" }
    ];
    
    const hasQuantidade = quantidadeFields.some(field => {
      const value = formData[field.key];
      return value && value !== "0" && value.trim() !== "";
    });
    
    if (!hasQuantidade) {
      setMensagemErro("Preencha pelo menos uma quantidade de pessoas.");
      setModalErro(true);
      return false;
    }

    for (let field of quantidadeFields) {
      const value = formData[field.key];
      if (value && value.trim() !== "") {
        const numValue = parseInt(value, 10);
        
        if (isNaN(numValue) || numValue < 0) {
          setMensagemErro(`O campo "${field.name}" deve conter um número válido (0 ou maior).`);
          setModalErro(true);
          return false;
        }
        
        if (numValue > 999) {
          setMensagemErro(`O campo "${field.name}" não pode ser maior que 999.`);
          setModalErro(true);
          return false;
        }
      }
    }

    const total = quantidadeFields.reduce((sum, field) => {
      const value = formData[field.key];
      return sum + (value && value.trim() !== "" ? parseInt(value, 10) : 0);
    }, 0);

    if (total === 0) {
      setMensagemErro("O total de pessoas deve ser maior que zero.");
      setModalErro(true);
      return false;
    }

    return true;
  };

  const handleNextPage = () => {
    if (page === 1) {
      if (!validateStep1()) return;
    }
    
    if (page < 5) {
      setPage((prev) => prev + 1);
      if (page < 2) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handleRegister = () => {
    if (page === 2) {
      if (!validateStep2()) return;
      setPage(3);
    } else if (page === 4) {
      if (!validateStep4()) return;
      setPage(5);
    } else if (page === 5) {
      navigate("/home");
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
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
      <MenuEndereco onClick={handlePreviousPage} page={currentStep} showStep={page <= 2} />
      
      {page === 1 && (
        <div className="cadastro-container">
          <form className="cadastro-form" onSubmit={(e) => { e.preventDefault(); handleNextPage(); }}>
            <div className="cadastro-row">
              {inputsFirstStep.slice(0, 2).map((input) => {
                const fieldKey = getFieldKey(input.label);
                return (
                  <div className="cadastro-field" key={input.label}>
                    <Input
                      label={input.label}
                      type={input.inputType}
                      value={formData[fieldKey] || ""}
                      onChange={(e) => handleInputChange(fieldKey, e.target.value, input.mask)}
                      placeholder={input.placeholder}
                      maxLength={input.mask === "cep" ? 9 : undefined}
                    />
                  </div>
                );
              })}
            </div>

            <div className="cadastro-row">
              {inputsFirstStep.slice(2, 4).map((input) => {
                const fieldKey = getFieldKey(input.label);
                return (
                  <div className="cadastro-field" key={input.label}>
                    <Input
                      label={input.label}
                      type={input.inputType}
                      value={formData[fieldKey] || ""}
                      onChange={(e) => handleInputChange(fieldKey, e.target.value, input.mask)}
                      placeholder={input.placeholder}
                    />
                  </div>
                );
              })}
            </div>

            <div className="cadastro-row">
              {inputsFirstStep.slice(4, 6).map((input) => {
                const fieldKey = getFieldKey(input.label);
                return (
                  <div className="cadastro-field" key={input.label}>
                    <Input
                      label={input.label}
                      type={input.inputType}
                      value={formData[fieldKey] || ""}
                      onChange={(e) => handleInputChange(fieldKey, e.target.value, input.mask)}
                      placeholder={input.placeholder}
                    />
                  </div>
                );
              })}
            </div>

            <div className="cadastro-row">
              <div className="cadastro-field"></div>
              <div className="cadastro-field">
                <Input
                  label="CEP"
                  type="text"
                  value={formData.cep || ""}
                  onChange={(e) => handleInputChange("cep", e.target.value, "cep")}
                  placeholder="06432-345"
                  maxLength={9}
                />
              </div>
              <div className="cadastro-field"></div>
            </div>

            <Botao texto="Próximo" type="submit" className="cadastro-btn" />
          </form>
        </div>
      )}

      {page === 2 && (
        <div className="cadastro-container">
          <form className="cadastro-form" onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
            <div className="cadastro-row">
              {inputsSecondStep.slice(0, 2).map((input) => {
                const fieldKey = getFieldKey(input.label);
                return (
                  <div className="cadastro-field" key={input.label}>
                    <Input
                      label={input.label}
                      type="text"
                      value={formData[fieldKey] || ""}
                      onChange={(e) => handleInputChange(fieldKey, e.target.value, "date")}
                      placeholder="DD/MM/AAAA"
                      maxLength={10}
                    />
                  </div>
                );
              })}
            </div>

            <div className="cadastro-row">
              <div className="cadastro-field">
                <Input
                  label="Moradia"
                  type="number"
                  value={formData.moradia || ""}
                  onChange={(e) => handleInputChange("moradia", e.target.value)}
                  placeholder="Número da moradia"
                />
              </div>
              <div className="cadastro-field">
                <Select
                  label="Tipo de Moradia"
                  options={inputsSecondStep[3].options.map(opt => ({ value: opt, label: opt }))}
                  value={formData.tipodemoradia}
                  onChange={(e) => handleInputChange("tipodemoradia", e.target.value)}
                  placeholder="Selecione o tipo"
                />
              </div>
            </div>

            <div className="cadastro-row">
              <div className="cadastro-field">
                <Select
                  label={inputsSecondStep[4].label}
                  options={inputsSecondStep[4].options.map(opt => ({ value: opt, label: opt }))}
                  value={formData.tipodecesta}
                  onChange={(e) => handleInputChange("tipodecesta", e.target.value)}
                />
              </div>
              <div className="cadastro-field">
                <Select
                  label={inputsSecondStep[5].label}
                  options={inputsSecondStep[5].options.map(opt => ({ value: opt, label: opt }))}
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                />
              </div>
            </div>

            <Botao texto="Cadastrar" type="submit" className="cadastro-btn" />
          </form>
        </div>
      )}

      {page === 3 && <SucessoEndereco onNext={handleNextPage} />}

      {page === 4 && (
        <div className="cadastro-container">
          <QuantidadePessoas 
            formData={formData} 
            onInputChange={handleInputChange}
          >
            <Botao texto="Enviar" onClick={handleRegister} className="cadastro-btn" />
          </QuantidadePessoas>
        </div>
      )}

      {page === 5 && <SucessoFinal onHome={handleRegister} />}

      <Modal
        isOpen={modalErro}
        onClose={() => setModalErro(false)}
        texto={mensagemErro}
        showClose={true}
      />
    </div>
  );
}