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
      console.log("� Cadastrando cesta:", dadosCesta);
      const response = await api.post("/cestas", dadosCesta);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("❌ Erro ao cadastrar cesta:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message || "Erro ao cadastrar cesta"
      };
    }
  },

  // Atualizar cesta
  async atualizarCesta(id, dadosCesta) {
    try {
      const response = await api.put(`/cestas/${id}`, dadosCesta);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Erro ao atualizar cesta:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao atualizar cesta"
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