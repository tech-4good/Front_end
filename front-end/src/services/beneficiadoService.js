import apiClient from '../provider/api.js';

// Serviços para Beneficiados e Filhos
export const beneficiadoService = {
  // Buscar beneficiado por CPF
  buscarPorCpf: async (cpf) => {
    try {
      const response = await apiClient.get(`/beneficiados/cpf/${cpf}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar beneficiado:', error);
      
      let mensagem = 'Erro interno do servidor';
      
      if (error.response?.status === 404) {
        mensagem = 'Beneficiado não encontrado com este CPF.';
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      } else if (error.message === 'Network Error') {
        mensagem = 'Erro de conexão. Verifique sua internet.';
      }
      
      return { success: false, error: mensagem };
    }
  },

  // Cadastrar filho do beneficiado
  cadastrarFilho: async (dadosFilho) => {
    try {
      console.log('=== DEBUG SERVICE CADASTRAR FILHO ===');
      console.log('Dados recebidos:', dadosFilho);
      console.log('dadosFilho.beneficiadoId:', dadosFilho.beneficiadoId, '(tipo:', typeof dadosFilho.beneficiadoId, ')');
      console.log('dadosFilho.nome:', dadosFilho.nome);
      console.log('dadosFilho.dataNascimento:', dadosFilho.dataNascimento);
      console.log('dadosFilho.isEstudante:', dadosFilho.isEstudante);
      console.log('dadosFilho.hasCreche:', dadosFilho.hasCreche);
      console.log('dadosFilho.enderecoId:', dadosFilho.enderecoId);
      
      // Validar campos obrigatórios conforme documentação do backend
      if (!dadosFilho.nome || dadosFilho.nome.trim() === '') {
        console.error('ERRO: Nome vazio ou inválido');
        return { success: false, error: 'Nome do filho é obrigatório' };
      }
      if (!dadosFilho.dataNascimento) {
        console.error('ERRO: Data de nascimento ausente');
        return { success: false, error: 'Data de nascimento é obrigatória' };
      }
      if (!dadosFilho.beneficiadoId) {
        console.error('ERRO: beneficiadoId é null/undefined:', dadosFilho.beneficiadoId);
        return { success: false, error: 'ID do beneficiado é obrigatório' };
      }
      if (dadosFilho.isEstudante === null || dadosFilho.isEstudante === undefined) {
        console.error('ERRO: isEstudante é obrigatório');
        return { success: false, error: 'Informação sobre estudante é obrigatória' };
      }
      if (dadosFilho.hasCreche === null || dadosFilho.hasCreche === undefined) {
        console.error('ERRO: hasCreche é obrigatório');
        return { success: false, error: 'Informação sobre creche é obrigatória' };
      }
      if (!dadosFilho.enderecoId) {
        console.error('ERRO: enderecoId é obrigatório');
        return { success: false, error: 'Endereço é obrigatório' };
      }
      
      // Payload completo conforme documentação do backend
      const payload = {
        nome: dadosFilho.nome.trim(),
        dataNascimento: dadosFilho.dataNascimento,
        isEstudante: Boolean(dadosFilho.isEstudante),
        hasCreche: Boolean(dadosFilho.hasCreche),
        beneficiadoId: parseInt(dadosFilho.beneficiadoId),
        enderecoId: parseInt(dadosFilho.enderecoId)
      };

      console.log('🚀 Tentando POST para:', '/filhos-beneficiados');
      console.log('Payload completo para cadastro de filho:', payload);
      console.log('Payload JSON:', JSON.stringify(payload, null, 2));
      
      // Fazer a requisição para o endpoint correto
      const response = await apiClient.post('/filhos-beneficiados', payload);
      console.log('✅ Sucesso! Resposta do servidor:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Erro ao cadastrar filho:', error);
      console.error('Status do erro:', error.response?.status);
      console.error('Dados completos do erro:', error.response?.data);
      console.error('Mensagem do erro:', error.response?.data?.message || error.message);
      console.error('Stack trace:', error.response?.data?.trace);
      
      let mensagem = 'Erro interno do servidor';
      
      if (error.response?.status === 400) {
        mensagem = 'Dados inválidos. Verifique os campos preenchidos.';
      } else if (error.response?.status === 404) {
        mensagem = 'Beneficiado ou endereço não encontrado.';
      } else if (error.response?.status === 409) {
        mensagem = 'Conflito nos dados. Verifique as informações.';
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      } else if (error.message === 'Network Error') {
        mensagem = 'Erro de conexão. Verifique sua internet.';
      }
      
      return { success: false, error: mensagem };
    }
  },

  // Buscar filho por ID
  buscarFilhoPorId: async (id) => {
    try {
      const response = await apiClient.get(`/filhos-beneficiados/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar filho:', error);
      return { success: false, error: 'Erro ao carregar dados do filho' };
    }
  },

  // Listar todos os filhos de um beneficiado
  listarFilhosPorBeneficiado: async (beneficiadoId) => {
    try {
      const response = await apiClient.get(`/beneficiados/${beneficiadoId}/filhos`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao listar filhos:', error);
      return { success: false, error: 'Erro ao carregar lista de filhos' };
    }
  },

  // Atualizar filho
  atualizarFilho: async (id, dadosFilho) => {
    try {
      const payload = {
        nome: dadosFilho.nome,
        dataNascimento: dadosFilho.dataNascimento,
        beneficiadoId: dadosFilho.beneficiadoId
      };

      console.log('Payload para atualização de filho:', payload);
      const response = await apiClient.patch(`/filhos-beneficiados/${id}`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao atualizar filho:', error);
      let mensagem = 'Erro ao atualizar dados';
      
      if (error.response?.status === 400) {
        mensagem = 'Dados inválidos. Verifique os campos preenchidos.';
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      }
      
      return { success: false, error: mensagem };
    }
  },

  // Remover filho
  removerFilho: async (id) => {
    try {
      await apiClient.delete(`/filhos-beneficiados/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover filho:', error);
      return { success: false, error: 'Erro ao remover filho' };
    }
  },

  // Cadastrar beneficiado simples
  cadastrarBeneficiadoSimples: async (dadosBeneficiado) => {
    try {
      console.log('=== INICIANDO CADASTRO NO SERVICE ===');
      console.log('Dados recebidos:', dadosBeneficiado);
      
      // Payload conforme documentação API para endpoint cadastro-simples
      const payload = {
        nome: dadosBeneficiado.nome,
        cpf: dadosBeneficiado.cpf.replace(/\D/g, ''), // Remove formatação
        dataNascimento: dadosBeneficiado.dataNascimento, // LocalDate formato YYYY-MM-DD
        enderecoId: dadosBeneficiado.enderecoId // Integer - ID do endereço encontrado
      };

      console.log('Dados originais:', dadosBeneficiado);
      console.log('Payload para cadastro simples:', payload);
      console.log('Tipo do enderecoId:', typeof payload.enderecoId);
      console.log('Valor do enderecoId:', payload.enderecoId);
      
      // Validações antes de enviar
      if (!payload.nome || payload.nome.trim().length === 0) {
        console.error('Validação falhou: Nome vazio');
        return { success: false, error: 'Nome é obrigatório' };
      }
      if (!payload.cpf || payload.cpf.length !== 11) {
        console.error('Validação falhou: CPF inválido -', payload.cpf, 'Length:', payload.cpf?.length);
        return { success: false, error: 'CPF deve ter 11 dígitos' };
      }
      if (!payload.dataNascimento || !/^\d{4}-\d{2}-\d{2}$/.test(payload.dataNascimento)) {
        console.error('Validação falhou: Data inválida -', payload.dataNascimento);
        return { success: false, error: 'Data de nascimento deve estar no formato YYYY-MM-DD' };
      }
      if (!payload.enderecoId) {
        console.error('Validação falhou: EnderecoId vazio -', payload.enderecoId);
        return { success: false, error: 'ID do endereço é obrigatório' };
      }
      
      // Converter enderecoId para número se for string numérica
      if (typeof payload.enderecoId === 'string' && /^\d+$/.test(payload.enderecoId)) {
        payload.enderecoId = parseInt(payload.enderecoId, 10);
        console.log('EnderecoId convertido para número:', payload.enderecoId);
      } else if (typeof payload.enderecoId !== 'number') {
        console.error('Validação falhou: EnderecoId não é número nem string numérica -', payload.enderecoId, typeof payload.enderecoId);
        return { success: false, error: 'ID do endereço deve ser um número válido' };
      }
      
      console.log('Payload final após validações:', payload);
      console.log('Enviando requisição para: /beneficiados/cadastro-simples');
      
      const response = await apiClient.post('/beneficiados/cadastro-simples', payload);
      
      console.log('Resposta do servidor - Status:', response.status);
      console.log('Resposta do servidor - Data:', response.data);
      console.log('Cadastro realizado com sucesso!');
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('=== ERRO NO CADASTRO ===');
      console.error('Erro completo:', error);
      console.error('Resposta completa do erro:', error.response);
      
      let mensagem = 'Erro interno do servidor';
      
      if (error.response) {
        console.error('Status do erro:', error.response.status);
        console.error('Headers do erro:', error.response.headers);
        console.error('Dados do erro:', error.response.data);
        
        if (error.response.status === 400) {
          // Tentar extrair mensagem específica do backend
          if (error.response.data?.message) {
            mensagem = error.response.data.message;
          } else if (error.response.data?.errors) {
            // Se for um objeto de erros de validação
            if (Array.isArray(error.response.data.errors)) {
              mensagem = error.response.data.errors.join(', ');
            } else if (typeof error.response.data.errors === 'object') {
              const erros = Object.values(error.response.data.errors).flat();
              mensagem = erros.join(', ');
            } else {
              mensagem = 'Dados inválidos: ' + JSON.stringify(error.response.data.errors);
            }
          } else if (typeof error.response.data === 'string') {
            mensagem = error.response.data;
          } else {
            mensagem = 'Dados inválidos. Verifique os campos preenchidos.';
          }
        } else if (error.response.status === 409) {
          mensagem = 'CPF já cadastrado no sistema.';
        } else if (error.response.status === 404) {
          mensagem = 'Endereço não encontrado.';
        } else if (error.response.data?.message) {
          mensagem = error.response.data.message;
        }
      } else if (error.message === 'Network Error') {
        mensagem = 'Erro de conexão. Verifique sua internet.';
      } else if (error.message) {
        mensagem = error.message;
      }
      
      console.error('Mensagem de erro final:', mensagem);
      
      return { success: false, error: mensagem };
    }
  },

  // Cadastrar beneficiado completo
  cadastrarBeneficiadoCompleto: async (dadosBeneficiado) => {
    try {
      console.log('=== DEBUG CADASTRO COMPLETO ===');
      console.log('Dados recebidos:', dadosBeneficiado);
      console.log('Estado Civil original:', dadosBeneficiado.estadoCivil);
      
      // Função para validar e converter estado civil para enum válido
      const validarEstadoCivil = (estadoCivil) => {
        const estadosValidos = ['SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO', 'SEPARADO'];
        const estadoUpper = (estadoCivil || '').toUpperCase().trim();
        
        // Mapeamento de valores comuns para enum
        const mapeamento = {
          'SOLTEIRO': 'SOLTEIRO',
          'SOLTEIRA': 'SOLTEIRO',
          'CASADO': 'CASADO', 
          'CASADA': 'CASADO',
          'DIVORCIADO': 'DIVORCIADO',
          'DIVORCIADA': 'DIVORCIADO',
          'VIÚVO': 'VIUVO',
          'VIÚVA': 'VIUVO',
          'VIUVO': 'VIUVO',
          'SEPARADO': 'SEPARADO',
          'SEPARADA': 'SEPARADO'
        };
        
        const estadoMapeado = mapeamento[estadoUpper];
        if (estadoMapeado && estadosValidos.includes(estadoMapeado)) {
          console.log(`Estado civil mapeado: "${estadoCivil}" -> "${estadoMapeado}"`);
          return estadoMapeado;
        }
        
        console.warn(`Estado civil inválido: "${estadoCivil}", usando padrão: "SOLTEIRO"`);
        return 'SOLTEIRO';
      };
      
      // Payload conforme BeneficiadoRequestDto para cadastro completo
      const payload = {
        nome: dadosBeneficiado.nome,
        cpf: dadosBeneficiado.cpf.replace(/\D/g, ''), // Remove formatação
        rg: dadosBeneficiado.rg.replace(/\D/g, ''), // Remove formatação
        dataNascimento: dadosBeneficiado.dataNascimento, // LocalDate formato YYYY-MM-DD
        naturalidade: dadosBeneficiado.naturalidade || 'Brasileira',
        telefone: dadosBeneficiado.telefone.replace(/\D/g, ''), // Remove formatação
        estadoCivil: validarEstadoCivil(dadosBeneficiado.estadoCivil), // Enum values validado
        escolaridade: dadosBeneficiado.escolaridade,
        profissao: dadosBeneficiado.profissao,
        rendaMensal: dadosBeneficiado.rendaMensal, // Double
        empresa: dadosBeneficiado.empresa || '',
        cargo: dadosBeneficiado.cargo || '',
        religiao: dadosBeneficiado.religiao || '',
        enderecoId: dadosBeneficiado.enderecoId, // Integer - ID do endereço encontrado
        quantidadeDependentes: parseInt(dadosBeneficiado.quantidadeDependentes) || 0
        // Foto será tratada separadamente se necessário
      };

      console.log('=== PAYLOAD FINAL COMPLETO ===');
      console.log('payload.estadoCivil:', payload.estadoCivil);
      console.log('Payload completo:', payload);

      const response = await apiClient.post('/beneficiados', payload);
      return { success: true, data: response.data };
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao cadastrar beneficiado completo:', error);
      
      let mensagem = 'Erro interno do servidor';
      
      if (error.response?.status === 400) {
        mensagem = 'Dados inválidos. Verifique os campos preenchidos.';
      } else if (error.response?.status === 409) {
        mensagem = 'CPF já cadastrado no sistema.';
      } else if (error.response?.status === 404) {
        mensagem = 'Endereço não encontrado.';
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      } else if (error.message === 'Network Error') {
        mensagem = 'Erro de conexão. Verifique sua internet.';
      }
      
      return { success: false, error: mensagem };
    }
  },

  // Listar todos os beneficiados
  listarBeneficiados: async () => {
    try {
      const response = await apiClient.get('/beneficiados');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao listar beneficiados:', error);
      return { success: false, error: 'Erro ao carregar lista de beneficiados' };
    }
  },

  // Atualizar beneficiado
  atualizarBeneficiado: async (id, dadosBeneficiado) => {
    try {
      const payload = {
        nome: dadosBeneficiado.nome,
        cpf: dadosBeneficiado.cpf?.replace(/\D/g, ''),
        rg: dadosBeneficiado.rg?.replace(/\D/g, ''),
        dataNascimento: dadosBeneficiado.dataNascimento,
        naturalidade: dadosBeneficiado.naturalidade,
        telefone: dadosBeneficiado.telefone?.replace(/\D/g, ''),
        estadoCivil: dadosBeneficiado.estadoCivil,
        escolaridade: dadosBeneficiado.escolaridade,
        profissao: dadosBeneficiado.profissao,
        rendaMensal: dadosBeneficiado.rendaMensal,
        empresa: dadosBeneficiado.empresa,
        cargo: dadosBeneficiado.cargo,
        religiao: dadosBeneficiado.religiao,
        enderecoId: dadosBeneficiado.enderecoId,
        quantidadeDependentes: parseInt(dadosBeneficiado.quantidadeDependentes) || 0
      };

      const response = await apiClient.patch(`/beneficiados/${id}`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao atualizar beneficiado:', error);
      
      let mensagem = 'Erro ao atualizar beneficiado';
      
      if (error.response?.status === 400) {
        mensagem = 'Dados inválidos. Verifique os campos preenchidos.';
      } else if (error.response?.status === 404) {
        mensagem = 'Beneficiado não encontrado.';
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      }
      
      return { success: false, error: mensagem };
    }
  },

  // Remover beneficiado
  removerBeneficiado: async (id) => {
    try {
      await apiClient.delete(`/beneficiados/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover beneficiado:', error);
      
      let mensagem = 'Erro ao remover beneficiado';
      
      if (error.response?.status === 404) {
        mensagem = 'Beneficiado não encontrado.';
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      }
      
      return { success: false, error: mensagem };
    }
  },

  // Buscar beneficiado por ID
  buscarBeneficiadoPorId: async (id) => {
    try {
      const response = await apiClient.get(`/beneficiados/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar beneficiado:', error);
      return { success: false, error: 'Erro ao carregar dados do beneficiado' };
    }
  },

  // Buscar endereços (para o autocomplete)
  buscarEnderecos: async (busca) => {
    try {
      // Primeiro, tentar o endpoint direto de endereços
      let response;
      try {
        response = await apiClient.get('/enderecos');
        console.log('Resposta da API /enderecos:', response.data);
      } catch (error) {
        console.log('Erro no endpoint /enderecos, tentando alternativa...');
        // Se falhar, tentar buscar através de beneficiados (que pode incluir endereços)
        try {
          response = await apiClient.get('/beneficiados');
          // Extrair endereços únicos dos beneficiados
          const enderecosUnicos = [];
          const enderecosVistos = new Set();
          
          response.data.forEach(beneficiado => {
            if (beneficiado.endereco) {
              const chaveUnica = `${beneficiado.endereco.logradouro || beneficiado.endereco.rua}_${beneficiado.endereco.numero}`;
              if (!enderecosVistos.has(chaveUnica)) {
                enderecosVistos.add(chaveUnica);
                enderecosUnicos.push({
                  ...beneficiado.endereco,
                  id: beneficiado.endereco.id || beneficiado.enderecoId || beneficiado.id
                });
              }
            }
          });
          
          response.data = enderecosUnicos;
          console.log('Endereços extraídos de beneficiados:', response.data);
        } catch (beneficiadosError) {
          console.error('Erro ao buscar através de beneficiados:', beneficiadosError);
          return { success: false, error: 'Erro ao buscar endereços' };
        }
      }
      
      console.log('Primeiro endereço da lista:', response.data[0]); // Debug log para ver estrutura
      
      // Filtrar localmente se necessário
      if (busca && busca.trim()) {
        const enderecosFiltrados = response.data.filter(endereco => 
          endereco.logradouro?.toLowerCase().includes(busca.toLowerCase()) ||
          endereco.rua?.toLowerCase().includes(busca.toLowerCase()) ||
          endereco.bairro?.toLowerCase().includes(busca.toLowerCase()) ||
          endereco.cidade?.toLowerCase().includes(busca.toLowerCase())
        );
        console.log('Endereços filtrados:', enderecosFiltrados); // Debug log
        
        // Verificar se tem campo id, senão usar outro identificador
        const enderecosComId = enderecosFiltrados.map(endereco => {
          // Tentar encontrar ID em diferentes campos possíveis
          const enderecoId = endereco.id || endereco.enderecoId || endereco.codigo || endereco.idEndereco;
          if (enderecoId) {
            // Se o ID está em idEndereco, mover para id para compatibilidade
            if (endereco.idEndereco && !endereco.id) {
              endereco.id = endereco.idEndereco;
            }
            return endereco;
          } else {
            // Se não tem id, criar um baseado nos dados (último recurso)
            console.warn('Endereço sem ID encontrado, criando ID temporário:', endereco);
            return {
              ...endereco,
              id: `temp_${endereco.logradouro || endereco.rua}_${endereco.numero}_${endereco.bairro}`.replace(/[^a-zA-Z0-9_]/g, '_')
            };
          }
        });
        
        console.log('Endereços com ID ajustado:', enderecosComId); // Debug log
        return { success: true, data: enderecosComId };
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar endereços:', error);
      return { success: false, error: 'Erro ao buscar endereços' };
    }
  },

  // Cadastrar novo endereço
  cadastrarEndereco: async (dadosEndereco) => {
    try {
      console.log('=== DEBUG SERVICE CADASTRAR ENDERECO ===');
      console.log('dadosEndereco recebidos:', dadosEndereco);
      console.log('dadosEndereco.rua:', dadosEndereco.rua, '(tipo:', typeof dadosEndereco.rua, ')');
      console.log('dadosEndereco.numero:', dadosEndereco.numero, '(tipo:', typeof dadosEndereco.numero, ')');
      
      // Payload conforme EnderecoRequestDto do backend
      const payload = {
        logradouro: dadosEndereco.rua || '',
        numero: dadosEndereco.numero || '',
        complemento: dadosEndereco.complemento || '',
        bairro: dadosEndereco.bairro || '',
        cidade: dadosEndereco.cidade || '',
        estado: dadosEndereco.estado || '',
        cep: (dadosEndereco.cep || '').replace(/\D/g, ''), // Remove formatação
        tipoCesta: dadosEndereco.tipoCesta || 'Kit',
        dataEntrada: dadosEndereco.dataEntrada, // LocalDate formato YYYY-MM-DD
        dataSaida: dadosEndereco.dataSaida || null, // LocalDate formato YYYY-MM-DD ou null
        moradia: dadosEndereco.statusMoradia || '',
        tipoMoradia: dadosEndereco.tipoMoradia || '',
        status: dadosEndereco.statusCesta === 'Disponível' ? 'ABERTO' : 'FECHADO' // Conversão para enum da API
      };

      console.log('=== PAYLOAD FINAL SENDO ENVIADO ===');
      console.log('payload.logradouro:', payload.logradouro);
      console.log('payload.numero:', payload.numero);
      console.log('payload.dataEntrada:', payload.dataEntrada);
      console.log('payload.dataSaida:', payload.dataSaida);
      console.log('Payload completo:', payload);
      console.log('Dados originais recebidos:', dadosEndereco);
      
      const response = await apiClient.post('/enderecos', payload);
      return { success: true, data: response.data };
      return { success: true, data: response.data };
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao cadastrar endereço:', error);
      
      let mensagem = 'Erro interno do servidor';
      
      if (error.response?.status === 400) {
        mensagem = 'Dados inválidos. Verifique os campos preenchidos.';
      } else if (error.response?.status === 409) {
        mensagem = 'Endereço já cadastrado no sistema.';
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      } else if (error.message === 'Network Error') {
        mensagem = 'Erro de conexão. Verifique sua internet.';
      }
      
      return { success: false, error: mensagem };
    }
  },

  // Buscar endereço por ID
  buscarEnderecoPorId: async (id) => {
    try {
      const response = await apiClient.get(`/enderecos/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      return { success: false, error: 'Erro ao carregar dados do endereço' };
    }
  },

  // Buscar endereço por CEP usando ViaCEP integrado à API
  buscarEnderecoPorCep: async (cep) => {
    try {
      const cepLimpo = cep.replace(/\D/g, '');
      const response = await apiClient.get(`/enderecos/cep/${cepLimpo}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar endereço por CEP:', error);
      let mensagem = 'Erro ao buscar CEP';
      
      if (error.response?.status === 404) {
        mensagem = 'CEP não encontrado';
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      }
      
      return { success: false, error: mensagem };
    }
  }
};