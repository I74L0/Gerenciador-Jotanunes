import React, { useEffect, useState } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CAlert,
  CButton,
} from '@coreui/react'

import './Perfil.css'
import AlterarSenhaModal from './AlterarSenha'

const Perfil = () => {
  const [usuario, setUsuario] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [permissoes, setPermissoes] = useState(null)

  const cargo =
  permissoes?.is_superuser
    ? "Administrador"
    : permissoes?.is_gestor
    ? "Gestor"
    : permissoes?.is_criador
    ? "Criador"
    : "Usuário";


  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setError('Usuário não autenticado. Faça login novamente.');
      setLoading(false);
      return;
    }

    // Buscar perfil
    fetch('http://localhost:8000/api/perfil/', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        setUsuario({
          username: data.username,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
        });
      });

    // Buscar permissões
    fetch('http://localhost:8000/api/me/', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        setPermissoes({
          is_superuser: data.is_superuser,
          is_gestor: data.is_gestor,
          is_criador: data.is_criador,
        });
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao carregar dados.');
        setLoading(false);
      });
  }, []);


  return (
    <div className="perfil-bg justify-content-center align-items-center">
      <CCard className='conteiner'>
        <div className="logo-card" style={{ textAlign: 'center', padding: '10px 0' }}>
          <img
            src="/images/Logo Vermelha.png"
            alt="Logo"
            style={{ height: '90px', width: 'auto' }}
          />
        </div>

        <CCardHeader>
          <h4 style={{ textAlign: 'center' }}>Meu Perfil</h4>
        </CCardHeader>

        <CCardBody className="perfil-card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <CSpinner color="primary" /> Carregando...
            </div>
          ) : error ? (
            <CAlert color="danger" style={{ textAlign: 'center' }}>
              {error}
            </CAlert>
          ) : (
            <>
              <div className="perfil-campo">
                <span>Usuário ({cargo}):</span>
                <p>{usuario.username}</p>
              </div>

              <div className="perfil-campo">
                <span>Email:</span>
                <p>{usuario.email}</p>
              </div>

              <div className="perfil-campo">
                <span>Nome:</span>
                <p>{usuario.first_name} {usuario.last_name}</p>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '20px',
                }}
              >
                <CButton color="secondary" onClick={() => window.history.back()}>
                  Voltar
                </CButton>

                <CButton color="primary" onClick={() => setModalAberto(true)}>
                  Alterar Senha
                </CButton>

                <AlterarSenhaModal
                  aberto={modalAberto}
                  fecharModal={() => setModalAberto(false)}
                />
              </div>
            </>
          )}
        </CCardBody>
      </CCard>
    </div>
  )
}

export default Perfil
