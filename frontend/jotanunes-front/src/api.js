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

/* --- Função SAVE (Persiste o cache no servidor) --- */

/**
 * Envia o objeto 'cache' modificado de volta para o servidor.
 * * ATENÇÃO: Substitua '/api/salvar-dados' pelo seu endpoint real no backend.
 * * @returns {Promise<object>} - A resposta do servidor.
 */
export const saveDados = async () => {
  if (!cache) {
    return Promise.reject(new Error("Nenhum dado no cache para salvar."));
  }

  const res = await fetch('/api/salvar-dados', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cache),
  })
  if (!res.ok) throw new Error('Falha ao salvar os dados no servidor')
  return await res.json()
}