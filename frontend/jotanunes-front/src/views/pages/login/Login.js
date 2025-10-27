import React, { useState } from 'react' // Importe o useState
import { Link, useNavigate } from 'react-router-dom'
import {
  CAlert, // Importe o CAlert para mostrar erros
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import './Login-style.css'

// 1. IMPORTE A SUA FUNÇÃO DE LOGIN REAL DA API
// (O caminho pode ser 'src/api.js' ou '../api.js' dependendo da sua estrutura)
import { login } from 'src/api' 

const Login = () => {
  const navigate = useNavigate()

  // 2. ESTADOS PARA GUARDAR USERNAME, PASSWORD E ERROS
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null) // Estado para a mensagem de erro

  // 3. FUNÇÃO DE LOGIN CORRIGIDA (AGORA CHAMA A API)
  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null) // Limpa erros antigos

    try {
      // 4. CHAMA A API REAL com o username e password do estado
      await login(username, password)
      
      // 5. SUCESSO: Redireciona para o dashboard principal
      // (O App.js que corrigimos irá carregar o DefaultLayout)
      navigate('/index')

    } catch (err) {
      // 6. ERRO: Mostra uma mensagem de erro clara
      if (err.response && err.response.status === 400) {
        setError('Credenciais inválidas. Por favor, tente novamente.')
      } else {
        setError('Ocorreu um erro. Por favor, tente mais tarde.')
      }
    }
  }

  return (
    <div className="body bg-body-tertiary vh-100 d-flex flex-column align-items-center">
      <CHeader position="sticky" className="d-flex vw-100 p-4" >
        <CImage src="/images/Logo Vermelha.png" alt="JotaNunes Logo" height={48} />
      </CHeader>
      <div className='background fg-1 d-flex align-items-center vw-100'>
        <CCol className='col-image'>
          <CImage src="images/JOTANUNES-PEROLAS-DO-MAR.jpg" height={1080} width={1980} alt="JotaNunes Logo"/>
        </CCol>
        <CCol className="d-flex justify-content-center align-items-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <h1>Login</h1>
                    <hr/>
                    
                    {/* 7. MOSTRA A MENSAGEM DE ERRO (SE EXISTIR) */}
                    {error && (
                      <CAlert color="danger" className="text-center">
                        {error}
                      </CAlert>
                    )}

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput 
                        placeholder="Username" 
                        autoComplete="username" 
                        value={username} // 8. Liga o campo ao estado
                        onChange={(e) => setUsername(e.target.value)} // 9. Atualiza o estado
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
                        value={password} // 8. Liga o campo ao estado
                        onChange={(e) => setPassword(e.target.value)} // 9. Atualiza o estado
                      />
                    </CInputGroup>
                    <CRow className='row-login'>
                      <CButton color="primary" className="btn-login px-4" type='submit'>
                        Login
                      </CButton>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CCol>
      </div>
    </div>
  )
}

export default Login