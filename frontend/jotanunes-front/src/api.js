import axios from 'axios'

// --- Configuração Base do Cliente API ---

// Cria uma instância do axios com configurações padrão
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Sua URL base da API
  timeout: 10000, // Tempo limite de 10 segundos
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// --- Autenticação ---

/**
 * Define o token JWT Bearer para todas as requisições futuras.
 * Você deve chamar esta função após o login (obtenção do token).
 * @param {string} token - O token de acesso (access token).
 */
export const setAuthToken = (token) => {
  if (token) {
    // Adiciona o token ao cabeçalho de autorização padrão
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    // Remove o cabeçalho se o token for nulo
    delete apiClient.defaults.headers.common['Authorization']
  }
}

// --- Funções do Endpoint: /api/marcas ---

/**
 * Lista todas as marcas (GET /api/marcas/)
 * @param {string} [search] - Termo opcional para busca.
 * @returns {Promise<Object[]>} - Uma promessa que resolve para a lista de marcas.
 */
export const getMarcas = (search = null) => {
  const config = {
    params: {},
  }

  if (search) {
    config.params.search = search
  }

  return apiClient.get('/marcas/', config)
}

/**
 * Cria uma nova marca (POST /api/marcas/)
 * @param {Object} marcaData - Os dados da nova marca. Ex: { nome: "Nome da Marca" }
 * @returns {Promise<Object>} - Uma promessa que resolve para a nova marca criada.
 */
export const createMarca = (marcaData) => {
  // O schema 'Marca' requer 'nome'
  return apiClient.post('/marcas/', marcaData)
}

/**
 * Obtém os detalhes de uma marca específica (GET /api/marcas/{id}/)
 * @param {number|string} id - O ID da marca.
 * @returns {Promise<Object>} - Uma promessa que resolve para os dados da marca.
 */
export const getMarcaById = (id) => {
  return apiClient.get(`/marcas/${id}/`)
}

/**
 * Atualiza uma marca existente (PUT /api/marcas/{id}/)
 * Requer que todos os campos sejam enviados.
 * @param {number|string} id - O ID da marca.
 * @param {Object} marcaData - Os dados completos da marca. Ex: { nome: "Nome Atualizado" }
 * @returns {Promise<Object>} - Uma promessa que resolve para os dados da marca atualizada.
 */
export const updateMarca = (id, marcaData) => {
  return apiClient.put(`/marcas/${id}/`, marcaData)
}

/**
 * Atualiza parcialmente uma marca existente (PATCH /api/marcas/{id}/)
 * Envia apenas os campos que você deseja alterar.
 * @param {number|string} id - O ID da marca.
 * @param {Object} marcaData - Os dados parciais da marca. Ex: { nome: "Nome Parcial" }
 * @returns {Promise<Object>} - Uma promessa que resolve para os dados da marca atualizada.
 */
export const partialUpdateMarca = (id, marcaData) => {
  return apiClient.patch(`/marcas/${id}/`, marcaData)
}

/**
 * Deleta uma marca (DELETE /api/marcas/{id}/)
 * @param {number|string} id - O ID da marca a ser deletada.
 * @returns {Promise<void>} - Uma promessa que resolve quando a deleção é concluída (status 204).
 */
export const deleteMarca = (id) => {
  return apiClient.delete(`/marcas/${id}/`)
}

// --- Funções de Autenticação (Bônus) ---

/**
 * Obtém os tokens de acesso e refresh.
 * @param {string} username - Nome de usuário.
 * @param {string} password - Senha.
 * @returns {Promise<Object>} - Promessa com { access, refresh }.
 */
export const login = (username, password) => {
  return apiClient.post('/token/', { username, password })
}

/**
 * Atualiza o token de acesso usando o token de refresh.
 * @param {string} refreshToken - O token de refresh.
 * @returns {Promise<Object>} - Promessa com { access }.
 */
export const refreshToken = (refreshToken) => {
  return apiClient.post('/token/refresh/', { refresh: refreshToken })
}

// --- Funções do Endpoint: /api/obras ---

/**
 * Funções para gerenciar o endpoint /api/obras/
 */
export const obras = {
  
  /**
   * Lista todas as obras (GET /api/obras/)
   * @param {string} [search] - Termo opcional para busca.
   * @param {number|string} [status] - Filtra por status (0=PENDENTE, 1=EM_ANDAMENTO, 2=FINALIZADO).
   * @returns {Promise<Object[]>} - Uma promessa que resolve para a lista de obras.
   */
  list: (search = null, status = null) => {
    const config = {
      params: {}
    };

    if (search) {
      config.params.search = search;
    }
    
    // A API permite filtrar por status, que parece ser um ID (0, 1, 2)
    if (status !== null) {
      config.params.status = status;
    }
    
    return apiClient.get('/obras/', config);
  },

  /**
   * Cria uma nova obra (POST /api/obras/)
   * O schema 'Obra' exige campos como 'nome', 'descricao', 'endereco' e 'cliente'.
   * @param {Object} obraData - Os dados da nova obra.
   * @returns {Promise<Object>} - Uma promessa que resolve para a nova obra criada.
   */
  create: (obraData) => {
    return apiClient.post('/obras/', obraData);
  },

  /**
   * Obtém os detalhes de uma obra específica (GET /api/obras/{id}/)
   * @param {number|string} id - O ID da obra.
   * @returns {Promise<Object>} - Uma promessa que resolve para os dados da obra.
   */
  retrieve: (id) => {
    return apiClient.get(`/obras/${id}/`);
  },

  /**
   * Atualiza uma obra existente (PUT /api/obras/{id}/)
   * @param {number|string} id - O ID da obra.
   * @param {Object} obraData - Os dados completos da obra.
   * @returns {Promise<Object>} - Uma promessa que resolve para os dados da obra atualizada.
   */
  update: (id, obraData) => {
    return apiClient.put(`/obras/${id}/`, obraData);
  },

  /**
   * Atualiza parcialmente uma obra existente (PATCH /api/obras/{id}/)
   * @param {number|string} id - O ID da obra.
   * @param {Object} obraData - Os dados parciais da obra.
   * @returns {Promise<Object>} - Uma promessa que resolve para os dados da obra atualizada.
   */
  partialUpdate: (id, obraData) => {
    return apiClient.patch(`/obras/${id}/`, obraData);
  },

  /**
   * Deleta uma obra (DELETE /api/obras/{id}/)
   * @param {number|string} id - O ID da obra a ser deletada.
   * @returns {Promise<void>} - Uma promessa que resolve quando a deleção é concluída (status 204).
   */
  destroy: (id) => {
    return apiClient.delete(`/obras/${id}/`);
  },

  // --- Ações Customizadas ---

  /**
   * Duplica uma obra (POST /api/obras/{id}/duplicate/)
   * @param {number|string} id - O ID da obra a ser duplicada.
   * @returns {Promise<Object>} - Uma promessa que resolve para a nova obra duplicada.
   */
  duplicate: (id) => {
    return apiClient.post(`/obras/${id}/duplicate/`);
  },

  /**
   * Gera o PDF de uma obra (GET /api/obras/{id}/pdf/)
   * Esta função pode exigir tratamento especial de resposta (ex: blob para download).
   * @param {number|string} id - O ID da obra para gerar o PDF.
   * @returns {Promise<Object>} - Uma promessa que resolve para a resposta do servidor (que pode ser um blob/arquivo).
   */
  generatePdf: (id) => {
    // É recomendado adicionar um cabeçalho para receber o arquivo.
    // O Axios pode retornar a resposta como um array buffer ou blob para download.
    return apiClient.get(`/obras/${id}/pdf/`, { responseType: 'blob' });
  }
};

// --- Funções do Endpoint: /api/materiais ---

/**
 * Funções para gerenciar o endpoint /api/materiais/
 */
export const materiais = {
  
  /**
   * Lista todos os materiais (GET /api/materiais/)
   * @param {string} [search] - Termo opcional para busca.
   * @returns {Promise<Object[]>} - Uma promessa que resolve para a lista de materiais.
   */
  list: (search = null) => {
    const config = {
      params: {}
    };

    if (search) {
      config.params.search = search;
    }
    
    return apiClient.get('/materiais/', config);
  },

  /**
   * Cria um novo material (POST /api/materiais/)
   * @param {Object} materialData - Os dados do novo material. Ex: { nome: "Bloco de Cimento", unidade_de_medida: "m3" }
   * @returns {Promise<Object>} - Uma promessa que resolve para o novo material criado.
   */
  create: (materialData) => {
    // O schema 'Material' geralmente requer 'nome' e 'unidade_de_medida'
    return apiClient.post('/materiais/', materialData);
  },

  /**
   * Obtém os detalhes de um material específico (GET /api/materiais/{id}/)
   * @param {number|string} id - O ID do material.
   * @returns {Promise<Object>} - Uma promessa que resolve para os dados do material.
   */
  retrieve: (id) => {
    return apiClient.get(`/materiais/${id}/`);
  },

  /**
   * Atualiza um material existente (PUT /api/materiais/{id}/)
   * Requer que todos os campos sejam enviados.
   * @param {number|string} id - O ID do material.
   * @param {Object} materialData - Os dados completos do material.
   * @returns {Promise<Object>} - Uma promessa que resolve para os dados do material atualizado.
   */
  update: (id, materialData) => {
    return apiClient.put(`/materiais/${id}/`, materialData);
  },

  /**
   * Atualiza parcialmente um material existente (PATCH /api/materiais/{id}/)
   * Envia apenas os campos que você deseja alterar.
   * @param {number|string} id - O ID do material.
   * @param {Object} materialData - Os dados parciais do material.
   * @returns {Promise<Object>} - Uma promessa que resolve para os dados do material atualizado.
   */
  partialUpdate: (id, materialData) => {
    return apiClient.patch(`/materiais/${id}/`, materialData);
  },

  /**
   * Deleta um material (DELETE /api/materiais/{id}/)
   * @param {number|string} id - O ID do material a ser deletado.
   * @returns {Promise<void>} - Uma promessa que resolve quando a deleção é concluída (status 204).
   */
  destroy: (id) => {
    return apiClient.delete(`/materiais/${id}/`);
  }
};