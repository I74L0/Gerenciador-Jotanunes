import { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCollapse,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { IoIosAddCircle } from 'react-icons/io'
import { FaCheck } from 'react-icons/fa'
import { BsXLg } from 'react-icons/bs'
import DescricaoPopup from '../../../components/DescricaoPopup'

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    return JSON.parse(decodeURIComponent(json))
  } catch {
    return null
  }
}

function detectUserRole() {
  try {
    if (window && window.__USER__ && window.__USER__.role) return String(window.__USER__.role)
    const keys = [
      'user',
      'auth',
      'authUser',
      'currentUser',
      'profile',
      'usuario',
      'app_user',
      'USER',
    ]
    for (const k of keys) {
      const raw = localStorage.getItem(k)
      if (!raw) continue
      try {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.role) return String(parsed.role)
        if (parsed && parsed.user && parsed.user.role) return String(parsed.user.role)
      } catch {}
    }
    const accessCandidates = [
      localStorage.getItem('access'),
      localStorage.getItem('token'),
      localStorage.getItem('authTokens'),
      localStorage.getItem('auth_token'),
    ]
    for (const t of accessCandidates) {
      if (!t) continue
      const p = decodeJwt(t)
      if (p && p.role) return String(p.role)
    }
    const cookieMatch = document.cookie.match(/user=([^;]+)/)
    if (cookieMatch) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookieMatch[1]))
        if (parsed && parsed.role) return String(parsed.role)
      } catch {}
    }
  } catch {}
  return null
}

export default function CardUnidades({ ambientes, setAmbientes, podeEditar, showStatus: parentShowStatus }) {
  const [popupTarget, setPopupTarget] = useState(null)
  const [confirmEnvIdx, setConfirmEnvIdx] = useState(null)
  const [confirmItem, setConfirmItem] = useState(null)
  const [role, setRole] = useState(null)

// Função para atualizar o texto do botão de remover ambiente
  const [btnRemoverAmbienteTxt, setBtnRemoverAmbienteTxt] = useState('Remover Ambiente');
  useEffect(() => {
    const atualizarTextoBotao = () => {
      if (window.innerWidth < 600) {
        setBtnRemoverAmbienteTxt('Remover');
      } else {
        setBtnRemoverAmbienteTxt('Remover Ambiente');
      }
    };
    atualizarTextoBotao();
    window.addEventListener('resize', atualizarTextoBotao);
    return () => window.removeEventListener('resize', atualizarTextoBotao);
  }, []);

  useEffect(() => {
    // somente precisa detectar localmente se o pai não forneceu a prop
    if (typeof parentShowStatus !== 'undefined') return
    const r = detectUserRole()
    setRole(r ? r.toLowerCase() : null)
  }, [parentShowStatus])

  const showStatus = typeof parentShowStatus !== 'undefined' ? parentShowStatus : role === 'gestor'

  const adicionarAmbiente = () => {
    const novo = {
      nome: `Novo Ambiente ${ambientes.length + 1}`,
      editando: true,
      aberto: true,
      itens: [],
    }
    setAmbientes([...ambientes, novo])
  }

  const atualizarNome = (idx, valor) => {
    const novos = [...ambientes]
    novos[idx].nome = valor
    setAmbientes(novos)
  }

  const finalizarEdicao = (idx) => {
    const novos = [...ambientes]
    novos[idx].editando = false
    setAmbientes(novos)
  }

  const removerAmbiente = (idx) => {
    setConfirmEnvIdx(idx)
  }

  const confirmRemoveAmbiente = () => {
    if (confirmEnvIdx === null) return
    setAmbientes(ambientes.filter((_, i) => i !== confirmEnvIdx))
    setConfirmEnvIdx(null)
  }

  const cancelRemoveAmbiente = () => {
    setConfirmEnvIdx(null)
  }

  const toggleCollapse = (idx) => {
    const novos = [...ambientes]
    novos[idx].aberto = !novos[idx].aberto
    setAmbientes(novos)
  }

  const adicionarLinha = (idx) => {
    const novos = [...ambientes]
    if (!novos[idx].itens) novos[idx].itens = []
    novos[idx].itens.push({ item: '', descricao: '', status: false })
    setAmbientes(novos)
  }

  const atualizarLinha = (idxAmb, idxLinha, campo, valor) => {
    const novos = [...ambientes]
    if (!novos[idxAmb].itens) return
    novos[idxAmb].itens[idxLinha][campo] = valor
    setAmbientes(novos)
  }

  const removerLinha = (idxAmb, idxLinha) => {
    setConfirmItem({ idxAmb, idxLinha })
  }

  const confirmRemoveItem = () => {
    if (!confirmItem) return
    const { idxAmb, idxLinha } = confirmItem
    const novos = [...ambientes]
    if (novos[idxAmb] && novos[idxAmb].itens && novos[idxAmb].itens.length > idxLinha) {
      novos[idxAmb].itens.splice(idxLinha, 1)
      setAmbientes(novos)
    }
    setConfirmItem(null)
  }

  const cancelRemoveItem = () => {
    setConfirmItem(null)
  }

  const toggleStatus = (idxAmb, idxItem) => {
    const novos = [...ambientes]
    if (!novos[idxAmb].itens) return
    novos[idxAmb].itens[idxItem].status = !novos[idxAmb].itens[idxItem].status
    setAmbientes(novos)
  }

  useEffect(() => {
    const handler = (e) => {
      if (!popupTarget) return
      const popupEl = document.querySelector('[data-descricao-popup="true"]')
      const clickedInsidePopup = popupEl && popupEl.contains(e.target)
      const clickedTextarea =
        popupTarget.ref && popupTarget.ref.contains && popupTarget.ref.contains(e.target)
      if (!clickedInsidePopup && !clickedTextarea) {
        setPopupTarget(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [popupTarget])

  return (
    <div className="section__section">
      {podeEditar && (
        <CButton className="adicionar-ambiente">
          <div
            className="d-flex align-items-center add-ambiente"
            onClick={adicionarAmbiente}
            style={{ cursor: 'pointer' }}
          >
            <IoIosAddCircle className="circle-icon" />
            <span className="ms-2">Adicionar Ambiente</span>
          </div>
        </CButton>
      )}

      <hr className='m-3'/>

      <div className="lista-ambientes">
        {ambientes.map((amb, idx) => (
          <div key={idx}>
            <CRow
              className="linha-ambiente justify-content-between align-items-center"
              style={{ cursor: 'pointer' }}
              onClick={() => toggleCollapse(idx)}
            >
              <div className="nome-wrapper">
                {amb.editando ? (
                  <input
                    type="text"
                    className="inline-input"
                    autoFocus
                    value={amb.nome}
                    onChange={(e) => atualizarNome(idx, e.target.value)}
                    onBlur={() => finalizarEdicao(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') finalizarEdicao(idx)
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className="nome-ambiente"
                    onDoubleClick={(e) => {
                      if(!podeEditar) return
                      e.stopPropagation()
                      const novos = [...ambientes]
                      novos[idx].editando = true
                      setAmbientes(novos)
                    }}
                  >
                    {`${idx + 1}. ${amb.nome}`}
                  </span>
                )}
              </div>
              {podeEditar && (
                <div className="acao-remover">
                  <CButton
                    color="danger"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      removerAmbiente(idx)
                    }}
                  >
                    {btnRemoverAmbienteTxt}
                  </CButton>
                </div>
              )}
            </CRow>

            <CCollapse className="div-collapse" visible={amb.aberto}>
              <CCard>
                <CTable bordered>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Item</CTableHeaderCell>
                      <CTableHeaderCell>Descrição</CTableHeaderCell>
                      {showStatus && <CTableHeaderCell>Status</CTableHeaderCell>}
                      {podeEditar && <CTableHeaderCell>Ações</CTableHeaderCell>}
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {(amb.itens || []).map((linha, i) => (
                      <CTableRow key={i}>
                        <CTableDataCell>
                          <textarea
                            className="auto-expand"
                            rows="1"
                            value={linha.item}
                            readOnly={!podeEditar}
                            onChange={(e) => {
                              if (!podeEditar) return
                              atualizarLinha(idx, i, 'item', e.target.value)
                            }}
                            onInput={(e) => {
                              if(!podeEditar) return
                              e.target.style.height = 'auto'
                              e.target.style.height = e.target.scrollHeight + 'px'
                            }}
                          />
                        </CTableDataCell>

                        <CTableDataCell style={{ position: 'relative' }}>
                          <textarea
                            className="auto-expand"
                            rows="1"
                            ref={(el) => (linha.descricaoRef = el)}
                            value={linha.descricao}
                            readOnly={!podeEditar}
                            onClick={(e) => {
                              if (podeEditar) {
                              e.stopPropagation()
                              setPopupTarget({ ambIdx: idx, itemIdx: i, ref: e.target })
                              }
                            }}
                            onChange={(e) =>
                              podeEditar && atualizarLinha(idx, i, 'descricao', e.target.value)
                            }
                            onInput={(e) => {
                              if (!podeEditar) return
                              e.target.style.height = 'auto'
                              e.target.style.height = e.target.scrollHeight + 'px'
                            }}
                          />
                          {popupTarget &&
                            popupTarget.ambIdx === idx &&
                            popupTarget.itemIdx === i && (
                              <DescricaoPopup
                                referenceElement={popupTarget.ref}
                                onSelect={(desc) => {
                                  atualizarLinha(idx, i, 'descricao', desc)
                                  setPopupTarget(null)
                                  setTimeout(() => {
                                    if (linha.descricaoRef) {
                                      linha.descricaoRef.style.height = 'auto'
                                      linha.descricaoRef.style.height =
                                        linha.descricaoRef.scrollHeight + 'px'
                                    }
                                  }, 0)
                                }}
                                onAdd={(novo) => {
                                  atualizarLinha(idx, i, 'descricao', novo)
                                  setPopupTarget(null)
                                }}
                                onClose={() => setPopupTarget(null)}
                              />
                            )}
                        </CTableDataCell>

                        {showStatus && (
                          <CTableDataCell
                            style={{ textAlign: 'center', cursor: 'pointer' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleStatus(idx, i)
                            }}
                          >
                            {linha.status ? (
                              <FaCheck color="green" />
                            ) : (
                              <BsXLg color="red" strokeWidth={1} />
                            )}
                          </CTableDataCell>
                        )}

                        {podeEditar && (
                          <CTableDataCell>
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => removerLinha(idx, i)}
                            >
                              Remover
                            </CButton>
                          </CTableDataCell>
                        )}
                      </CTableRow>
                    ))}
                    <CTableRow>
                      {podeEditar && (
                        <CTableDataCell colSpan={showStatus ? 4 : 3}>
                          <CButton color="success" size="sm" onClick={() => adicionarLinha(idx)}>
                            + Adicionar Linha
                          </CButton>
                        </CTableDataCell>
                      )}
                    </CTableRow>
                  </CTableBody>
                </CTable>
              </CCard>
            </CCollapse>
          </div>
        ))}
      </div>
        
      {/* Modal de confirmação para remoção de ambiente */}
      <CModal
        visible={confirmEnvIdx !== null}
        onClose={cancelRemoveAmbiente}
        alignment="center"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>Confirmar remoção</CModalHeader>
        <CModalBody>
          Tem certeza que deseja remover o ambiente "
          {confirmEnvIdx !== null ? ambientes[confirmEnvIdx].nome : ''}" e todos os seus itens?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={cancelRemoveAmbiente}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={confirmRemoveAmbiente}>
            Remover
          </CButton>
        </CModalFooter>
      </CModal>
      {/* Modal de confirmação para remoção de item */}
      <CModal
        visible={confirmItem !== null}
        onClose={cancelRemoveItem}
        alignment="center"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>Confirmar remoção</CModalHeader>
        <CModalBody>Tem certeza que deseja remover este item?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={cancelRemoveItem}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={confirmRemoveItem}>
            Remover
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}
