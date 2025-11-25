import { apiClient } from '../apiClient'
import { cleanParams } from '../utils'

export const descricoes = {
  list: (search = null) => apiClient.get('/descricoes/', { params: cleanParams({ search }) }),

  create: (data) => apiClient.post('/descricoes/', data),
  retrieve: (id) => apiClient.get(`/descricoes/${id}/`),
  update: (id, data) => apiClient.put(`/descricoes/${id}/`, data),
  partialUpdate: (id, data) => apiClient.patch(`/descricoes/${id}/`, data),
  destroy: (id) => apiClient.delete(`/descricoes/${id}/`),
}
