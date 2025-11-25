import axios from 'axios'
import { API_BASE } from './config'
import { attemptRefresh, handleLogout } from './auth'
import { setAuthTokenHelper } from './utils'

// cria instância
export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// seta token inicial
;(() => {
  const token = localStorage.getItem('accessToken')
  if (token) setAuthTokenHelper(apiClient, token)
})()

// controle de refresh
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token)
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !original._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers['Authorization'] = 'Bearer ' + token
          return apiClient(original)
        })
      }

      original._retry = true
      isRefreshing = true

      const newToken = await attemptRefresh()

      if (!newToken) {
        processQueue(null, null)
        isRefreshing = false
        handleLogout()
        return Promise.reject(error)
      }

      setAuthTokenHelper(apiClient, newToken)
      processQueue(null, newToken)
      isRefreshing = false

      original.headers['Authorization'] = 'Bearer ' + newToken
      return apiClient(original)
    }

    return Promise.reject(error)
  },
)

export const setAuthToken = (token) => {
  if (token) {
    setAuthTokenHelper(apiClient, token)
  } else {
    setAuthTokenHelper(apiClient, null)
  }
}