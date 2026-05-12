import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { attemptRefresh, handleLogout, apiClient } from '../api' // pega auth e apiClient do barrel
import { setAuthTokenHelper } from '../api/utils'

/**
 * parseJwt - decodifica o payload JWT (apenas para ler 'exp')
 */
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch (err) {
    return null
  }
}

/**
 * ProtectedRoute
 * - verifica token localmente (campo exp)
 * - se ausente/quase expirando, tenta attemptRefresh()
 * - se refresh bem-sucedido aplica header com setAuthTokenHelper(apiClient, token) e autoriza
 * - se falhar faz handleLogout() e redireciona para /login
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const [authorized, setAuthorized] = useState(null) // null = checando

  useEffect(() => {
    let mounted = true
    const bufferSeconds = 60 // se faltar <= 60s tentamos refresh

    const applyTokenToClient = (token) => {
      // usa apiClient instanciado importado do módulo central
      if (apiClient && token) {
        try {
          setAuthTokenHelper(apiClient, token)
        } catch (err) {
          // se algo inesperado ocorrer, faz fallback mínimo:
          try {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
          } catch (_) {}
        }
      }
    }

    const checkAuth = async () => {
      const access = localStorage.getItem('accessToken')

      // 1) Sem token: tenta refresh imediatamente se houver um refresh token salvo
      if (!access) {
        const refresh = localStorage.getItem('refreshToken')
        if (refresh) {
          const refreshed = await attemptRefresh()
          if (refreshed) {
            const newAccess = localStorage.getItem('accessToken')
            if (newAccess) {
              applyTokenToClient(newAccess)
              if (mounted) setAuthorized(true)
              return
            }
          }
          // Se tinha refresh mas falhou, a sessão realmente expirou
          handleLogout(true)
        }
        
        // Se não tinha refresh (primeiro acesso) ou se o logout já limpou, apenas desautoriza
        if (mounted) setAuthorized(false)
        return
      }

      // 2) Se há token, verifica exp
      const payload = parseJwt(access)
      const now = Math.floor(Date.now() / 1000)
      if (payload && payload.exp && payload.exp > now + bufferSeconds) {
        // token válido
        applyTokenToClient(access)
        if (mounted) setAuthorized(true)
        return
      }

      // 3) Token expirado ou quase expirando -> tenta refresh
      const refreshed = await attemptRefresh()
      if (refreshed) {
        const newAccess = localStorage.getItem('accessToken')
        if (newAccess) {
          applyTokenToClient(newAccess)
          if (mounted) setAuthorized(true)
          return
        }
      }

      // 4) Falha geral -> logout (sessão expirou)
      handleLogout(true)
      if (mounted) setAuthorized(false)
    }

    checkAuth()

    return () => {
      mounted = false
    }
  }, [location.pathname])

  // enquanto checa, você pode retornar um loader aqui
  if (authorized === null) return null

  if (authorized === true) return children

  // redireciona para login, preservando rota original em `next`
  return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
}
