export const cleanParams = (params) => {
  const out = {}
  Object.keys(params || {}).forEach((k) => {
    const v = params[k]
    if (v !== null && typeof v !== 'undefined' && v !== '') out[k] = v
  })
  return out
}

export const saveBlob = (blob, filename = 'download.bin') => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

const STATUS_MAP = {
  0: 'PENDENTE',
  1: 'EM_ANDAMENTO',
  2: 'FINALIZADO',
}

export const normalizeStatus = (status) => {
  if (status === null || typeof status === 'undefined') return undefined
  if (typeof status === 'number') return STATUS_MAP[status]
  if (typeof status === 'string') {
    const s = status.toUpperCase()
    if (['PENDENTE', 'EM_ANDAMENTO', 'FINALIZADO'].includes(s)) return s
  }
  return undefined
}

// usado pelo apiClient
export const setAuthTokenHelper = (apiClient, token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common['Authorization']
  }
}

// --- helpers adicionais para getRole ---
const decodeJwt = (token) => {
  try {
    if (!token) return null
    const payload = token.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    // atob decodifica Base64 para string
    const json = atob(base64)
    // Alguns JWTs têm componentes URI encoded; protegemos com decodeURIComponent
    return JSON.parse(decodeURIComponent(escape(json)))
  } catch {
    try {
      // fallback simples se decodeURIComponent/escape não funcionarem
      const payload = token.split('.')[1]
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(json)
    } catch {
      return null
    }
  }
}

/**
 * getRole()
 * Tenta inferir o cargo/role do usuário sem fazer requisição HTTP.
 * Retorna a role como string (ex: "gestor", "admin", ...) ou null se não encontrar.
 */
export const getRole = () => {
  try {
    // 1) window global (p.ex. injetado pelo backend)
    if (typeof window !== 'undefined' && window.__USER__ && window.__USER__.role) {
      return String(window.__USER__.role).toLowerCase()
    }

    // 2) checar chaves comuns no localStorage com JSON
    const keys = [
      'user',
      'auth',
      'authUser',
      'currentUser',
      'profile',
      'usuario',
      'app_user',
      'USER',
    ]
    for (const k of keys) {
      try {
        const raw = localStorage.getItem(k)
        if (!raw) continue
        const parsed = JSON.parse(raw)
        if (parsed && parsed.role) return String(parsed.role).toLowerCase()
        if (parsed && parsed.user && parsed.user.role) return String(parsed.user.role).toLowerCase()
      } catch (e) {
        // ignora erro de parse e continua
      }
    }

    // 3) checar tokens/JWTS em storage (access, token, authTokens, etc.)
    const accessCandidates = [
      localStorage.getItem('access'),
      localStorage.getItem('token'),
      localStorage.getItem('authTokens'),
      localStorage.getItem('auth_token'),
      localStorage.getItem('accessToken'),
      localStorage.getItem('access_token'),
    ]

    for (const t of accessCandidates) {
      if (!t) continue
      const p = decodeJwt(t)
      if (p && (p.role || p.user?.role)) {
        return String(p.role || p.user.role).toLowerCase()
      }
      // Alguns JWTs guardam permissões em campos diferentes:
      if (p && p.username && (p.is_superuser || p.is_criador)) {
        // se quiser inferir papel a partir de flags, você pode adaptar aqui
        if (p.is_superuser) return 'superuser'
        if (p.is_criador) return 'criador'
      }
    }

    // 4) cookie 'user' (quando backend serializa usuário no cookie)
    const cookieMatch = typeof document !== 'undefined' && document.cookie && document.cookie.match(/user=([^;]+)/)
    if (cookieMatch) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookieMatch[1]))
        if (parsed && parsed.role) return String(parsed.role).toLowerCase()
        if (parsed && parsed.user && parsed.user.role) return String(parsed.user.role).toLowerCase()
      } catch {}
    }
  } catch (err) {
    // se qualquer coisa falhar, retornamos null
  }

  return null
}
