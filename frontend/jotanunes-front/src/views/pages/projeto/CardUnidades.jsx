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
import { IoIosAddCircle } from "react-icons/io";
import { FaCheck } from 'react-icons/fa'
import { BsXLg } from 'react-icons/bs'

// Importa o componente DescricaoPopup compartilhado
import DescricaoPopup from '../../../components/DescricaoPopup';

export default function CardUnidades({ ambientes, setAmbientes }) {
  const [popupTarget, setPopupTarget] = useState(null)
  const [confirmEnvIdx, setConfirmEnvIdx] = useState(null)
  const [confirmItem, setConfirmItem] = useState(null)

  const adicionarAmbiente = () => {
    const novo = { nome: `Novo Ambiente ${ambientes.length + 1}`, editando: true, aberto: true, items: [] }
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
    if (!novos[idx].items) novos[idx].items = []
    novos[idx].items.push({ item: '', descricao: '', status: false })
    setAmbientes(novos)
  }

  const atualizarLinha = (idxAmb, idxLinha, campo, valor) => {
    const novos = [...ambientes]
    if (!novos[idxAmb].items) return
    novos[idxAmb].items[idxLinha][campo] = valor
    setAmbientes(novos)
  }

  const removerLinha = (idxAmb, idxLinha) => {
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

  const toggleStatus = (idxAmb, idxItem) => {
    const novos = [...ambientes]
    if (!novos[idxAmb].items) return
    novos[idxAmb].items[idxItem].status = !novos[idxAmb].items[idxItem].status
    setAmbientes(novos)
  }

  useEffect(() => {
    const handler = (e) => {
      if (!popupTarget) return;
      const popupEl = document.querySelector('[data-descricao-popup="true"]');
      const clickedInsidePopup = popupEl && popupEl.contains(e.target);
      const clickedTextarea = popupTarget.ref && popupTarget.ref.contains && popupTarget.ref.contains(e.target);

      if (!clickedInsidePopup && !clickedTextarea) {
        setPopupTarget(null);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popupTarget]);

  return (
    <CCard className="h-100 w-75">
      <CCardBody className="p-0">
        <>
          <CRow className="justify-content-between align-items-center mb-2 mt-3">
            <div
              className="d-flex align-items-center add-ambiente"
              onClick={adicionarAmbiente}
              style={{ cursor: 'pointer' }}
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
                                onInput={(e) => {
                                  e.target.style.height = 'auto'
                                  e.target.style.height = e.target.scrollHeight + 'px'
                                }}
                              />
                            </CTableDataCell>

                            <CTableDataCell style={{ position: 'relative' }}>
                              <textarea
                                className="auto-expand"
                                rows="1"
                                ref={(el) => linha.descricaoRef = el}
                                value={linha.descricao}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPopupTarget({ ambIdx: idx, itemIdx: i, ref: e.target });
                                }}
                                onChange={(e) =>
                                  atualizarLinha(idx, i, 'descricao', e.target.value)
                                }
                                onInput={(e) => {
                                  e.target.style.height = 'auto';
                                  e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                              />
                              {popupTarget &&
                                popupTarget.ambIdx === idx &&
                                popupTarget.itemIdx === i && (
                                  <DescricaoPopup
                                    referenceElement={popupTarget.ref}
                                    onSelect={(desc) => {
                                      atualizarLinha(idx, i, 'descricao', desc);
                                      setPopupTarget(null);
                                      setTimeout(() => {
                                        if (linha.descricaoRef) {
                                          linha.descricaoRef.style.height = 'auto';
                                          linha.descricaoRef.style.height = linha.descricaoRef.scrollHeight + 'px';
                                        }
                                      }, 0);
                                    }}
                                    onAdd={(novo) => {
                                      atualizarLinha(idx, i, 'descricao', novo);
                                      setPopupTarget(null);
                                    }}
                                    onClose={() => setPopupTarget(null)}
                                  />
                                )}
                            </CTableDataCell>

                            <CTableDataCell
                              style={{ textAlign: 'center', cursor: 'pointer' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStatus(idx, i);
                              }}
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
                            <CButton
                              color="success"
                              size="sm"
                              onClick={() => adicionarLinha(idx)}
                            >
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
          <CModal visible={confirmEnvIdx !== null} onClose={cancelRemoveAmbiente} alignment="center" backdrop="static" keyboard={false}>
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
          <CModal visible={confirmItem !== null} onClose={cancelRemoveItem} alignment="center" backdrop="static" keyboard={false}>
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
        </>
      </CCardBody>
    </CCard>
  )
}