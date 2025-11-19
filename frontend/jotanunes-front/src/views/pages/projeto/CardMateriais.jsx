import {
  CButton,
  CCard,
  CCardBody,
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

  const adicionarMaterial = () => {
    const novoMaterial = {
      id: `${materiais.length + 1}`,
      nome: '',
      marcas: [''],
    }
    setMateriais([...materiais, novoMaterial])
  }

  const removerMaterial = (index) => {
    setConfirmItem(index)
  }

  const confirmRemoveItem = () => {
    if (confirmItem === null) return
    setMateriais(materiais.filter((_, i) => i !== confirmItem))
    setConfirmItem(null)
  }

  const cancelRemoveItem = () => {
    setConfirmItem(null)
  }

  const atualizarNomeMaterial = (index, novoNome) => {
    const novosMateriais = [...materiais]
    novosMateriais[index].nome = novoNome
    setMateriais(novosMateriais)
  }

  const atualizarMarcas = (index, novasMarcas) => {
    const novosMateriais = [...materiais]
    novosMateriais[index].marcas = novasMarcas.split(',').map((marca) => marca.trim())
    setMateriais(novosMateriais)
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
            {materiais.map((material, i) => (
              <CTableRow key={i}>
                <CTableDataCell width="25%">
                  <input
                    type="text"
                    className="form-control"
                    value={material.nome}
                    placeholder='Material'
                    onChange={(e) => atualizarNomeMaterial(i, e.target.value)}
                  />
                </CTableDataCell>
                <CTableDataCell width="60%">
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder='Marcas'
                    value={material.marcas.join(', ')}
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

      {/* Modal de confirmação para remoção de material */}
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