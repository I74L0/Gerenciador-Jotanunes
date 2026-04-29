import { apiClient } from '../apiClient'
import { cleanParams, normalizeStatus, saveBlob } from '../utils'

export const obras = {
  list: (search = null, status = null, cidade = null, estado = null) => {
    const params = cleanParams({
      search,
      status: normalizeStatus(status),
      cidade,
      estado,
    })
    return apiClient.get('/obras/', { params })
  },

  create: (data) => apiClient.post('/obras/', data),
  retrieve: (id) => apiClient.get(`/obras/${id}/`),
  update: (id, data) => apiClient.put(`/obras/${id}/`, data),
  partialUpdate: (id, data) => apiClient.patch(`/obras/${id}/`, data),
  destroy: (id) => apiClient.delete(`/obras/${id}/`),

  duplicate: (id, data = null) => apiClient.post(`/obras/${id}/duplicar/`, data || {}),

  generatePdf: async (id) => {
    const res = await apiClient.get(`/obras/${id}/gerar-pdf/`, {
      responseType: 'blob',
    })

    const type = res.headers['content-type'] || ''
    if (type.includes('application/json')) {
      const text = await res.data.text()
      try {
        return JSON.parse(text)
      } catch {
        return text
      }
    }

    return res
  },

  downloadPdf: async (id, filename = `obra-${id}.pdf`) => {
    const res = await obras.generatePdf(id)
    if (res && res.data instanceof Blob) saveBlob(res.data, filename)
    return res
  },
}
