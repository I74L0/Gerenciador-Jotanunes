import { apiClient } from '../apiClient'
import { cleanParams } from '../utils'

export const materiais = {
  list: (search = null, item = null, marcas = null) =>
    apiClient.get('/materiais/', {
      params: cleanParams({ search, item, marcas }),
    }),

  create: (data) => apiClient.post('/materiais/', data),
  retrieve: (id) => apiClient.get(`/materiais/${id}/`),
  update: (id, data) => apiClient.put(`/materiais/${id}/`, data),
  partialUpdate: (id, data) => apiClient.patch(`/materiais/${id}/`, data),
  destroy: (id) => apiClient.delete(`/materiais/${id}/`),
}
