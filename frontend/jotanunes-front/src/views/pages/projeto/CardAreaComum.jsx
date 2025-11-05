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
import { useState } from 'react'
import { IoIosAddCircle } from 'react-icons/io'
import { FaCheck } from 'react-icons/fa'
import { BsXLg } from 'react-icons/bs'

export default function CardAreaComum({ ambientes, setAmbientes }) {
  const [confirmEnvIdx, setConfirmEnvIdx] = useState(null)
  const [confirmItem, setConfirmItem] = useState(null)

  const adicionarAmbiente = () => {
    const novoId = `${ambientes.length + 1}.`
    const novo = { id: novoId, nome: `Novo Ambiente`, editando: true, aberto: true, items: [] }
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
    // abrir modal de confirmação em vez de remover imediatamente
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
    novos[idx].items.push({ item: '', descricao: '', status: false })
    setAmbientes(novos)
  }

  const atualizarLinha = (idxAmb, idxLinha, campo, valor) => {
    const novos = [...ambientes]
    novos[idxAmb].items[idxLinha][campo] = valor
    setAmbientes(novos)
  }

  const toggleStatus = (idxAmb, idxLinha) => {
    const novos = [...ambientes]
    novos[idxAmb].items[idxLinha].status = !novos[idxAmb].items[idxLinha].status
    setAmbientes(novos)
  }

  const removerLinha = (idxAmb, idxLinha) => {
    // abrir modal de confirmação para remoção da linha
    setConfirmItem({ idxAmb, idxLinha })
  }

  const confirmRemoveItem = () => {
    if (!confirmItem) return
    const { idxAmb, idxLinha } = confirmItem
    const novos = [...ambientes]
    if (novos[idxAmb] && novos[idxAmb].items && novos[idxAmb].items.length > idxLinha) {
      novos[idxAmb].items.splice(idxLinha, 1)
      setAmbientes(novos)
    }
    setConfirmItem(null)
  }

  const cancelRemoveItem = () => {
    setConfirmItem(null)
  }

  return (
    <CCard className="h-100 w-75">
      <CCardBody className="p-0">
        <CRow className="justify-content-between align-items-center mb-2 mt-3">
          <div
            className="d-flex align-items-center add-ambiente"
            onClick={adicionarAmbiente}
            style={{ cursor: 'pointer', width: 'auto' }}
          >
            <IoIosAddCircle className="circle-icon" />
            <span className="ms-2">Adicionar Ambiente</span>
          </div>
        </CRow>
        <hr />
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
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => atualizarNome(idx, e.target.value)}
                      onBlur={() => finalizarEdicao(idx)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') finalizarEdicao(idx)
                      }}
                    />
                  ) : (
                    <span className="nome-ambiente">{`${amb.id} ${amb.nome}`}</span>
                  )}
                </div>

                <div className="acao-remover">
                  <CButton
                    color="danger"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      removerAmbiente(idx)
                    }}
                  >
                    Remover Ambiente
                  </CButton>
                </div>
              </CRow>

              <CCollapse className='div-collapse' visible={amb.aberto}>
                <CCard>
                  <CTable bordered>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Item</CTableHeaderCell>
                        <CTableHeaderCell>Descrição</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Ações</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {amb.items.map((linha, i) => (
                        <CTableRow key={i}>
                          <CTableDataCell>
                            <textarea
                              className="auto-expand"
                              rows="1"
                              value={linha.item}
                              onChange={(e) => atualizarLinha(idx, i, 'item', e.target.value)}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <textarea
                              className="auto-expand"
                              rows="1"
                              value={linha.descricao}
                              onChange={(e) =>
                                atualizarLinha(idx, i, 'descricao', e.target.value)
                              }
                            />
                          </CTableDataCell>
                          <CTableDataCell
                            style={{ textAlign: 'center', cursor: 'pointer' }}
                            onClick={() => toggleStatus(idx, i)}
                          >
                            {linha.status ? (
                              <FaCheck color="green" />
                            ) : (
                              <BsXLg color="red" strokeWidth={1} />
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => removerLinha(idx, i)}
                            >
                              Remover
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                      <CTableRow>
                        <CTableDataCell colSpan={4}>
                          <CButton color="success" size="sm" onClick={() => adicionarLinha(idx)}>
                            + Adicionar Linha
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    </CTableBody>
                  </CTable>
                </CCard>
              </CCollapse>
            </div>
          ))}
        </div>
      {/* Modal de confirmação para remoção de ambiente */}
      <CModal visible={confirmEnvIdx !== null} onClose={cancelRemoveAmbiente} alignment="center">
        <CModalHeader>Confirmar remoção</CModalHeader>
        <CModalBody>
          Tem certeza que deseja remover o ambiente "{confirmEnvIdx !== null ? ambientes[confirmEnvIdx].nome : ''}" e todos os seus itens?
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

      {/* Modal de confirmação para remoção de linha/item */}
      <CModal visible={confirmItem !== null} onClose={cancelRemoveItem} alignment="center">
        <CModalHeader>Confirmar remoção</CModalHeader>
        <CModalBody>
          Tem certeza que deseja remover este item?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={cancelRemoveItem}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={confirmRemoveItem}>
            Remover
          </CButton>
        </CModalFooter>
      </CModal>

      </CCardBody>
    </CCard>
  )
}