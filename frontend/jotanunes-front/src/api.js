import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({
  baseURL: API_URL
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
export async function login(username, password) {
  try {
    const response = await api.post('/token/', {
      username,
      password,
    });

    const { access, refresh } = response.data;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);

    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

    return response.data;

  } catch (err) {
    console.error("Erro no login:", err);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw err;
  }
}
export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  delete api.defaults.headers.common['Authorization'];
}
export default api;