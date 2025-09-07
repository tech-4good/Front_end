import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Voltar from "../components/Voltar";
import Modal from "../components/Modal";
import Input from "../components/Input";
import "../styles/CadastroFilhos.css";
import Radio from "../components/Radio";

import iconeCasa from "../assets/icone-casa.png";
import iconeUsuario from "../assets/icone-usuario.png";
import iconeRelogio from "../assets/icone-relogio.png";
import iconeSair from "../assets/icone-sair.png";

export default function CadastroFilhos() {
    const [cpfBeneficiado, setCpfBeneficiado] = useState("");
    const [isEstudante, setIsEstudante] = useState(null);
    const [isCreche, setIsCreche] = useState(null);
    const [dataNascimento, setDataNascimento] = useState("");
    const [erros, setErros] = useState({});
    const [modalCampos, setModalCampos] = useState(false);

    const [tipoUsuario, setTipoUsuario] = useState("2");
    const navigate = useNavigate();

    useEffect(() => {
        const tipo = sessionStorage.getItem("tipoUsuario") || "2";
        setTipoUsuario(tipo);
    }, []);

    const botoesNavbar = [
        { texto: "Início", onClick: () => navigate("/home"), icone: iconeCasa },
        { texto: "Perfil", onClick: () => navigate("/perfil"), icone: iconeUsuario },
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

    function formatDate(value) {
        let numbers = value.replace(/\D/g, ""); 
        if (numbers.length > 8) numbers = numbers.slice(0, 8);

        if (numbers.length >= 5) {
            return numbers.replace(/(\d{2})(\d{2})(\d{0,4})/, "$1/$2/$3");
        } else if (numbers.length >= 3) {
            return numbers.replace(/(\d{2})(\d{0,2})/, "$1/$2");
        } else {
            return numbers;
        }
    }


    function isValidDate(dateString) {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return false;

        const [day, month, year] = dateString.split("/").map(Number);
        const date = new Date(year, month - 1, day);

        return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
        );
    }

    function handleCadastrar(e) {
        e.preventDefault();
        let newErros = {};

        if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpfBeneficiado)) {
            newErros.cpf = "CPF inválido";
        }
        if (isEstudante === null) newErros.estudante = "Selecione uma opção";
        if (isCreche === null) newErros.creche = "Selecione uma opção";
        if (!isValidDate(dataNascimento)) {
            newErros.dataNascimento = "Data inválida (DD/MM/AAAA)";
        }

        setErros(newErros);

        if (Object.keys(newErros).length > 0) {
            setModalCampos(true);
            return;
        }

        console.log({
            cpfBeneficiado,
            isEstudante,
            isCreche,
            dataNascimento,
        });

        navigate("/home");
    }

    return (
        <div className="cadastro-filhos-bg">
            <Navbar nomeUsuario={nomeUsuario} botoes={botoesNavbar} />
            <div className="cadastro-filhos-container">
                <div className="cadastro-filhos-voltar">
                    <Voltar onClick={() => navigate("/home")} />
                </div>

                <h1 className="cadastro-filhos-title">Cadastro de Filhos</h1>

                <form className="cadastro-filhos-form" onSubmit={handleCadastrar}>
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

                    <div className="cadastro-filhos-radio-container">
                        <div className="cadastro-filhos-radio-col">
                            <span className="cadastro-filhos-radio-label">É estudante?</span>
                            <Radio
                                name="estudante"
                                options={[
                                    { label: "Sim", value: "true" },
                                    { label: "Não", value: "false" },
                                ]}
                                value={isEstudante !== null ? String(isEstudante) : ""}
                                onChange={(e) => setIsEstudante(e.target.value === "true")}
                            />
                            {erros.estudante && (
                                <span className="cadastro-filhos-erro">{erros.estudante}</span>
                            )}
                        </div>

                        <div className="cadastro-filhos-radio-col">
                            <span className="cadastro-filhos-radio-label">
                                Está em uma creche?
                            </span>
                            <Radio
                                name="creche"
                                options={[
                                    { label: "Sim", value: "true" },
                                    { label: "Não", value: "false" },
                                ]}
                                value={isCreche !== null ? String(isCreche) : ""}
                                onChange={(e) => setIsCreche(e.target.value === "true")}
                            />
                            {erros.creche && (
                                <span className="cadastro-filhos-erro">{erros.creche}</span>
                            )}
                        </div>
                    </div>

                    <Input
                        label="Data de Nascimento:"
                        type="text"
                        name="dataNascimento"
                        value={dataNascimento}
                        onChange={(e) => {
                            const formatted = formatDate(e.target.value);
                            setDataNascimento(formatted);
                        }}
                        maxLength={10}
                        placeholder="DD/MM/AAAA"
                        style={erros.dataNascimento ? { border: "2px solid #e74c3c" } : {}}
                    />
                    {erros.dataNascimento && (
                        <span style={{ color: "#e74c3c", fontSize: 13 }}>
                            {erros.dataNascimento}
                        </span>
                    )}

                    <button className="cadastro-filhos-btn-row" type="submit">
                        Cadastrar
                    </button>
                </form>

                <Modal
                    isOpen={modalCampos}
                    onClose={() => setModalCampos(false)}
                    texto="Preencha todos os campos antes de salvar."
                    showClose={true}
                />
            </div>
        </div>
    );
}
