import { apiClient } from '../apiClient'
import { cleanParams } from '../utils'

export const itens = {
  list: (ambiente = null, search = null) =>
    apiClient.get('/itens/', {
      params: cleanParams({ ambiente, search }),
    }),

  create: (data) => apiClient.post('/itens/', data),
  retrieve: (id) => apiClient.get(`/itens/${id}/`),
  update: (id, data) => apiClient.put(`/itens/${id}/`, data),
  partialUpdate: (id, data) => apiClient.patch(`/itens/${id}/`, data),
  destroy: (id) => apiClient.delete(`/itens/${id}/`),
}
