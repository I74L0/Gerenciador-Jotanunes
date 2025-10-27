import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

const Projeto = React.lazy(() => import('src/views/pages/projeto/Projeto'))
const Index = React.lazy(() => import('./views/pages/index/Index'))
const Create = React.lazy(() => import('./views/pages/criar/Create'))

// Páginas de Autenticação/Erro
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  const isAuthenticated = !!token;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
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
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          
          
          <Route 
            path="/index" 
            name="Index Page" 
            element={<ProtectedRoute><Index /></ProtectedRoute>} 
          />
          <Route 
            path="/projeto" 
            name="Projeto Page" 
            element={<ProtectedRoute><Projeto /></ProtectedRoute>} 
          />
          <Route 
            path="/criar" 
            name="Create Page" 
            element={<ProtectedRoute><Create /></ProtectedRoute>} 
          />

          <Route 
            path="/dashboard" 
            name="Dashboard" 
            element={<ProtectedRoute><DefaultLayout /></ProtectedRoute>} 
          />
          <Route path="/" element={<Navigate to="/index" replace />} />
          
          <Route path="*" element={<Navigate to="/index" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App