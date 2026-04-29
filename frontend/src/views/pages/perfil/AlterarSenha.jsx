import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { CCard, CCardBody, CCardHeader, CForm, CFormInput, CButton, CAlert } from '@coreui/react'

const AlterarSenhaModal = ({ aberto, fecharModal }) => {
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmaSenha, setConfirmaSenha] = useState('')
  const [mensagem, setMensagem] = useState(null)
  const [erro, setErro] = useState(false)
  const navigate = useNavigate()

  const handleAlterarSenha = async (e) => {
    e.preventDefault()
    setErro(false)
    setMensagem(null)

    if (novaSenha !== confirmaSenha) {
      setErro(true)
      setMensagem('A nova senha e a confirmação não coincidem.')
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      setErro(true)
      setMensagem('Usuário não autenticado.')
      return
    }

    try {
      const res = await fetch('http://localhost:8000/api/alterar-senha/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          senha_atual: senhaAtual,
          nova_senha: novaSenha,
          confirmar_senha: confirmaSenha
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMensagem('Senha alterada com sucesso!')
        setErro(false)
        setTimeout(() => {
          fecharModal()
          navigate('/perfil')
        }, 2000)
      } else {
        setErro(true)
        setMensagem(data.detail || 'Erro ao alterar senha.')
      }
    } catch (err) {
      console.error(err)
      setErro(true)
      setMensagem('Erro ao conectar com o servidor.')
    }
  }

  if (!aberto) return null

  return createPortal(
    <div style={overlayStyle}>
      <CCard style={{ width: '400px' }}>
        <CCardHeader>
          <h4>Alterar Senha</h4>
        </CCardHeader>
        <CCardBody>
          {mensagem && <CAlert color={erro ? 'danger' : 'success'}>{mensagem}</CAlert>}
          <CForm onSubmit={handleAlterarSenha}>
            <CFormInput
              type="password"
              placeholder="Senha atual"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              className="mb-3"
              required
            />
            <CFormInput
              type="password"
              placeholder="Nova senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="mb-3"
              required
            />
            <CFormInput
              type="password"
              placeholder="Confirme nova senha"
              value={confirmaSenha}
              onChange={(e) => setConfirmaSenha(e.target.value)}
              className="mb-3"
              required
            />
            <div className="d-flex justify-content-between">
              <CButton type="submit" color="primary">
                Salvar
              </CButton>
              <CButton color="secondary" onClick={fecharModal}>
                Cancelar
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </div>,
    document.body
  )
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
}

export default AlterarSenhaModal
