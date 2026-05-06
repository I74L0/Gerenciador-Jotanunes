let cache = null

const fetchDados = () =>
  fetch('/template.json')
    .then((res) => {
      if (!res.ok) throw new Error('Falha ao carregar template.json')
      return res.json()
    })
    .then((d) => {
      cache = d
      return JSON.parse(JSON.stringify(d))
    })
    .catch((err) => {
      console.warn('Não foi possível carregar template.json, utilizando modelo padrão vazio.', err)
      const defaultTemplate = {
        nome: "",
        estado: "",
        cidade: "",
        texto_prefacio: "",
        observacao_final: "",
        ambientes: [],
        materiais: []
      }
      cache = defaultTemplate
      return JSON.parse(JSON.stringify(defaultTemplate))
    })

export const getTemplate = () => {
  if (cache) return Promise.resolve(JSON.parse(JSON.stringify(cache)))
  return fetchDados()
}

export const getPrefacio = () =>
  getTemplate().then((d) => JSON.parse(JSON.stringify(d.prefacioData || {})))

export const getUnidades = () =>
  getTemplate().then((d) => JSON.parse(JSON.stringify(d.unidadesData || [])))

export const getAreaComum = () =>
  getTemplate().then((d) => JSON.parse(JSON.stringify(d.areacomumData || [])))

export const getMateriais = () =>
  getTemplate().then((d) => JSON.parse(JSON.stringify(d.materialData || [])))

export const getObservacoes = () =>
  getTemplate().then((d) => JSON.parse(JSON.stringify(d.observacoesData || [])))

export const setPrefacio = (novo) =>
  getTemplate().then(() => {
    cache.prefacioData = novo
    return JSON.parse(JSON.stringify(cache.prefacioData))
  })

export const setUnidades = (novo) =>
  getTemplate().then(() => {
    cache.unidadesData = novo
    return JSON.parse(JSON.stringify(cache.unidadesData))
  })

export const setAreaComum = (novo) =>
  getTemplate().then(() => {
    cache.areacomumData = novo
    return JSON.parse(JSON.stringify(cache.areacomumData))
  })

export const setMateriais = (novo) =>
  getTemplate().then(() => {
    cache.materialData = novo
    return JSON.parse(JSON.stringify(cache.materialData))
  })

export const setObservacoes = (novo) =>
  getTemplate().then(() => {
    cache.observacoesData = novo
    return JSON.parse(JSON.stringify(cache.observacoesData))
  })
