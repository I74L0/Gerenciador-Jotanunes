import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Projeto = React.lazy(() => import('src/views/pages/projeto/Projeto'))
const Index = React.lazy(() => import('./views/pages/index/Index'))
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const Create = React.lazy(() => import('./views/pages/criar/Create'))

// --- CORREÇÃO 1: ProtectedRoute ---
// Agora verifica o token real guardado no localStorage pelo seu api.js
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  const isAuthenticated = !!token; // Converte a string do token para true/false

  if (!isAuthenticated) {
    // Se não estiver logado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  // Se estiver logado, renderiza o layout e as páginas protegidas
  return children;
};

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode("light")
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode("light")
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        {/* --- CORREÇÃO 2: Estrutura das Rotas --- */}
        <Routes>
          {/* Rotas Públicas: Acessíveis sem login */}
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />

          {/* Rotas Privadas: Exigem login e usam o DefaultLayout */}
          <Route
            path="*" // Apaha todas as outras rotas (ex: /dashboard, /projeto)
            name="Home"
            element={
              <ProtectedRoute>
                <DefaultLayout />
              </ProtectedRoute>
            }
          >
            {/* O DefaultLayout irá renderizar estas rotas filhas onde tiver um <Outlet /> */}
            <Route index element={<Dashboard />} /> {/* Rota padrão após login */}
            <Route path="dashboard" name="Dashboard" element={<Dashboard />} />
            <Route path="index" name="Index Page" element={<Index />} />
            <Route path="projeto" name="Projeto Page" element={<Projeto />} />
            <Route path="criar" name="Create Page" element={<Create />} />
            
            {/* Se aceder a uma rota privada desconhecida, redireciona para o dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App