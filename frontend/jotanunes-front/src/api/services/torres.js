import { apiClient } from '../apiClient'
import { cleanParams } from '../utils'

export const torres = {
  list: (obra = null) =>
    apiClient.get('/torres/', {
      params: cleanParams({ obra }),
    }),

  create: (data) => apiClient.post('/torres/', data),
  retrieve: (id) => apiClient.get(`/torres/${id}/`),
  update: (id, data) => apiClient.put(`/torres/${id}/`, data),
  partialUpdate: (id, data) => apiClient.patch(`/torres/${id}/`, data),
  destroy: (id) => apiClient.delete(`/torres/${id}/`),
}
