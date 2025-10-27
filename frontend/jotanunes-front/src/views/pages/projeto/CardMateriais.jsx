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
} from '@coreui/react'

export default function CardMateriais({ materiais, setMateriais }) {

  const adicionarMaterial = () => {
    const novoMaterial = {
      id: `${materiais.length + 1}`,
      nome: 'Novo Material',
      marcas: ['Nova Marca'],
    }
    setMateriais([...materiais, novoMaterial])
  }

  const removerMaterial = (index) => {
    setMateriais(materiais.filter((_, i) => i !== index))
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
    <CCard className="h-100 w-75">
      <CCardBody className="p-0">
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
                    onChange={(e) => atualizarNomeMaterial(i, e.target.value)}
                  />
                </CTableDataCell>
                <CTableDataCell width="60%">
                  <textarea
                    className="form-control"
                    rows="2"
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
      </CCardBody>
    </CCard>
  )
}