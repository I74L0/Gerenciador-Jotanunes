let cache = null

const fetchDados = () =>
  fetch('/dados.json')
    .then((res) => {
      if (!res.ok) throw new Error('Falha ao carregar dados.json')
      return res.json()
    })
    .then((d) => {
      cache = d
      return JSON.parse(JSON.stringify(d))
    })

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

export const setPrefacio = (novo) =>
  getDados().then(() => {
    cache.prefacioData = novo
    return JSON.parse(JSON.stringify(cache.prefacioData))
  })

export const setUnidades = (novo) =>
  getDados().then(() => {
    cache.unidadesData = novo
    return JSON.parse(JSON.stringify(cache.unidadesData))
  })

export const setAreaComum = (novo) =>
  getDados().then(() => {
    cache.areacomumData = novo
    return JSON.parse(JSON.stringify(cache.areacomumData))
  })

export const setMateriais = (novo) =>
  getDados().then(() => {
    cache.materialData = novo
    return JSON.parse(JSON.stringify(cache.materialData))
  })

export const setObservacoes = (novo) =>
  getDados().then(() => {
    cache.observacoesData = novo
    return JSON.parse(JSON.stringify(cache.observacoesData))
  })
