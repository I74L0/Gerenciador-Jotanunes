import { apiClient } from "../apiClient";
import { cleanParams } from "../utils";

export const marcas = {
  list: (search = null) =>
    apiClient.get("/marcas/", { params: cleanParams({ search }) }),

  create: (data) => apiClient.post("/marcas/", data),
  retrieve: (id) => apiClient.get(`/marcas/${id}/`),
  update: (id, data) => apiClient.put(`/marcas/${id}/`, data),
  partialUpdate: (id, data) => apiClient.patch(`/marcas/${id}/`, data),
  destroy: (id) => apiClient.delete(`/marcas/${id}/`),
};
