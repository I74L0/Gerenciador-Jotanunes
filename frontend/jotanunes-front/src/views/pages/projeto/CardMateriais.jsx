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
} from '@coreui/react'
import { useState } from 'react'

export default function CardMateriais({ materiais, setMateriais }) {
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
    <section className="section__section">
      <CTable hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Item</CTableHeaderCell>
            <CTableHeaderCell>Marcas Sugeridas (separadas por vírgula)</CTableHeaderCell>
            <CTableHeaderCell>Ações</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {materiaisArray.map((material, i) => (
            <CTableRow key={material.id ?? i}>
              <CTableDataCell width="25%">
                <input
                  type="text"
                  className="form-control"
                  value={material?.item ?? ''}
                  placeholder="Material"
                  onChange={(e) => atualizarNomeMaterial(i, e.target.value)}
                />
              </CTableDataCell>
              <CTableDataCell width="60%">
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Marcas"
                  value={
                    Array.isArray(material?.marcas)
                      ? material.marcas.join(', ')
                      : String(material?.marcas ?? '')
                  }
                  onChange={(e) => atualizarMarcas(i, e.target.value)}
                />
              </CTableDataCell>
              <CTableDataCell>
                <CButton color="danger" size="sm" onClick={() => removerMaterial(i)}>
                  Remover
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
          <CTableRow>
            <CTableDataCell colSpan={3}>
              <CButton color="success" size="sm" onClick={adicionarMaterial}>
                + Adicionar Material
              </CButton>
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>

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
    </section>
  )
}
