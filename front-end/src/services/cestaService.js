import api from "../provider/api";

const cestaService = {
  // Listar todas as cestas
  async listarCestas() {
    try {
      const response = await api.get("/cestas");
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error("Erro ao listar cestas:", error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.response?.data?.message || "Erro ao listar cestas",
        data: []
      };
    }
  },

  // Buscar cesta por ID
  async buscarPorId(id) {
    try {
      const response = await api.get(`/cestas/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Erro ao buscar cesta:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao buscar cesta"
      };
    }
  },

  // Cadastrar nova cesta
  async cadastrarCesta(dadosCesta) {
    try {
      console.log("📦 Cadastrando cesta:", dadosCesta);
      console.log("📦 Tipo de dataEntradaEstoque:", typeof dadosCesta.dataEntradaEstoque);
      console.log("📦 Valor de dataEntradaEstoque:", dadosCesta.dataEntradaEstoque);
      
      const response = await api.post("/cestas", dadosCesta);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("❌ Erro ao cadastrar cesta:", error.response?.data || error.message);
      console.error("❌ Detalhes completos do erro:", error.response);
      
      // Mostrar erros de validação específicos
      if (error.response?.data?.errors) {
        console.error("❌ Erros de validação:", error.response.data.errors);
        error.response.data.errors.forEach((err, index) => {
          console.error(`❌ Erro ${index + 1}:`, err);
        });
      }
      
      // Extrair mensagem de erro mais específica
      let mensagemErro = "Erro ao cadastrar cesta";
      
      if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        // Se houver erros de validação, mostrar o primeiro
        const primeiroErro = error.response.data.errors[0];
        mensagemErro = primeiroErro.defaultMessage || primeiroErro.message || JSON.stringify(primeiroErro);
      } else if (error.response?.data?.message) {
        mensagemErro = error.response.data.message;
      } else if (error.response?.data?.error) {
        mensagemErro = error.response.data.error;
      } else if (error.response?.data) {
        mensagemErro = JSON.stringify(error.response.data);
      }
      
      return {
        success: false,
        error: mensagemErro
      };
    }
  },

  // Atualizar cesta
  async atualizarCesta(id, dadosCesta) {
    try {
      console.log("🔧 cestaService.atualizarCesta - ID:", id);
      console.log("🔧 cestaService.atualizarCesta - Dados:", dadosCesta);
      console.log("🔧 cestaService.atualizarCesta - URL:", `/cestas/${id}`);
      
      // Usar PATCH conforme especificação do backend
      const response = await api.patch(`/cestas/${id}`, dadosCesta);
      
      console.log("✅ cestaService.atualizarCesta - Sucesso:", response.data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("❌ cestaService.atualizarCesta - Erro:", error);
      console.error("❌ cestaService.atualizarCesta - Response:", error.response?.data);
      console.error("❌ cestaService.atualizarCesta - Status:", error.response?.status);
      
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data || "Erro ao atualizar cesta"
      };
    }
  },

  // Deletar cesta
  async deletarCesta(id) {
    try {
      await api.delete(`/cestas/${id}`);
      return {
        success: true
      };
    } catch (error) {
      console.error("Erro ao deletar cesta:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao deletar cesta"
      };
    }
  },

  // Obter tipos disponíveis em estoque (função auxiliar para compatibilidade)
  async obterTiposDisponiveis() {
    try {
      const cestas = await this.listarCestas();
      const tipos = {};

      // Agrupar por tipo e somar quantidades
      cestas.forEach(cesta => {
        if (!tipos[cesta.tipo]) {
          tipos[cesta.tipo] = {
            disponivel: false,
            quantidade: 0
          };
        }
        tipos[cesta.tipo].quantidade += cesta.quantidadeCestas || 0;
        tipos[cesta.tipo].disponivel = tipos[cesta.tipo].quantidade > 0;
      });

      // Garantir que sempre retorne os tipos esperados
      return {
        "KIT": tipos["KIT"] || { disponivel: false, quantidade: 0 },
        "BASICA": tipos["BASICA"] || { disponivel: false, quantidade: 0 }
      };

    } catch (error) {
      console.error("Erro ao obter tipos disponíveis:", error);
      return {
        "KIT": { disponivel: false, quantidade: 0 },
        "BASICA": { disponivel: false, quantidade: 0 }
      };
    }
  },

  // Filtrar cestas por tipo
  filtrarPorTipo(cestas, tipo) {
    return cestas.filter(cesta => 
      cesta.tipo === tipo && cesta.quantidadeCestas > 0
    );
  }
};

export { cestaService };