import apiClient from '../provider/api.js';
import fileService from './fileService.js';

// Serviços para Beneficiados e Filhos
export const beneficiadoService = {
  
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

      const payload = {
        dataNascimento: dadosFilho.dataNascimento,
        isEstudante: Boolean(dadosFilho.isEstudante),
        hasCreche: Boolean(dadosFilho.hasCreche),
        beneficiadoId: parseInt(dadosFilho.beneficiadoId),
        enderecoId: parseInt(dadosFilho.enderecoId)
      };

      console.log('🚀 Tentando POST para:', '/filhos-beneficiados');
      console.log('Payload completo para cadastro de filho:', payload);
      console.log('Payload JSON:', JSON.stringify(payload, null, 2));

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

  buscarFilhoPorId: async (id) => {
    try {
      const response = await apiClient.get(`/filhos-beneficiados/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar filho:', error);
      return { success: false, error: 'Erro ao carregar dados do filho' };
    }
  },

  listarFilhosPorBeneficiado: async (beneficiadoId) => {
    try {
      const response = await apiClient.get(`/filhos-beneficiados?beneficiadoId=${beneficiadoId}`);

      if (response.data?.content) {
        return { success: true, data: response.data.content };
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao listar filhos:', error);

      if (error.response?.status === 404) {
        return { success: true, data: [] };
      }

      return { success: false, error: 'Erro ao carregar lista de filhos' };
    }
  },

  atualizarFilho: async (id, dadosFilho) => {
    try {
      const payload = {};

      if (dadosFilho.isEstudante !== undefined) {
        payload.isEstudante = Boolean(dadosFilho.isEstudante);
      }
      if (dadosFilho.hasCreche !== undefined) {
        payload.hasCreche = Boolean(dadosFilho.hasCreche);
      }

      console.log('Payload para atualização de filho (PATCH):', payload);
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

  removerFilho: async (id) => {
    try {
      await apiClient.delete(`/filhos-beneficiados/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover filho:', error);
      return { success: false, error: 'Erro ao remover filho' };
    }
  },

  cadastrarBeneficiadoSimples: async (dadosBeneficiado) => {
    try {
      console.log('=== INICIANDO CADASTRO NO SERVICE ===');
      console.log('Dados recebidos:', dadosBeneficiado);

      const payload = {
        nome: dadosBeneficiado.nome,
        cpf: dadosBeneficiado.cpf.replace(/\D/g, ''), 
        dataNascimento: dadosBeneficiado.dataNascimento, 
        enderecoId: dadosBeneficiado.enderecoId 
      };

      console.log('Dados originais:', dadosBeneficiado);
      console.log('Payload para cadastro simples:', payload);
      console.log('Tipo do enderecoId:', typeof payload.enderecoId);
      console.log('Valor do enderecoId:', payload.enderecoId);

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
          if (error.response.data?.message) {
            mensagem = error.response.data.message;
          } else if (error.response.data?.errors) {
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

  cadastrarBeneficiadoCompleto: async (dadosBeneficiado) => {
    try {
      console.log('=== DEBUG CADASTRO COMPLETO ===');
      console.log('Dados recebidos:', dadosBeneficiado);
      console.log('Estado Civil original:', dadosBeneficiado.estadoCivil);

      const validarEstadoCivil = (estadoCivil) => {
        const estadosValidos = ['SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO', 'SEPARADO'];
        const estadoUpper = (estadoCivil || '').toUpperCase().trim();

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

      let fotoId = null;

      if (dadosBeneficiado.fotoBeneficiado) {
        try {
          console.log('📸 Foto detectada! Iniciando upload separado...');
          console.log('   Tamanho da string Base64:', dadosBeneficiado.fotoBeneficiado.length, 'caracteres');

          fotoId = await fileService.uploadFoto(dadosBeneficiado.fotoBeneficiado, 'foto_beneficiado.jpg');

          console.log('✅ Foto enviada com sucesso!');
          console.log('   ID da foto recebido:', fotoId);

        } catch (fotoError) {
          console.error('❌ Erro ao fazer upload da foto:', fotoError);

          console.warn('⚠️ Continuando cadastro sem foto...');
          fotoId = null;
        }
      } else {
        console.log('ℹ️ Nenhuma foto fornecida, continuando cadastro sem foto');
      }

      const payload = {
        nome: dadosBeneficiado.nome,
        cpf: dadosBeneficiado.cpf.replace(/\D/g, ''),
        rg: dadosBeneficiado.rg.replace(/\D/g, ''), 
        dataNascimento: dadosBeneficiado.dataNascimento, 
        naturalidade: dadosBeneficiado.naturalidade || 'Brasileira',
        telefone: dadosBeneficiado.telefone.replace(/\D/g, ''), 
        estadoCivil: validarEstadoCivil(dadosBeneficiado.estadoCivil), 
        escolaridade: dadosBeneficiado.escolaridade,
        profissao: dadosBeneficiado.profissao,
        rendaMensal: dadosBeneficiado.rendaMensal, 
        empresa: dadosBeneficiado.empresa || '',
        cargo: dadosBeneficiado.cargo || '',
        religiao: dadosBeneficiado.religiao || '',
        enderecoId: dadosBeneficiado.enderecoId, 
        quantidadeDependentes: parseInt(dadosBeneficiado.quantidadeDependentes) || 0,
        fotoId: fotoId 
      };

      console.log('=== PAYLOAD FINAL COMPLETO ===');
      console.log('payload.estadoCivil:', payload.estadoCivil);
      console.log('payload.fotoId:', payload.fotoId);
      console.log('payload.fotoBeneficiado REMOVIDO - Agora usando fotoId:', fotoId ? `ID ${fotoId}` : 'Sem foto');
      console.log('Payload completo:', { ...payload });

      const response = await apiClient.post('/beneficiados', payload);
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
      } else if (error.message === 'Network Error') {
        mensagem = 'Erro de conexão. Verifique sua internet.';
      }

      return { success: false, error: mensagem };
    }
  },

  listarBeneficiados: async () => {
    try {
      const response = await apiClient.get('/beneficiados');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao listar beneficiados:', error);
      return { success: false, error: 'Erro ao carregar lista de beneficiados' };
    }
  },

  atualizarBeneficiado: async (id, dadosBeneficiado) => {
    try {
      const payload = {};

      if (dadosBeneficiado.naturalidade !== undefined) {
        payload.naturalidade = dadosBeneficiado.naturalidade;
      }
      if (dadosBeneficiado.telefone !== undefined) {
        payload.telefone = dadosBeneficiado.telefone?.replace(/\D/g, '');
      }
      if (dadosBeneficiado.estadoCivil !== undefined) {
        payload.estadoCivil = dadosBeneficiado.estadoCivil;
      }
      if (dadosBeneficiado.escolaridade !== undefined) {
        payload.escolaridade = dadosBeneficiado.escolaridade;
      }
      if (dadosBeneficiado.profissao !== undefined) {
        payload.profissao = dadosBeneficiado.profissao;
      }
      if (dadosBeneficiado.rendaMensal !== undefined) {
        payload.rendaMensal = dadosBeneficiado.rendaMensal;
      }
      if (dadosBeneficiado.empresa !== undefined) {
        payload.empresa = dadosBeneficiado.empresa;
      }
      if (dadosBeneficiado.cargo !== undefined) {
        payload.cargo = dadosBeneficiado.cargo;
      }
      if (dadosBeneficiado.religiao !== undefined) {
        payload.religiao = dadosBeneficiado.religiao;
      }
      if (dadosBeneficiado.enderecoId !== undefined) {
        payload.enderecoId = dadosBeneficiado.enderecoId;
      }
      if (dadosBeneficiado.quantidadeDependentes !== undefined) {
        payload.quantidadeDependentes = parseInt(dadosBeneficiado.quantidadeDependentes) || 0;
      }
      if (dadosBeneficiado.fotoId !== undefined) {
        payload.fotoId = dadosBeneficiado.fotoId;
      }

      console.log('📝 Payload PATCH (apenas campos editáveis):', payload);

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
      
      console.log('🏠 [cadastrarEndereco] Resposta completa da API:', response.data);
      console.log('🏠 [cadastrarEndereco] response.data.id:', response.data.id);
      console.log('🏠 [cadastrarEndereco] response.data.id_endereco:', response.data.id_endereco);
      console.log('🏠 [cadastrarEndereco] response.data.idEndereco:', response.data.idEndereco);
      
      // Garantir que temos o ID correto (pode ser 'id', 'id_endereco' ou 'idEndereco')
      const enderecoId = response.data.id || response.data.id_endereco || response.data.idEndereco;
      
      console.log('🏠 [cadastrarEndereco] 🔑 ID FINAL EXTRAÍDO:', enderecoId);
      
      if (!enderecoId) {
        console.error('🏠 [cadastrarEndereco] ❌ ERRO: Nenhum ID foi retornado pelo backend!');
        console.error('🏠 [cadastrarEndereco] Estrutura completa da resposta:', JSON.stringify(response.data, null, 2));
        return { 
          success: false, 
          error: 'Erro: Backend não retornou o ID do endereço cadastrado' 
        };
      }
      
      return { 
        success: true, 
        data: { 
          ...response.data, 
          id: enderecoId // Garantir que 'id' está presente
        } 
      };
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

  // 🏠 BUSCAR DADOS DA TABELA TIPO_MORADOR - ENDPOINTS REAIS DO BACKEND
  buscarTipoMoradorPorCpf: async (cpf) => {
    try {
      console.log('🏠 [buscarTipoMoradorPorCpf] Iniciando busca de tipo_morador para CPF:', cpf);

      // PASSO 1: Buscar o beneficiado para obter o ID
      console.log('🏠 [buscarTipoMoradorPorCpf] PASSO 1: Buscando beneficiado por CPF...');
      const beneficiadoResponse = await apiClient.get(`/beneficiados/cpf/${cpf}`);
      console.log('🏠 [buscarTipoMoradorPorCpf] Resposta da busca de beneficiado:', beneficiadoResponse.data);
      
      if (!beneficiadoResponse.data || !beneficiadoResponse.data.id) {
        console.log('🏠 [buscarTipoMoradorPorCpf] ❌ Beneficiado não encontrado para CPF:', cpf);
        return { success: false, error: 'Beneficiado não encontrado' };
      }

      const beneficiadoId = beneficiadoResponse.data.id;
      console.log('🏠 [buscarTipoMoradorPorCpf] ✅ Beneficiado encontrado com ID:', beneficiadoId);

      // PASSO 2: Buscar todos os tipos de morador e filtrar por beneficiado (ENDPOINT REAL)
      try {
        console.log('🏠 [buscarTipoMoradorPorCpf] PASSO 2: Buscando todos os tipos de morador via GET /tipo-moradores');
        const tiposMoradorResponse = await apiClient.get('/tipo-moradores');
        console.log('🏠 [buscarTipoMoradorPorCpf] Resposta bruta da API:', tiposMoradorResponse.data);

        if (tiposMoradorResponse.data && Array.isArray(tiposMoradorResponse.data)) {
          console.log('🏠 📋 Total de tipos de morador encontrados:', tiposMoradorResponse.data.length);

          // Filtrar pelo beneficiado - agora verificando o objeto beneficiado aninhado
          const tipoMoradorEncontrado = tiposMoradorResponse.data.find(tm => {
            console.log('🏠 🔍 Comparando:', {
              tm_beneficiado_cpf: tm.beneficiado?.cpf,
              tm_fk_beneficiado: tm.fk_beneficiado,
              tm_beneficiadoId: tm.beneficiadoId,
              beneficiadoId_procurado: beneficiadoId,
              cpf_procurado: cpf
            });

            // Verificar múltiplas possibilidades:
            // 1. Comparar IDs diretos
            if (tm.fk_beneficiado === beneficiadoId || tm.beneficiadoId === beneficiadoId ||
                tm.fk_beneficiado === beneficiadoId.toString() || tm.beneficiadoId === beneficiadoId.toString()) {
              return true;
            }
            
            // 2. Comparar CPF do objeto beneficiado aninhado
            if (tm.beneficiado?.cpf) {
              const cpfLimpo = cpf.replace(/\D/g, '');
              const cpfBeneficiadoLimpo = tm.beneficiado.cpf.replace(/\D/g, '');
              if (cpfLimpo === cpfBeneficiadoLimpo) {
                return true;
              }
            }
            
            return false;
          });

          if (tipoMoradorEncontrado) {
            console.log('🏠 ✅ Tipo morador encontrado via filtro:', tipoMoradorEncontrado);
            console.log('🏠 📊 Quantidades encontradas:', {
              crianca: tipoMoradorEncontrado.quantidadeCrianca || tipoMoradorEncontrado.quantidade_crianca || 0,
              adolescente: tipoMoradorEncontrado.quantidadeAdolescente || tipoMoradorEncontrado.quantidade_adolescente || 0,
              jovem: tipoMoradorEncontrado.quantidadeJovem || tipoMoradorEncontrado.quantidade_jovem || 0,
              idoso: tipoMoradorEncontrado.quantidadeIdoso || tipoMoradorEncontrado.quantidade_idoso || 0,
              gestante: tipoMoradorEncontrado.quantidadeGestante || tipoMoradorEncontrado.quantidade_gestante || 0,
              deficiente: tipoMoradorEncontrado.quantidadeDeficiente || tipoMoradorEncontrado.quantidade_deficiente || 0,
              outros: tipoMoradorEncontrado.quantidadeOutros || tipoMoradorEncontrado.quantidade_outros || 0
            });
            return { success: true, data: tipoMoradorEncontrado };
          } else {
            console.log('🏠 ⚠️ Nenhum tipo morador encontrado para beneficiado ID:', beneficiadoId);
            console.log('🏠 📋 Estrutura COMPLETA dos registros na tabela:', tiposMoradorResponse.data);
            console.log('🏠 📋 Apenas os IDs disponíveis:', tiposMoradorResponse.data.map(tm => ({
              id: tm.id,
              idTipoMorador: tm.idTipoMorador,
              fk_beneficiado: tm.fk_beneficiado,
              beneficiadoId: tm.beneficiadoId,
              todasAsChaves: Object.keys(tm)
            })));
          }
        }
      } catch (listagemError) {
        console.log('🏠 ⚠️ Erro ao buscar lista de tipos de morador:', listagemError.response?.status || listagemError.message);
      }

      // Se chegou aqui, não encontrou dados na API
      console.log('🏠 ❌ Nenhum dado de tipo_morador encontrado na API para este beneficiado');
      return {
        success: false,
        error: 'Dados de tipo_morador não encontrados na API',
        warning: 'NOT_FOUND',
        beneficiadoId: beneficiadoId
      };

    } catch (error) {
      console.error('🏠 💥 Erro inesperado ao buscar tipo_morador:', error);
      return {
        success: false,
        error: 'Erro inesperado ao buscar dados de tipo_morador',
        warning: 'UNEXPECTED_ERROR'
      };
    }
  },

  // Buscar dados de tipo_morador por ID do beneficiado
  buscarTipoMoradorPorBeneficiado: async (beneficiadoId) => {
    try {
      console.log('🏠 Buscando dados de tipo_morador para beneficiado ID:', beneficiadoId);
      const response = await apiClient.get(`/tipo-morador/beneficiado/${beneficiadoId}`);
      console.log('🏠 Dados de tipo_morador recebidos:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar tipo_morador por beneficiado:', error);

      let mensagem = 'Erro interno do servidor';

      if (error.response?.status === 404) {
        mensagem = 'Dados de tipo de morador não encontrados para este beneficiado.';
        console.log('⚠️ Tipo de morador não encontrado para beneficiado ID:', beneficiadoId);
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      }

      return { success: false, error: mensagem };
    }
  },

  // 🆕 Buscar dados de tipo_morador por ID do endereço
  buscarTipoMoradorPorEndereco: async (enderecoId) => {
    try {
      console.log('🏠 [buscarTipoMoradorPorEndereco] Buscando tipo_morador para endereço ID:', enderecoId);
      
      // Buscar todos os tipos de morador
      const tiposMoradorResponse = await apiClient.get('/tipo-moradores');
      
      if (tiposMoradorResponse.data && Array.isArray(tiposMoradorResponse.data)) {
        console.log('🏠 [buscarTipoMoradorPorEndereco] Total de registros:', tiposMoradorResponse.data.length);
        
        // Filtrar pelo endereço
        const tipoMoradorEncontrado = tiposMoradorResponse.data.find(tm => {
          console.log('🏠 [buscarTipoMoradorPorEndereco] Comparando endereço:', {
            tm_endereco_id: tm.endereco?.idEndereco || tm.endereco?.id,
            enderecoId_procurado: enderecoId
          });
          
          // Verificar no objeto endereco aninhado
          if (tm.endereco) {
            const tmEnderecoId = tm.endereco.idEndereco || tm.endereco.id;
            return tmEnderecoId === enderecoId || tmEnderecoId === enderecoId.toString() ||
                   tmEnderecoId === parseInt(enderecoId);
          }
          
          return false;
        });
        
        if (tipoMoradorEncontrado) {
          console.log('🏠 [buscarTipoMoradorPorEndereco] ✅ Encontrado:', tipoMoradorEncontrado);
          return { success: true, data: tipoMoradorEncontrado };
        } else {
          console.log('🏠 [buscarTipoMoradorPorEndereco] ❌ Não encontrado para endereço:', enderecoId);
          return { success: false, error: 'Dados não encontrados para este endereço' };
        }
      }
      
      return { success: false, error: 'Nenhum tipo de morador cadastrado' };
    } catch (error) {
      console.error('🏠 [buscarTipoMoradorPorEndereco] Erro:', error);
      return { success: false, error: 'Erro ao buscar tipo_morador por endereço' };
    }
  },

  // Buscar dados de tipo_morador por ID do beneficiado (MÉTODO ANTIGO - MANTER COMPATIBILIDADE)
  buscarTipoMoradorPorBeneficiadoLegacy: async (beneficiadoId) => {
    try {
      console.log('🏠 Buscando dados de tipo_morador para beneficiado ID:', beneficiadoId);
      const response = await apiClient.get(`/tipo-morador/beneficiado/${beneficiadoId}`);
      console.log('🏠 Dados de tipo_morador recebidos:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar tipo_morador por beneficiado:', error);

      let mensagem = 'Erro interno do servidor';

      if (error.response?.status === 404) {
        mensagem = 'Dados de tipo de morador não encontrados para este beneficiado.';
        console.log('⚠️ Tipo de morador não encontrado para beneficiado ID:', beneficiadoId);
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      } else if (error.message === 'Network Error') {
        mensagem = 'Erro de conexão. Verifique sua internet.';
      }

      return { success: false, error: mensagem };
    }
  },

  // 🏠 CADASTRAR DADOS NA TABELA TIPO_MORADOR - ENDPOINT REAL DO BACKEND  
  cadastrarTipoMorador: async (dadosTipoMorador) => {
    try {
      console.log('🏠 Cadastrando dados de tipo_morador com dados:', dadosTipoMorador);

      // Payload conforme documentação do backend (camelCase)
      const payload = {
        quantidadeCrianca: parseInt(dadosTipoMorador.quantidade_crianca) || 0,
        quantidadeAdolescente: parseInt(dadosTipoMorador.quantidade_adolescente) || 0,
        quantidadeJovem: parseInt(dadosTipoMorador.quantidade_jovem) || 0,
        quantidadeIdoso: parseInt(dadosTipoMorador.quantidade_idoso) || 0,
        quantidadeGestante: parseInt(dadosTipoMorador.quantidade_gestante) || 0,
        quantidadeDeficiente: parseInt(dadosTipoMorador.quantidade_deficiente) || 0,
        quantidadeOutros: parseInt(dadosTipoMorador.quantidade_outros) || 0,
        beneficiadoId: dadosTipoMorador.fk_beneficiado,
        enderecoId: dadosTipoMorador.fk_endereco
      };

      console.log('🏠 Payload preparado para API (camelCase):', payload);

      // Validações obrigatórias conforme backend
      if (!payload.beneficiadoId) {
        console.log('🏠 ❌ beneficiadoId é obrigatório');
        return { success: false, error: 'ID do beneficiado é obrigatório' };
      }

      if (!payload.enderecoId) {
        console.log('🏠 ❌ enderecoId é obrigatório');
        return { success: false, error: 'ID do endereço é obrigatório' };
      }

      // USAR ENDPOINT REAL: POST /tipo-moradores
      try {
        console.log('🏠 Tentando cadastrar via endpoint REAL: POST /tipo-moradores');
        const response = await apiClient.post('/tipo-moradores', payload);
        console.log('🏠 ✅ Tipo de morador cadastrado com sucesso na API:', response.data);
        return { success: true, data: response.data };
      } catch (apiError) {
        console.log('🏠 ⚠️ Erro ao cadastrar na API:', apiError.response?.status, apiError.response?.data);

        // Se for erro 400, mostrar detalhes
        if (apiError.response?.status === 400) {
          console.log('🏠 ❌ Erro de validação no backend:', apiError.response.data);
          return {
            success: false,
            error: `Erro de validação: ${apiError.response.data.message || 'Dados inválidos'}`
          };
        }

        // Para outros erros, salvar localmente como fallback
        console.log('🏠 💾 API indisponível, salvando localmente como fallback...');

        const dadosParaSalvar = {
          ...payload,
          id: Date.now(), // ID temporário
          dataHoraCadastro: new Date().toISOString(),
          status: 'PENDENTE_SINCRONIZACAO'
        };

        const tiposMoradorSalvos = JSON.parse(localStorage.getItem('tiposMoradorLocal') || '[]');
        tiposMoradorSalvos.push(dadosParaSalvar);
        localStorage.setItem('tiposMoradorLocal', JSON.stringify(tiposMoradorSalvos));

        console.log('🏠 💾 Dados salvos localmente:', dadosParaSalvar);

        return {
          success: true,
          data: dadosParaSalvar,
          warning: 'Dados salvos localmente - API indisponível no momento'
        };
      }

    } catch (error) {
      console.error('🏠 💥 Erro inesperado ao cadastrar tipo_morador:', error);
      return {
        success: false,
        error: 'Erro inesperado ao cadastrar dados de tipo_morador'
      };
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
  },

  // 🏠 ATUALIZAR DADOS DA TABELA TIPO_MORADOR - ENDPOINT REAL DO BACKEND
  atualizarTipoMorador: async (id, dadosTipoMorador) => {
    try {
      console.log('🏠 Atualizando tipo_morador ID:', id, 'com dados:', dadosTipoMorador);

      // Payload conforme estrutura do backend
      const payload = {
        quantidade_crianca: parseInt(dadosTipoMorador.quantidade_crianca) || 0,
        quantidade_adolescente: parseInt(dadosTipoMorador.quantidade_adolescente) || 0,
        quantidade_jovem: parseInt(dadosTipoMorador.quantidade_jovem) || 0,
        quantidade_idoso: parseInt(dadosTipoMorador.quantidade_idoso) || 0,
        quantidade_gestante: parseInt(dadosTipoMorador.quantidade_gestante) || 0,
        quantidade_deficiente: parseInt(dadosTipoMorador.quantidade_deficiente) || 0,
        quantidade_outros: parseInt(dadosTipoMorador.quantidade_outros) || 0,
        fk_beneficiado: dadosTipoMorador.fk_beneficiado,
        fk_endereco: dadosTipoMorador.fk_endereco
      };

      console.log('🏠 Payload para atualização:', payload);

      // USAR ENDPOINT REAL: PATCH /tipo-moradores/{id}
      const response = await apiClient.patch(`/tipo-moradores/${id}`, payload);
      console.log('🏠 ✅ Tipo morador atualizado com sucesso:', response.data);
      return { success: true, data: response.data };

    } catch (error) {
      console.error('🏠 ❌ Erro ao atualizar tipo_morador:', error);

      let mensagem = 'Erro ao atualizar dados';

      if (error.response?.status === 404) {
        mensagem = 'Tipo de morador não encontrado';
      } else if (error.response?.status === 400) {
        mensagem = 'Dados inválidos para atualização';
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      }

      return { success: false, error: mensagem };
    }
  },

  // 🏠 EXCLUIR DADOS DA TABELA TIPO_MORADOR - ENDPOINT REAL DO BACKEND
  excluirTipoMorador: async (id) => {
    try {
      console.log('🏠 Excluindo tipo_morador ID:', id);

      // USAR ENDPOINT REAL: DELETE /tipo-moradores/{id}
      const response = await apiClient.delete(`/tipo-moradores/${id}`);
      console.log('🏠 ✅ Tipo morador excluído com sucesso');
      return { success: true, data: response.data };

    } catch (error) {
      console.error('🏠 ❌ Erro ao excluir tipo_morador:', error);

      let mensagem = 'Erro ao excluir dados';

      if (error.response?.status === 404) {
        mensagem = 'Tipo de morador não encontrado';
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      }

      return { success: false, error: mensagem };
    }
  },

  // 🔄 SINCRONIZAR DADOS LOCAIS DE TIPO_MORADOR COM O BACKEND
  sincronizarTiposMoradorLocais: async () => {
    try {
      console.log('🔄 Iniciando sincronização de tipos de morador locais...');

      const tiposMoradorLocais = JSON.parse(localStorage.getItem('tiposMoradorLocal') || '[]');

      if (tiposMoradorLocais.length === 0) {
        console.log('🔄 Nenhum dado local para sincronizar');
        return { success: true, sincronizados: 0 };
      }

      console.log('🔄 Encontrados', tiposMoradorLocais.length, 'registros locais para sincronizar');

      let sincronizados = 0;
      const falhas = [];

      for (const tipoMorador of tiposMoradorLocais) {
        try {
          // Remover campos temporários
          const { id, dataHoraCadastro, status, ...dadosParaEnviar } = tipoMorador;

          const response = await this.cadastrarTipoMorador(dadosParaEnviar);

          if (response.success && !response.warning) {
            sincronizados++;
            console.log('🔄 ✅ Registro sincronizado:', dadosParaEnviar.fk_cpf);
          } else {
            falhas.push({ cpf: dadosParaEnviar.fk_cpf, erro: response.error || 'Falha na sincronização' });
          }
        } catch (error) {
          falhas.push({ cpf: tipoMorador.fk_cpf, erro: error.message });
        }
      }

      // Remover registros sincronizados com sucesso
      if (sincronizados > 0) {
        const registrosRestantes = tiposMoradorLocais.slice(sincronizados);
        localStorage.setItem('tiposMoradorLocal', JSON.stringify(registrosRestantes));
        console.log('🔄 ✅', sincronizados, 'registros sincronizados com sucesso');
      }

      if (falhas.length > 0) {
        console.log('🔄 ⚠️', falhas.length, 'registros falharam na sincronização:', falhas);
      }

      return {
        success: true,
        sincronizados,
        falhas: falhas.length,
        detalhes: falhas
      };

    } catch (error) {
      console.error('🔄 ❌ Erro geral na sincronização:', error);
      return { success: false, error: error.message };
    }
  }
};