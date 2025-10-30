let cache = null

const fetchDados = () =>
  fetch('/dados.json')
    .then((res) => {
      if (!res.ok) throw new Error('Falha ao carregar /dados.json')
      return res.json()
    })
    .then((d) => {
      cache = d
      return JSON.parse(JSON.stringify(d))
    })

/* --- Funções GET --- */

export const getDados = () => {
  if (cache) return Promise.resolve(JSON.parse(JSON.stringify(cache)))
  return fetchDados()
}

export const getPrefacio = () =>
  getDados().then((d) => JSON.parse(JSON.stringify(d.prefacioData || {})))

export const getUnidades = () =>
  getDados().then((d) => JSON.parse(JSON.stringify(d.unidadesData || [])))

export const getAreaComum = () =>
  getDados().then((d) => JSON.parse(JSON.stringify(d.areacomumData || [])))

export const getMateriais = () =>
  getDados().then((d) => JSON.parse(JSON.stringify(d.materialData || [])))

export const getObservacoes = () =>
  getDados().then((d) => JSON.parse(JSON.stringify(d.observacoesData || [])))

/* --- Funções SET (Atualizam o cache local) --- */

export const setPrefacio = (novoPrefacio) =>
  getDados().then(() => {
    cache.prefacioData = novoPrefacio;
    return JSON.parse(JSON.stringify(cache.prefacioData));
  });

export const setUnidades = (novasUnidades) =>
  getDados().then(() => {
    cache.unidadesData = novasUnidades;
    return JSON.parse(JSON.stringify(cache.unidadesData));
  });

export const setAreaComum = (novaAreaComum) =>
  getDados().then(() => {
    cache.areacomumData = novaAreaComum;
    return JSON.parse(JSON.stringify(cache.areacomumData));
  });

export const setMateriais = (novosMateriais) =>
  getDados().then(() => {
    cache.materialData = novosMateriais;
    return JSON.parse(JSON.stringify(cache.materialData));
  });

export const setObservacoes = (novasObservacoes) =>
  getDados().then(() => {
    cache.observacoesData = novasObservacoes;
    return JSON.parse(JSON.stringify(cache.observacoesData));
  });


import axios from 'axios'

// --- Configuração Base do Cliente API ---
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// Helper para serializar arrays como repeated params (marcas=1&marcas=2)
const paramsSerializer = (params) => {
  const searchParams = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === null || typeof value === 'undefined') return
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v))
    } else {
      searchParams.append(key, value)
    }
  })
  return searchParams.toString()
}

// Cria uma instância do axios com configurações padrão
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  paramsSerializer,
})

// --- Autenticação ---
/**
 * Define o token JWT Bearer para todas as requisições futuras.
 * Você deve chamar esta função após o login (obtenção do token).
 * @param {string|null} token - O token de acesso (access token) ou null para remover.
 */
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common['Authorization']
  }
}

// --- Helpers utilitários ---
const STATUS_MAP = {
  0: 'PENDENTE',
  1: 'EM_ANDAMENTO',
  2: 'FINALIZADO',
}

/**
 * Normaliza o parâmetro status para o formato esperado pela API.
 * Aceita número (0,1,2) ou string ('PENDENTE', 'EM_ANDAMENTO', 'FINALIZADO').
 * Retorna undefined se status for null/invalid — o parâmetro será omitido.
 */
const normalizeStatus = (status) => {
  if (status === null || typeof status === 'undefined') return undefined
  if (typeof status === 'number') return STATUS_MAP[status]
  if (typeof status === 'string') {
    const s = status.toUpperCase()
    if (['PENDENTE', 'EM_ANDAMENTO', 'FINALIZADO'].includes(s)) return s
  }
  return undefined
}

const cleanParams = (params) => {
  const out = {}
  Object.keys(params || {}).forEach((k) => {
    const v = params[k]
    if (v !== null && typeof v !== 'undefined' && v !== '') out[k] = v
  })
  return out
}

/**
 * Força download de um blob (auxiliar para PDFs retornados como blob)
 * @param {Blob} blob
 * @param {string} filename
 */
export const saveBlob = (blob, filename = 'download.bin') => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

// --- Funções do Endpoint: /api/marcas ---
/**
 * Lista todas as marcas (GET /api/marcas/)
 * @param {string|null} [search]
 */
export const getMarcas = (search = null) => {
  const config = { params: cleanParams({ search }) }
  return apiClient.get('/marcas/', config)
}

export const createMarca = (marcaData) => apiClient.post('/marcas/', marcaData)
export const getMarcaById = (id) => apiClient.get(`/marcas/${id}/`)
export const updateMarca = (id, marcaData) => apiClient.put(`/marcas/${id}/`, marcaData)
export const partialUpdateMarca = (id, marcaData) => apiClient.patch(`/marcas/${id}/`, marcaData)
export const deleteMarca = (id) => apiClient.delete(`/marcas/${id}/`)

// --- Funções de Autenticação ---
export const login = (username, password) => apiClient.post('/token/', { username, password })
export const refreshToken = (refreshToken) => apiClient.post('/token/refresh/', { refresh: refreshToken })

// --- Funções do Endpoint: /api/obras ---
export const obras = {
  /**
   * Lista obras. Parâmetros opcionais: search, status (number|string), cidade, estado
   * @param {string|null} search
   * @param {number|string|null} status
   * @param {string|null} cidade
   * @param {string|null} estado
   */
  list: (search = null, status = null, cidade = null, estado = null) => {
    const normalizedStatus = normalizeStatus(status)
    const params = cleanParams({ search, status: normalizedStatus, cidade, estado })
    return apiClient.get('/obras/', { params })
  },

  create: (obraData) => apiClient.post('/obras/', obraData),
  retrieve: (id) => apiClient.get(`/obras/${id}/`),
  update: (id, obraData) => apiClient.put(`/obras/${id}/`, obraData),
  partialUpdate: (id, obraData) => apiClient.patch(`/obras/${id}/`, obraData),
  destroy: (id) => apiClient.delete(`/obras/${id}/`),

  // --- Ações customizadas ---, alinhadas à spec OpenAPI (Português)
  /**
   * Duplica uma obra.
   * A spec espera POST /api/obras/{id}/duplicar/ com um body (segundo o YAML),
   * então permitimos enviar opcionalmente `data` com o payload da nova obra.
   * @param {number|string} id
   * @param {Object|null} data (opcional)
   */
  duplicate: (id, data = null) => apiClient.post(`/obras/${id}/duplicar/`, data || {}),

  /**
   * Gera/baixa o PDF da obra.
   * A spec usa /api/obras/{id}/gerar-pdf/ (GET). Aqui tratamos retornos JSON ou binários.
   * Retorna a própria resposta Axios (use .then para lidar com blob ou json).
   */
  generatePdf: async (id) => {
    const res = await apiClient.get(`/obras/${id}/gerar-pdf/`, { responseType: 'blob' })
    const contentType = res.headers['content-type'] || ''
    // Se a API retornou JSON (por exemplo: application/json), podemos tentar decodificar
    if (contentType.includes('application/json')) {
      // transformar blob em string e parsear JSON
      const text = await res.data.text()
      try {
        return JSON.parse(text)
      } catch (err) {
        // retornamos o texto cru se não for JSON válido
        return text
      }
    }
    // Caso contrário, presumimos que é um arquivo binário (pdf)
    return res
  },

  /**
   * Conveniência: baixa o PDF diretamente como arquivo com nome sugerido.
   * @param {number|string} id
   * @param {string} filename
   */
  downloadPdf: async (id, filename = `obra-${id}.pdf`) => {
    const res = await obras.generatePdf(id)
    if (res && res.data instanceof Blob) saveBlob(res.data, filename)
    return res
  },
}

// --- Funções do Endpoint: /api/materiais ---
export const materiais = {
  list: (search = null, item = null, marcas = null) => {
    // marcas pode ser array de ints; o paramsSerializer irá serializar corretamente
    const params = cleanParams({ search, item, marcas })
    return apiClient.get('/materiais/', { params })
  },
  create: (materialData) => apiClient.post('/materiais/', materialData),
  retrieve: (id) => apiClient.get(`/materiais/${id}/`),
  update: (id, materialData) => apiClient.put(`/materiais/${id}/`, materialData),
  partialUpdate: (id, materialData) => apiClient.patch(`/materiais/${id}/`, materialData),
  destroy: (id) => apiClient.delete(`/materiais/${id}/`),
}

// --- Funções do Endpoint: /api/ambientes ---
export const ambientes = {
  /**
   * Lista ambientes. Parâmetros opcionais: obra (int), torre (int)
   * @param {number|null} obra
   * @param {number|null} torre
   */
  list: (obra = null, torre = null) => {
    const params = cleanParams({ obra, torre })
    return apiClient.get('/ambientes/', { params })
  },
  create: (ambienteData) => apiClient.post('/ambientes/', ambienteData),
  retrieve: (id) => apiClient.get(`/ambientes/${id}/`),
  update: (id, ambienteData) => apiClient.put(`/ambientes/${id}/`, ambienteData),
  partialUpdate: (id, ambienteData) => apiClient.patch(`/ambientes/${id}/`, ambienteData),
  destroy: (id) => apiClient.delete(`/ambientes/${id}/`),
}

// --- Funções do Endpoint: /api/descricoes ---
export const descricoes = {
  /**
   * Lista descrições. Parâmetro opcional: search
   * @param {string|null} search
   */
  list: (search = null) => {
    const params = cleanParams({ search })
    return apiClient.get('/descricoes/', { params })
  },
  create: (descricaoData) => apiClient.post('/descricoes/', descricaoData),
  retrieve: (id) => apiClient.get(`/descricoes/${id}/`),
  update: (id, descricaoData) => apiClient.put(`/descricoes/${id}/`, descricaoData),
  partialUpdate: (id, descricaoData) => apiClient.patch(`/descricoes/${id}/`, descricaoData),
  destroy: (id) => apiClient.delete(`/descricoes/${id}/`),
}

// --- Funções do Endpoint: /api/itens ---
export const itens = {
  /**
   * Lista itens. Parâmetros opcionais: ambiente (int), search
   * @param {number|null} ambiente
   * @param {string|null} search
   */
  list: (ambiente = null, search = null) => {
    const params = cleanParams({ ambiente, search })
    return apiClient.get('/itens/', { params })
  },
  create: (itemData) => apiClient.post('/itens/', itemData),
  retrieve: (id) => apiClient.get(`/itens/${id}/`),
  update: (id, itemData) => apiClient.put(`/itens/${id}/`, itemData),
  partialUpdate: (id, itemData) => apiClient.patch(`/itens/${id}/`, itemData),
  destroy: (id) => apiClient.delete(`/itens/${id}/`),
}

// --- Funções do Endpoint: /api/torres ---
export const torres = {
  /**
   * Lista torres. Parâmetro opcional: obra
   * @param {number|null} obra
   */
  list: (obra = null) => {
    const params = cleanParams({ obra })
    return apiClient.get('/torres/', { params })
  },
  create: (torreData) => apiClient.post('/torres/', torreData),
  retrieve: (id) => apiClient.get(`/torres/${id}/`),
  update: (id, torreData) => apiClient.put(`/torres/${id}/`, torreData),
  partialUpdate: (id, torreData) => apiClient.patch(`/torres/${id}/`, torreData),
  destroy: (id) => apiClient.delete(`/torres/${id}/`),
}

export default apiClient
