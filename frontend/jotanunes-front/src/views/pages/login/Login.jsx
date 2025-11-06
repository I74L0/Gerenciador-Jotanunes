import React, { useState } from 'react' 
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
// --- IMPORTAÇÃO ATUALIZADA ---
import { login, setAuthToken } from '../../../apiClient' // <--- Importe 'setAuthToken'
import './Login-style.css';

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = async (e) => { 
    e.preventDefault();
    setError(false);

    try {
        const response = await login(username, password);
        
        if (response.data && response.data.access && response.data.refresh) {
            const accessToken = response.data.access;
            const refreshToken = response.data.refresh;
            
            // 1. Armazena o token no localStorage para persistência
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // 2. CONFIGURA O CLIENTE API PARA USAR O TOKEN IMEDIATAMENTE
            setAuthToken(accessToken); // <--- Chamada da função aqui!

            console.log('Login bem-sucedido. Tokens armazenados e cliente API configurado.');
        } 

        // 3. Navega para a próxima página
        navigate('/index');
        return true;

    } catch (err) {
        console.error('Login Falhou:', err);
        setError(true); 
        // É uma boa prática limpar os tokens em caso de falha, se existirem
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAuthToken(null);
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
                    {error ? ( 
                      <p style={{ color: 'red' }}>Login Incorreto</p>
                    ):""}
                    <hr/>
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