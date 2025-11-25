import React, { useState, useEffect } from 'react' 
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CImage,
  CForm,
  CFormInput,
  CHeader,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { login, setAuthToken } from '../../../api'
import './Login-style.css';

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  
  // Lógica para identificar se a sessão expirou
  const searchParams = new URLSearchParams(location.search)
  const isSessionExpired = searchParams.get('sessionExpired') === 'true'

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(false)

    try {
      const response = await login(username, password)

      if (response.data && response.data.access && response.data.refresh) {
        const accessToken = response.data.access
        const refreshToken = response.data.refresh

        // 1. Armazena o token no localStorage para persistência
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)

        // 2. CONFIGURA O CLIENTE API PARA USAR O TOKEN IMEDIATAMENTE
        setAuthToken(accessToken)

        console.log('Login bem-sucedido. Tokens armazenados e cliente API configurado.')
      }

      // 3. Navega para a próxima página
      navigate('/index')
      return true
    } catch (err) {
      console.error('Login Falhou:', err)
      setError(true)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setAuthToken(null)
      return false
    }
  }

  return (
    <div className="body bg-body-tertiary vh-100 d-flex flex-column align-items-center">
      <CHeader position="sticky" className="d-flex vw-100 p-4">
        <CImage src="/images/Logo Vermelha.png" alt="JotaNunes Logo" height={48} />
      </CHeader>
      <div className='background fg-1 d-flex align-items-center vw-100'>
        <div className='col-image'>
          <CImage src="images/JOTA-NUNES-MARBELLO-FACHADA-NOTURNA-scaled.webp" alt="JotaNunes Logo"/>
        </div>
        <div className="col-login">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <h1>Login</h1>

                    {/* MENSAGEM DE SESSÃO EXPIRADA (Aviso Amarelo) */}
                    {isSessionExpired && !error && (
                      <CAlert color="warning" className="d-flex align-items-center">
                        Sua sessão expirou. Por favor, faça login novamente.
                      </CAlert>
                    )}

                    {/* MENSAGEM DE ERRO DE LOGIN (Aviso Vermelho) */}
                    {error && <CAlert color="danger">Usuário ou senha incorretos.</CAlert>}
                    
                    <hr />
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </CInputGroup>
                    <CRow className="row-login">
                      <CButton color="primary" className="btn-login px-4" type="submit">
                        Login
                      </CButton>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </div>
      </div>
    </div>
  )
}

export default Login