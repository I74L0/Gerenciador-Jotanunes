import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import './Login-style.css';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // 1. Defina a chave do cookie
    const COOKIE_NAME = "AutorizacaoConcedida";
    
    // 2. Função auxiliar para verificar a existência do cookie
    const hasAuthorizationCookie = () => {
        // Verifica se a string de cookies contém o nome do nosso cookie
        return document.cookie.split(';').some((item) => item.trim().startsWith(COOKIE_NAME + '='));
    };

    // 3. Simule a lógica de autenticação (sem a API por enquanto)
    let isLoginSuccessful = false; 
    
    // VERIFICAÇÃO PRINCIPAL: O cookie de autorização existe?
    if (hasAuthorizationCookie()) {
        // Se o cookie existe, o login é bem-sucedido na segunda tentativa
        isLoginSuccessful = true;
    } else {
        // Se o cookie NÃO existe (primeira tentativa de login)
        
        // Crie o cookie com um tempo de expiração para "lembrar" o estado
        // Exemplo: expira em 1 hora (max-age em segundos: 60 * 60)
        // O 'path=/' garante que o cookie esteja disponível em todo o site
        document.cookie = `${COOKIE_NAME}=true; max-age=10; path=/; Secure; SameSite=Lax`;

        // O login continua sendo falso nesta primeira tentativa.
        isLoginSuccessful = false;
    }
    
    // 4. Lógica de Redirecionamento e Feedback
    if (isLoginSuccessful) {
        // A autorização foi bem-sucedida (segunda tentativa)
        
        // Nota: Neste ponto, você pode optar por remover ou manter o cookie.
        // Se for para um token real, você faria a chamada à API aqui.
        navigate('/index');
        return true;
        
    } else {
        // Lidar com o login com falha (primeira tentativa)
        alert('Login inválido! Tente novamente.');
        return false;
    }
  };

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
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput placeholder="Username" autoComplete="username" />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
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
