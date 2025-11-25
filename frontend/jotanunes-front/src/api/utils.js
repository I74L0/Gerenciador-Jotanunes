export const cleanParams = (params) => {
  const out = {}
  Object.keys(params || {}).forEach((k) => {
    const v = params[k]
    if (v !== null && typeof v !== 'undefined' && v !== '') out[k] = v
  })
  return out
}

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

const STATUS_MAP = {
  0: 'PENDENTE',
  1: 'EM_ANDAMENTO',
  2: 'FINALIZADO',
}

export const normalizeStatus = (status) => {
  if (status === null || typeof status === 'undefined') return undefined
  if (typeof status === 'number') return STATUS_MAP[status]
  if (typeof status === 'string') {
    const s = status.toUpperCase()
    if (['PENDENTE', 'EM_ANDAMENTO', 'FINALIZADO'].includes(s)) return s
  }
  return undefined
}

// usado pelo apiClient
export const setAuthTokenHelper = (apiClient, token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common['Authorization']
  }
}
