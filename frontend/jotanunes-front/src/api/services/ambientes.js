import { apiClient } from '../apiClient'
import { cleanParams } from '../utils'

export const ambientes = {
  list: (obra = null, torre = null) =>
    apiClient.get('/ambientes/', {
      params: cleanParams({ obra, torre }),
    }),

  create: (data) => apiClient.post('/ambientes/', data),
  retrieve: (id) => apiClient.get(`/ambientes/${id}/`),
  update: (id, data) => apiClient.put(`/ambientes/${id}/`, data),
  partialUpdate: (id, data) => apiClient.patch(`/ambientes/${id}/`, data),
  destroy: (id) => apiClient.delete(`/ambientes/${id}/`),
}
