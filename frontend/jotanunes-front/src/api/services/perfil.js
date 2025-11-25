import { apiClient } from '../apiClient'

export const perfil = {
  get: () => apiClient.get('/perfil/'),
  update: (data) => apiClient.put('/perfil/', data),
  partialUpdate: (data) => apiClient.patch('/perfil/', data),
}
