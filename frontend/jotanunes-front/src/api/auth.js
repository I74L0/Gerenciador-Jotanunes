// src/api/auth.js
import axios from 'axios'
import { API_BASE } from './config'

/**
 * Auth helpers exportados como funções nomeadas.
 * - login(username, password) -> axios response
 * - attemptRefresh() -> returns { access, refresh } or null
 * - handleLogout() -> clear storage and redirect
 */

// Faz login; não aplica headers aqui — deixa o chamador aplicar via setAuthToken do apiClient
export const login = async (username, password) => {
  try {
    const response = await axios.post(
      `${API_BASE}/token/`,
      { username, password },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
    return response
  } catch (err) {
    throw err
  }
}

/**
 * attemptRefresh - tenta trocar o refresh token por um novo access token
 * Retorna o objeto { access, refresh } em caso de sucesso, ou null em caso de falha.
 */
export const attemptRefresh = async () => {
  const currentRefreshToken = localStorage.getItem('refreshToken')
  if (!currentRefreshToken) return null
  try {
    const res = await axios.post(
      `${API_BASE}/token/refresh/`,
      { refresh: currentRefreshToken },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
    return res.data // espera { access, refresh? }
  } catch (err) {
    return null
  }
}

/**
 * handleLogout - limpa tokens e redireciona para /login
 */
export const handleLogout = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('descricoesSalvas')
  if (window.location.pathname !== '/login') {
    window.location.href = '/login?sessionExpired=true'
  }
}
