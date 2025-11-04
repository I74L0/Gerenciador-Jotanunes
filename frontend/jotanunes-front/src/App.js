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
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const Create = React.lazy(() => import('./views/pages/criar/Create'))

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = true
  return isAuthenticated ? children : <Navigate to="/login" replace />;
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
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route exact path="/index" name="Index Page" element={<Index />} />
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route exact path="/projeto/:id?" name="Projeto Page" element={<Projeto />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
