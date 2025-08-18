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
import "../styles/CadastroEndereco.css";
import iconeCasa from "../assets/icone-casa.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";
import iconeCalendario from "../assets/icone-calendario.png";
import iconeCadeado from "../assets/icone-cadeado.png";

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
    dataEntrada: "",
    dataSaida: "",
    moradia: "",
    tipoMoradia: "",
    tipoCesta: "Kit",
    status: "Disponível",
    quantidadeCriancas: "",
    quantidadeAdolescentes: "",
    quantidadeJovens: "",
    quantidadeIdosos: "",
    quantidadeGestantes: "",
    quantidadeDeficientes: "",
    quantidadeOutros: "",
  });

  const [erros, setErros] = useState({});

  const handleInputChange = (field, value, maskType = null) => {
    let processedValue = value;

    if (maskType && masks[maskType]) {
      processedValue = masks[maskType](value);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));

    if (erros[field] && value.trim()) {
      setErros(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleDateInputChange = (field, value) => {
    const maskedValue = masks.date(value);
    setFormData((prev) => ({
      ...prev,
      [field]: maskedValue,
    }));

    if (erros[field] && value.trim()) {
      setErros(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateStep1 = () => {
    const newErros = {};
    const requiredFields = ["rua", "numero", "bairro", "cidade", "estado", "cep"];
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === "") {
        newErros[field] = "Campo obrigatório";
      }
    });

    if (formData.cep && !/^\d{5}-\d{3}$/.test(formData.cep)) {
      newErros.cep = "CEP inválido";
    }

    setErros(newErros);
    return Object.keys(newErros).length === 0;
  };

  const validateStep2 = () => {
    const newErros = {};
    const requiredFields = ["dataEntrada", "dataSaida", "moradia"];
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === "") {
        newErros[field] = "Campo obrigatório";
      }
    });

    if (formData.dataEntrada && !/^\d{2}\/\d{2}\/\d{4}$/.test(formData.dataEntrada)) {
      newErros.dataEntrada = "Data inválida";
    }
    if (formData.dataSaida && !/^\d{2}\/\d{2}\/\d{4}$/.test(formData.dataSaida)) {
      newErros.dataSaida = "Data inválida";
    }

    setErros(newErros);
    return Object.keys(newErros).length === 0;
  };

  const validateStep4 = () => {
    const newErros = {};
    const quantidadeFields = [
      "quantidadeCriancas", "quantidadeAdolescentes", "quantidadeJovens", 
      "quantidadeIdosos", "quantidadeGestantes", "quantidadeDeficientes", "quantidadeOutros"
    ];
    
    const hasQuantidade = quantidadeFields.some(field => formData[field] && formData[field] !== "0");
    
    if (!hasQuantidade) {
      quantidadeFields.forEach(field => {
        newErros[field] = "Preencha pelo menos uma quantidade";
      });
    }

    setErros(newErros);
    return Object.keys(newErros).length === 0;
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
      
      const dadosStep1 = `Endereço: ${formData.rua}, ${formData.numero} - ${formData.complemento}, ${formData.bairro}, ${formData.cidade} - ${formData.estado}, CEP: ${formData.cep}`;
      const dadosStep2 = `Data Entrada: ${formData.dataEntrada}, Data Saída: ${formData.dataSaida}, Moradia: ${formData.moradia}, Tipo Moradia: ${formData.tipoMoradia}, Tipo Cesta: ${formData.tipoCesta}, Status: ${formData.status}`;
      alert(`${dadosStep1}\n\n${dadosStep2}`);
      setPage(3);
    } else if (page === 4) {
      if (!validateStep4()) return;
      
      alert("Quantidade de pessoas enviado com sucesso!");
      setPage(5);
    } else if (page === 5) {
      navigate("/home");
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
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
    <div>
      <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
      <MenuEndereco onClick={handlePreviousPage} page={page == 1 ? 1 : 2} showStep={page <= 2} />
      
      {page === 1 && (
        <div className="cadastro-container">
          <form className="cadastro-form">
            <div className="cadastro-row">
              <div className="cadastro-field">
                <Input
                  label="Rua/Avenida"
                  type="text"
                  name="rua"
                  value={formData.rua}
                  onChange={(e) => handleInputChange("rua", e.target.value)}
                  placeholder="Rua Osvaldo Cruz"
                  style={erros.rua ? { border: '2px solid #e74c3c' } : {}}
                />
                {erros.rua && <span className="erro-msg">{erros.rua}</span>}
              </div>
              <div className="cadastro-field">
                <Input
                  label="Número"
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={(e) => handleInputChange("numero", e.target.value)}
                  placeholder="36"
                  style={erros.numero ? { border: '2px solid #e74c3c' } : {}}
                />
                {erros.numero && <span className="erro-msg">{erros.numero}</span>}
              </div>
            </div>

            <div className="cadastro-row">
              <div className="cadastro-field">
                <Input
                  label="Complemento"
                  type="text"
                  name="complemento"
                  value={formData.complemento}
                  onChange={(e) => handleInputChange("complemento", e.target.value)}
                  placeholder="A"
                />
              </div>
              <div className="cadastro-field">
                <Input
                  label="Bairro"
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={(e) => handleInputChange("bairro", e.target.value)}
                  placeholder="Japão Liberdade"
                  style={erros.bairro ? { border: '2px solid #e74c3c' } : {}}
                />
                {erros.bairro && <span className="erro-msg">{erros.bairro}</span>}
              </div>
            </div>

            <div className="cadastro-row">
              <div className="cadastro-field">
                <Input
                  label="Cidade"
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange("cidade", e.target.value)}
                  placeholder="São Paulo"
                  style={erros.cidade ? { border: '2px solid #e74c3c' } : {}}
                />
                {erros.cidade && <span className="erro-msg">{erros.cidade}</span>}
              </div>
              <div className="cadastro-field">
                <Input
                  label="Estado"
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={(e) => handleInputChange("estado", e.target.value)}
                  placeholder="São Paulo"
                  style={erros.estado ? { border: '2px solid #e74c3c' } : {}}
                />
                {erros.estado && <span className="erro-msg">{erros.estado}</span>}
              </div>
            </div>

            <div className="cadastro-row">
              <div className="cadastro-field">
                <Input
                  label="CEP"
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={(e) => handleInputChange("cep", e.target.value, "cep")}
                  placeholder="06432-345"
                  maxLength={9}
                  style={erros.cep ? { border: '2px solid #e74c3c' } : {}}
                />
                {erros.cep && <span className="erro-msg">{erros.cep}</span>}
              </div>
            </div>
          </form>
          
          <button className="cadastro-btn" onClick={handleNextPage}>
            Próximo
          </button>
        </div>
      )}

      {page === 2 && (
        <div className="cadastro-container">
          <h1 className="cadastro-title">Informações Adicionais</h1>
          <form className="cadastro-form">
            <div className="cadastro-row">
              <div className="cadastro-field">
                <Input
                  label="Data de Entrada"
                  type="text"
                  name="dataEntrada"
                  value={formData.dataEntrada}
                  onChange={(e) => handleDateInputChange("dataEntrada", e.target.value)}
                  placeholder="dd/mm/aaaa"
                  iconImg={iconeCalendario}
                  maxLength={10}
                  style={erros.dataEntrada ? { border: '2px solid #e74c3c' } : {}}
                />
                {erros.dataEntrada && <span className="erro-msg">{erros.dataEntrada}</span>}
              </div>
              <div className="cadastro-field">
                <Input
                  label="Data de Saída"
                  type="text"
                  name="dataSaida"
                  value={formData.dataSaida}
                  onChange={(e) => handleDateInputChange("dataSaida", e.target.value)}
                  placeholder="dd/mm/aaaa"
                  iconImg={iconeCalendario}
                  maxLength={10}
                  style={erros.dataSaida ? { border: '2px solid #e74c3c' } : {}}
                />
                {erros.dataSaida && <span className="erro-msg">{erros.dataSaida}</span>}
              </div>
            </div>

            <div className="cadastro-row">
              <div className="cadastro-field">
                <Input
                  label="Moradia"
                  type="number"
                  name="moradia"
                  value={formData.moradia}
                  onChange={(e) => handleInputChange("moradia", e.target.value)}
                  placeholder="Número da moradia"
                  style={erros.moradia ? { border: '2px solid #e74c3c' } : {}}
                />
                {erros.moradia && <span className="erro-msg">{erros.moradia}</span>}
              </div>
              <div className="cadastro-field">
                <label className="input-label">Tipo de Moradia:</label>
                <select
                  className="cadastro-select"
                  value={formData.tipoMoradia || "Casa"}
                  onChange={(e) => handleInputChange("tipoMoradia", e.target.value)}
                >
                  <option value="Casa">Casa</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Kitnet">Kitnet</option>
                  <option value="Quarto">Quarto</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

            <div className="cadastro-row">
              <div className="cadastro-field">
                <label className="input-label">Tipo de Cesta:</label>
                <select
                  className="cadastro-select"
                  value={formData.tipoCesta}
                  onChange={(e) => handleInputChange("tipoCesta", e.target.value)}
                >
                  <option value="Cesta Básica">Cesta Básica</option>
                  <option value="Kit">Kit</option>
                  <option value="Pacote">Pacote</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div className="cadastro-field">
                <label className="input-label">Status:</label>
                <select
                  className="cadastro-select"
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                >
                  <option value="Disponível">Disponível</option>
                  <option value="Indisponível">Indisponível</option>
                  <option value="Em Manutenção">Em Manutenção</option>
                  <option value="Ocupado">Ocupado</option>
                </select>
              </div>
            </div>
          </form>
          
          <button className="cadastro-btn" onClick={handleRegister}>
            Cadastrar
          </button>
        </div>
      )}

      {page === 3 && <SucessoEndereco onNext={handleNextPage} />}

      {page === 4 && (
        <div className="cadastro-container">
          <h1 className="cadastro-title">Quantidade de Pessoas</h1>
          <form className="cadastro-form">
            <div className="cadastro-row">
              <div className="cadastro-field">
                <Input
                  label="Quantidade de Crianças"
                  type="number"
                  name="quantidadeCriancas"
                  value={formData.quantidadeCriancas}
                  onChange={(e) => handleInputChange("quantidadeCriancas", e.target.value)}
                  placeholder="0"
                  min="0"
                  style={erros.quantidadeCriancas ? { border: '2px solid #e74c3c' } : {}}
                />
                {erros.quantidadeCriancas && <span className="erro-msg">{erros.quantidadeCriancas}</span>}
              </div>
              <div className="cadastro-field">
                <Input
                  label="Quantidade de Adolescentes"
                  type="number"
                  name="quantidadeAdolescentes"
                  value={formData.quantidadeAdolescentes}
                  onChange={(e) => handleInputChange("quantidadeAdolescentes", e.target.value)}
                  placeholder="0"
                  min="0"
                  style={erros.quantidadeAdolescentes ? { border: '2px solid #e74c3c' } : {}}
                />
                {erros.quantidadeAdolescentes && <span className="erro-msg">{erros.quantidadeAdolescentes}</span>}
              </div>
            </div>

            <div className="cadastro-row">
              <div className="cadastro-field">
                <Input
                  label="Quantidade de Jovens"
                  type="number"
                  name="quantidadeJovens"
                  value={formData.quantidadeJovens}
                  onChange={(e) => handleInputChange("quantidadeJovens", e.target.value)}
                  placeholder="0"
                  min="0"
                  style={erros.quantidadeJovens ? { border: '2px solid #e74c3c' } : {}}
                />
                {erros.quantidadeJovens && <span className="erro-msg">{erros.quantidadeJovens}</span>}
              </div>
              <div className="cadastro-field">
                <Input
                  label="Quantidade de Idosos"
                  type="number"
                  name="quantidadeIdosos"
                  value={formData.quantidadeIdosos}
                  onChange={(e) => handleInputChange("quantidadeIdosos", e.target.value)}
                  placeholder="0"
                  min="0"
                  style={erros.quantidadeIdosos ? { border: '2px solid #e74c3c' } : {}}
                />
                {erros.quantidadeIdosos && <span className="erro-msg">{erros.quantidadeIdosos}</span>}
              </div>
            </div>

            <div className="cadastro-row">
              <div className="cadastro-field">
                <Input
                  label="Quantidade de Gestantes"
                  type="number"
                  name="quantidadeGestantes"
                  value={formData.quantidadeGestantes}
                  onChange={(e) => handleInputChange("quantidadeGestantes", e.target.value)}
                  placeholder="0"
                  min="0"
                  style={erros.quantidadeGestantes ? { border: '2px solid #e74c3c' } : {}}
                />
                {erros.quantidadeGestantes && <span className="erro-msg">{erros.quantidadeGestantes}</span>}
              </div>
              <div className="cadastro-field">
                <Input
                  label="Quantidade de Deficientes"
                  type="number"
                  name="quantidadeDeficientes"
                  value={formData.quantidadeDeficientes}
                  onChange={(e) => handleInputChange("quantidadeDeficientes", e.target.value)}
                  placeholder="0"
                  min="0"
                  style={erros.quantidadeDeficientes ? { border: '2px solid #e74c3c' } : {}}
                />
                {erros.quantidadeDeficientes && <span className="erro-msg">{erros.quantidadeDeficientes}</span>}
              </div>
            </div>

            <div className="cadastro-row">
              <div className="cadastro-field">
                <Input
                  label="Quantidade de Outros"
                  type="number"
                  name="quantidadeOutros"
                  value={formData.quantidadeOutros}
                  onChange={(e) => handleInputChange("quantidadeOutros", e.target.value)}
                  placeholder="0"
                  min="0"
                  style={erros.quantidadeOutros ? { border: '2px solid #e74c3c' } : {}}
                />
                {erros.quantidadeOutros && <span className="erro-msg">{erros.quantidadeOutros}</span>}
              </div>
            </div>
          </form>
          
          <button className="cadastro-btn" onClick={handleRegister}>
            Enviar
          </button>
        </div>
      )}

      {page === 5 && <SucessoFinal onHome={handleRegister} />}
    </div>
  );
}