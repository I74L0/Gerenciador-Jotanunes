import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { apiClient, setAuthToken } from './api'
import ProtectedRoute from './components/ProtectedRoute'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'

// Reaplica token (se existir) na inicialização — usa setAuthToken se disponível, senão ajusta direto no apiClient
const token = localStorage.getItem('accessToken')
if (token) {
  if (typeof setAuthToken === 'function') {
    try {
      setAuthToken(token)
      console.log('Token reconfigurado na inicialização (setAuthToken).')
    } catch (err) {
      // fallback abaixo
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
      console.log('Token reconfigurado na inicialização (fallback apiClient).')
    }
  } else if (apiClient && apiClient.defaults) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    console.log('Token reconfigurado na inicialização (apiClient).')
  }
}

// Pages (lazy)
const Projeto = React.lazy(() => import('src/views/pages/projeto/Projeto'))
const Index = React.lazy(() => import('./views/pages/index/Index'))
const Login = React.lazy(() => import('src/views/pages/login/Login'))
const Perfil = React.lazy(() => import('src/views/pages/perfil/Perfil'))
const AlterarSenha = React.lazy(() => import('src/views/pages/perfil/AlterarSenha'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  useEffect(() => {
    // força o tema claro por padrão (conforme seu código original)
    setColorMode('light')
  }, [setColorMode])

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          {/* --- Rotas Protegidas --- */}
          <Route
            exact
            path="/projeto/:id?"
            name="Projeto Page"
            element={
              <ProtectedRoute>
                <Projeto />
              </ProtectedRoute>
            }
          />
          <Route
            exact
            path="/index"
            name="Index Page"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alterar-senha"
            element={
              <ProtectedRoute>
                <AlterarSenha />
              </ProtectedRoute>
            }
          />

          {/* --- Rotas Públicas --- */}
          <Route exact path="/login" name="Login Page" element={<Login />} />

          {/* Redireciona a rota raiz (/) para /login por padrão */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Redireciona qualquer rota não encontrada (*) para a página login. */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App