export const applyMask = (value, mask) => {
  let result = '';
  let valueIndex = 0;
  
  for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
    if (mask[i] === '#') {
      result += value[valueIndex];
      valueIndex++;
    } else {
      result += mask[i];
    }
  }
  
  return result;
};

export const masks = {
  cpf: (value) => {
    const numbers = value.replace(/\D/g, '');
    return applyMask(numbers, '###.###.###-##');
  },
  
  cep: (value) => {
    const numbers = value.replace(/\D/g, '');
    return applyMask(numbers, '#####-###');
  },
  
  phone: (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return applyMask(numbers, '(##) ####-####');
    } else {
      return applyMask(numbers, '(##) #####-####');
    }
  },
  
  date: (value) => {
    const numbers = value.replace(/\D/g, '');
    return applyMask(numbers, '##/##/####');
  },
  
  cnpj: (value) => {
    const numbers = value.replace(/\D/g, '');
    return applyMask(numbers, '##.###.###/####-##');
  }
};

export const removeMask = (value) => {
  return value.replace(/\D/g, '');
};
