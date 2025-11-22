import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { setAuthToken } from './apiClient'

const token = localStorage.getItem('accessToken')
if (token) {
  setAuthToken(token)
  console.log('Token reconfigurado na inicialização.')
}

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'

// We use those styles to show code examples, you should remove them in your application.
import './scss/examples.scss'

// Pages
const Projeto = React.lazy(() => import('src/views/pages/projeto/Projeto'))
const Index = React.lazy(() => import('./views/pages/index/Index'))
const Login = React.lazy(() => import('src/views/pages/login/Login'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const Perfil = React.lazy(() => import('src/views/pages/perfil/Perfil'))

const AlterarSenha = React.lazy(() => import('src/views/pages/perfil/AlterarSenha'))


const ProtectedRoute = ({ children }) => {
  // Verifica se o token existe no localStorage
  const token = localStorage.getItem('accessToken');

  // Se NÃO houver token, redireciona para a página de login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Se houver token, permite o acesso à rota (renderiza o 'children')
  return children;
};

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    setColorMode("light")
  }, [])

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
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />

          {/* Redireciona a rota raiz (/) para /login por padrão */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Redireciona qualquer rota não encontrada (*) para a página login.*/}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App