const inputsFirstStep = [
  {
    label: "Rua/Avenida",
    placeholder: "Insira o nome da rua",
    inputType: "text",
  },
  { 
    label: "Número", 
    placeholder: "Insira o número", 
    inputType: "text" 
  },
  {
    label: "Complemento",
    placeholder: "Insira o complemento",
    inputType: "text",
  },
  { 
    label: "Bairro", 
    placeholder: "Insira o bairro", 
    inputType: "text" 
  },
  { 
    label: "Cidade", 
    placeholder: "Insira a cidade", 
    inputType: "text" 
  },
  { 
    label: "Estado", 
    placeholder: "Selecionar estado", 
    inputType: "select",
    options: [
      "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", 
      "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", 
      "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
    ]
  },
];

const inputsSecondStep = [
  {
    label: "Data de Entrada",
    placeholder: "Insira a data de entrada",
    inputType: "date",
  },
  {
    label: "Data de Saída",
    placeholder: "Insira a data de saída",
    inputType: "date",
  },
  {
    label: "Moradia",
    placeholder: "Insira o número da moradia",
    inputType: "number",
  },
  {
    label: "Tipo de Moradia",
    placeholder: "Selecione o tipo",
    inputType: "select",
     options: ["Casa", "Apartamento", "Kitnet", "Quarto", "Outro"],
  },
  {
    label: "Tipo de Cesta",
    placeholder: "Selecione o tipo",
    inputType: "select",
    options: ["Kit", "Cesta Básica"],
  },
  {
    label: "Status",
    placeholder: "Selecione o status",
    inputType: "select",
    options: ["Disponível", "Indisponível"],
  },
];

const inputsQuantidadePessoas = [
  {
    label: "Quantidade de Crianças",
    placeholder: "Insira um número",
    inputType: "number",
  },
  {
    label: "Quantidade de Adolescentes",
    placeholder: "Insira um número",
    inputType: "number",
  },
  {
    label: "Quantidade de Jovens",
    placeholder: "Insira um número",
    inputType: "number",
  },
  {
    label: "Quantidade de Idosos",
    placeholder: "Insira um número",
    inputType: "number",
  },
  {
    label: "Quantidade de Gestantes",
    placeholder: "Insira um número",
    inputType: "number",
  },
  {
    label: "Quantidade de Deficientes",
    placeholder: "Insira um número",
    inputType: "number",
  },
  {
    label: "Quantidade de Outros",
    placeholder: "Insira um número",
    inputType: "number",
  },
];

const successMessageEndereco = {
  title: "Endereço cadastrado com sucesso!",
  buttonText: "Próximo",
  buttonAction: "next",
};

const successMessageQuantidade = {
  title: "Quantidade de pessoas enviado com sucesso!",
  buttonText: "Início",
  buttonAction: "home",
};

export {
  inputsFirstStep,
  inputsSecondStep,
  inputsQuantidadePessoas,
  successMessageEndereco,
  successMessageQuantidade,
};
