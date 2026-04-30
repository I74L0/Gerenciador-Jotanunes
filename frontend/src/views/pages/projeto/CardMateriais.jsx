import {
  CButton,
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
  CCard,
} from '@coreui/react'
import { useState } from 'react'
import { FaCheck } from 'react-icons/fa'
import { BsXLg } from 'react-icons/bs'


export default function CardMateriais({ materiais, showStatus, podeGestionar, podeEditar, setMateriais }) {
  const [confirmItem, setConfirmItem] = useState(null)

  // defensive fallback: garante um array
  const materiaisArray = Array.isArray(materiais)
    ? materiais
    : typeof materiais === 'string' && materiais.trim() !== ''
      ? // se for string, tenta interpretar como JSON ou como único item
        (() => {
          try {
            const parsed = JSON.parse(materiais)
            return Array.isArray(parsed) ? parsed : [{ item: String(materiais), marcas: [''] }]
          } catch {
            return [{ item: String(materiais), marcas: [''] }]
          }
        })()
      : []

  const adicionarMaterial = () => {
    const novoMaterial = {
      id: `${materiaisArray.length + 1}-${Date.now()}`,
      item: '',
      marcas: [''],
    }
    setMateriais([...materiaisArray, novoMaterial])
  }

  const removerMaterial = (index) => {
    setConfirmItem(index)
  }

  const confirmRemoveItem = () => {
    if (confirmItem === null) return
    const novos = materiaisArray.filter((_, i) => i !== confirmItem)
    setMateriais(novos)
    setConfirmItem(null)
  }

  const toggleStatus = (index, valor) => {
    const novos = [...materiaisArray];
    novos[index] = { ...novos[index], status: valor };
    setMateriais(novos);
  };


  const cancelRemoveItem = () => {
    setConfirmItem(null)
  }

  const atualizarNomeMaterial = (index, novoNome) => {
    const novos = [...materiaisArray]
    novos[index] = { ...(novos[index] || {}), item: novoNome }
    setMateriais(novos)
  }

  const atualizarMarcas = (index, novasMarcas) => {
    const novos = [...materiaisArray]
    const marcasArr =
      typeof novasMarcas === 'string'
        ? novasMarcas
            .split(',')
            .map((m) => m.trim())
            .filter(Boolean)
        : Array.isArray(novasMarcas)
          ? novasMarcas
          : []
    novos[index] = { ...(novos[index] || {}), marcas: marcasArr }
    setMateriais(novos)
  }

  return (
    <div className="section__section">
      <CCard className="mb-4 shadow-sm border-0" style={{ borderRadius: '10px' }}>
        <CTable hover responsive className="mb-0" align="middle">
          <CTableHead color="light">
            <CTableRow>
              <CTableHeaderCell className="border-0 w-25">Item</CTableHeaderCell>
              <CTableHeaderCell className="border-0 w-50">Marcas Sugeridas (separadas por vírgula)</CTableHeaderCell>
              {podeGestionar && <CTableHeaderCell className="border-0 text-center">Status</CTableHeaderCell>}
              {podeEditar && <CTableHeaderCell className="border-0">Ações</CTableHeaderCell>}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {materiaisArray.map((material, i) => (
              <CTableRow key={material.id ?? i}>
                <CTableDataCell>
                  <input
                    type="text"
                    className="auto-expand"
                    value={material?.item ?? ''}
                    readOnly={!podeEditar}
                    placeholder="Material"
                    onChange={(e) => {
                      if (!podeEditar) return
                      atualizarNomeMaterial(i, e.target.value)
                    }}
                  />
                </CTableDataCell>
                <CTableDataCell>
                  <textarea
                    className="auto-expand"
                    rows="1"
                    placeholder="Marcas"
                    value={
                      Array.isArray(material?.marcas)
                        ? material.marcas.join(', ')
                        : String(material?.marcas ?? '')
                    }
                    readOnly={!podeEditar}
                    onInput={(e) => {
                      if(!podeEditar) return
                      e.target.style.height = 'auto'
                      e.target.style.height = e.target.scrollHeight + 'px'
                    }}
                    onChange={(e) => 
                      podeEditar && atualizarMarcas(i, e.target.value)}
                  />
                </CTableDataCell>
                {podeGestionar && (
                  <CTableDataCell style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>

                      {/* Ícone CHECK (ativa status = true) */}
                      <FaCheck
                        color={material.status ? "green" : "gray"}
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(i, true);
                        }}
                      />

                      {/* Ícone X (ativa status = false) */}
                      <BsXLg
                        color={!material.status ? "red" : "gray"}
                        strokeWidth={1}
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(i, false);
                        }}
                      />

                    </div>
                  </CTableDataCell>
                )}

                <CTableDataCell>
                  {podeEditar && (
                  <CButton color="danger" size="sm" onClick={() => removerMaterial(i)}>
                    Remover
                  </CButton>
                  )}
                </CTableDataCell>
              </CTableRow>
            ))}
            {podeEditar && (
              <CTableRow>
                <CTableDataCell colSpan={showStatus ? 4 : 3}>
                  <CButton color="success" size="sm" onClick={adicionarMaterial}>
                    + Adicionar Material
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      </CCard>

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
