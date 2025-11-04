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
} from '@coreui/react'
import { IoIosAddCircle } from "react-icons/io";
import { FaCheck } from 'react-icons/fa'
import { BsXLg } from 'react-icons/bs'

// Importa o componente DescricaoPopup
import DescricaoPopup from '../../../components/DescricaoPopup';

export default function CardUnidades({ ambientes, setAmbientes }) {
  const [popupTarget, setPopupTarget] = useState(null);

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
    setAmbientes(ambientes.filter((_, i) => i !== idx))
  }

  const toggleCollapse = (idx) => {
    const novos = [...ambientes]
    novos[idx].aberto = !novos[idx].aberto
    setAmbientes(novos)
  }

  const adicionarItem = (idx) => {
    const novos = [...ambientes]
    if (!novos[idx].items) novos[idx].items = []
    novos[idx].items.push({ item: '', descricao: '', status: false })
    setAmbientes(novos)
  }

  const atualizarItem = (idxAmb, idxItem, campo, valor) => {
    const novos = [...ambientes]
    if (!novos[idxAmb].items) return
    novos[idxAmb].items[idxItem][campo] = valor
    setAmbientes(novos)
  }

  const removerItem = (idxAmb, idxItem) => {
    const novos = [...ambientes]
    if (!novos[idxAmb].items) return
    novos[idxAmb].items.splice(idxItem, 1)
    setAmbientes(novos)
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
      const clickedTextarea = popupTarget.ref && popupTarget.ref.contains(e.target);

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
                      />
                    ) : (
                      <span className="nome-ambiente">{`${idx + 1}. ${amb.nome}`}</span>
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
                        { (amb.items || []).map((linha, i) => (
                          <CTableRow key={i}>
                            <CTableDataCell>
                              <textarea
                                className="auto-expand"
                                rows="1"
                                value={linha.item}
                                onChange={(e) =>
                                  atualizarItem(idx, i, 'item', e.target.value)
                                }
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
                                // Cria uma referência para a textarea na linha atual
                                ref={(el) => linha.descricaoRef = el} 
                                value={linha.descricao}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPopupTarget({ ambIdx: idx, itemIdx: i, ref: e.target });
                                }}
                                onChange={(e) =>
                                  atualizarItem(idx, i, 'descricao', e.target.value)
                                }
                                onInput={(e) => {
                                  e.target.style.height = 'auto';
                                  e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                              />
                              {/* Renderiza o DescricaoPopup se for o alvo correto */}
                              {popupTarget &&
                                popupTarget.ambIdx === idx &&
                                popupTarget.itemIdx === i && (
                                  <DescricaoPopup
                                    referenceElement={popupTarget.ref}
                                    onSelect={(desc) => {
                                      atualizarItem(idx, i, 'descricao', desc);
                                      setPopupTarget(null);
                                      // Usa a função auxiliar para ajustar o tamanho da textarea
                                      setTimeout(() => { 
                                        if(linha.descricaoRef) adjustTextareaSize(linha.descricaoRef)
                                      }, 0)
                                    }}
                                    onAdd={(novo) => {
                                      atualizarItem(idx, i, 'descricao', novo);
                                      setPopupTarget(null);
                                      // Não precisa de setTimeout/adjustTextareaSize aqui, pois a alteração manual já faz isso
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
                                onClick={() => removerItem(idx, i)}
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
                              onClick={() => adicionarItem(idx)}
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
        </>
      </CCardBody>
    </CCard>
  )
}