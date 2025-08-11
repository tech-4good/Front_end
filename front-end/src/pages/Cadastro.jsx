import React, { useState } from "react";
import { User, CreditCard, Phone, Mail, Lock } from "lucide-react";
import "./FormularioCadastro.css";

import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";
import Link from "../../components/Link/Link";

const FormularioCadastro = ({ onNavigateToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    cpf: "",
    telefone: "",
    email: "",
    senha: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const handleCPFChange = (e) => {
    const formatted = formatCPF(e.target.value);
    handleInputChange("cpf", formatted);
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    handleInputChange("telefone", formatted);
  };

  const handleCadastro = () => {
    console.log("Cadastro realizado:", formData);
  };

  const handleLogin = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin();
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-card">
        <h2 className="cadastro-title">CADASTRO</h2>

        <InputField
          label="Nome Completo:"
          type="text"
          value={formData.nomeCompleto}
          onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
          placeholder="Digite seu nome completo"
          icon={User}
        />

        <div className="form-row">
          <div className="form-col">
            <InputField
              label="CPF:"
              type="text"
              value={formData.cpf}
              onChange={handleCPFChange}
              placeholder="000.000.000-00"
              icon={CreditCard}
            />
          </div>
          <div className="form-col">
            <InputField
              label="Telefone:"
              type="text"
              value={formData.telefone}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              icon={Phone}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-col">
            <InputField
              label="E-mail:"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="email@dominio.com"
              icon={Mail}
            />
          </div>
          <div className="form-col">
            <InputField
              label="Senha:"
              type="password"
              value={formData.senha}
              onChange={(e) => handleInputChange("senha", e.target.value)}
              placeholder="******************"
              icon={Lock}
              isPassword={true}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />
          </div>
        </div>

        <Button onClick={handleCadastro}>Cadastrar</Button>

        <div className="login-section">
          <span className="login-text">JÁ TEM CONTA? </span>
          <Link variant="primary" onClick={handleLogin}>
            CLIQUE AQUI!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FormularioCadastro;
