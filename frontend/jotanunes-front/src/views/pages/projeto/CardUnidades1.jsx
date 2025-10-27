import { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCol,
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
  CButton,
  CFormInput,
  CFormCheck,
  CBadge
} from '@coreui/react'
import { IoIosAddCircle } from 'react-icons/io'
import { FaCheck } from 'react-icons/fa'
import { BsXLg } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'

export default function CardUnidades() {
  const navigate = useNavigate()

  const [ambientesData, setAmbientesData] = useState([
    {
      id: '1.1',
      nome: 'Sala de Estar/ Jantar',
      items: [
        { item: 'Piso', descricao: 'Porcelanato', status: true },
        { item: 'Rodapé', descricao: 'Porcelanato, h-5cm', status: false },
        { item: 'Parede', descricao: 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA', status: true },
      ],
    },
    {
      id: '1.2',
      nome: 'Circulação',
      items: [
        { item: 'Piso', descricao: 'Porcelanato', status: true },
        { item: 'Rodapé', descricao: 'Porcelanato, h-5cm', status: false },
        { item: 'Parede', descricao: 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA', status: true },
      ],
    },
    {
      id: '1.3',
      nome: 'Quarto e Suíte',
      items: [
        { item: 'Piso', descricao: 'Porcelanato', status: true },
        { item: 'Rodapé', descricao: 'Porcelanato, h-5cm', status: false },
        { item: 'Parede', descricao: 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA', status: true },
      ],
    },
    {
      id: '1.4',
      nome: 'Sanitário/Lavabo',
      items: [
        { item: 'Piso', descricao: 'Porcelanato', status: true },
        { item: 'Louças', descricao: 'Vaso e pia conforme especificação', status: true },
        { item: 'Revestimento', descricao: 'Azulejo até 2m', status: false },
      ],
    },
    {
      id: '1.5',
      nome: 'Cozinha/ Área de Serviço',
      items: [
        { item: 'Piso', descricao: 'Porcelanato', status: true },
        { item: 'Rodapé', descricao: 'Porcelanato, h-5cm', status: false },
        { item: 'Pia', descricao: 'Bancada em granito', status: true },
      ],
    },
    {
      id: '1.6',
      nome: 'Área Técnica',
      items: [
        { item: 'Acesso', descricao: 'Porta técnica', status: true },
        { item: 'Piso', descricao: 'Cimentado', status: true },
        { item: 'Instalações', descricao: 'Pontos elétricos e hidráulicos', status: false },
      ],
    },
    {
      id: '1.7',
      nome: 'Varanda',
      items: [
        { item: 'Revestimento', descricao: 'Porcelanato externo', status: true },
        { item: 'Guarda-corpo', descricao: 'Vidro temperado', status: true },
        { item: 'Drenagem', descricao: 'Sistema linear', status: false },
      ],
    },
    {
      id: '1.8',
      nome: 'Garden',
      items: [
        { item: 'Piso', descricao: 'Deck e piso drenante', status: true },
        { item: 'Vegetação', descricao: 'Plantio especificado em projeto', status: false },
        { item: 'Irrigação', descricao: 'Sistema automático', status: true },
      ],
    },
  ])

  const [visibleMap, setVisibleMap] = useState(() => {
    const map = {}
    ambientesData.forEach((a) => (map[a.id] = false))
    return map
  })

  const [modalVisible, setModalVisible] = useState(false)
  const [modalEnvIndex, setModalEnvIndex] = useState(null)
  const [newItemName, setNewItemName] = useState('')
  const [newItemDesc, setNewItemDesc] = useState('')
  const [newItemStatus, setNewItemStatus] = useState(false)

  function toggleCollapse(envId) {
    setVisibleMap((prev) => ({ ...prev, [envId]: !prev[envId] }))
  }

  function openAddItemModal(index) {
    setModalEnvIndex(index)
    setNewItemName('')
    setNewItemDesc('')
    setNewItemStatus(false)
    setModalVisible(true)
    setVisibleMap((prev) => ({ ...prev, [ambientesData[index].id]: true }))
  }

  function closeModal() {
    setModalVisible(false)
    setModalEnvIndex(null)
  }

  function saveNewItem() {
    if (modalEnvIndex === null) return
    const trimmedName = newItemName.trim()
    if (trimmedName === '') return
    setAmbientesData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev))
      copy[modalEnvIndex].items.push({
        item: trimmedName,
        descricao: newItemDesc.trim(),
        status: !!newItemStatus,
      })
      return copy
    })
    closeModal()
  }

  function removeEnvironment(index) {
    setAmbientesData((prev) => {
      const removedId = prev[index].id
      const copy = prev.filter((_, i) => i !== index)
      setVisibleMap((vmPrev) => {
        const vmCopy = { ...vmPrev }
        delete vmCopy[removedId]
        return vmCopy
      })
      return copy
    })
  }

  return (
    <CCard className="h-100 w-75">
      <CCardBody className="p-0">
        <CRow className="justify-content-between align-items-center m-3">
          <CRow className="d-flex align-items-center" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <IoIosAddCircle className="circle-icon" />
            <p>Adicionar Ambiente</p>
          </CRow>
          <div><p>Unique Residence</p></div>
        </CRow>
        <div>
          <CCol>
            {ambientesData.map((amb, idx) => (
              <div key={amb.id} style={{ marginBottom: 8 }}>
                <div className="ambiente" onClick={() => toggleCollapse(amb.id)} style={{ cursor: 'pointer' }}>
                  <CRow className="align-items-center">
                    <p style={{ width: 20, margin: 0 }}>{visibleMap[amb.id] ? '⮕' : '|'}</p>
                    <p style={{ margin: '0 8px' }}>{amb.id} {amb.nome}</p>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                      <CButton color="danger" size="sm" onClick={(e) => { e.stopPropagation(); removeEnvironment(idx); }}>Remover Ambiente</CButton>
                    </div>
                  </CRow>
                </div>
                <CCollapse visible={!!visibleMap[amb.id]}>
                  <CTable>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col">Item</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Descrição</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {amb.items.map((it, i) => (
                        <CTableRow key={i}>
                          <CTableDataCell>{it.item}</CTableDataCell>
                          <CTableDataCell>{it.descricao}</CTableDataCell>
                          <CTableDataCell>{it.status ? <FaCheck /> : <BsXLg strokeWidth={2} />}</CTableDataCell>
                        </CTableRow>
                      ))}
                      <CTableRow>
                        <CTableDataCell colSpan={3} style={{ textAlign: 'right' }}>
                          <CButton color="info" size="sm" onClick={(e) => { e.stopPropagation(); openAddItemModal(idx); }}>Adicionar Item</CButton>
                        </CTableDataCell>
                      </CTableRow>
                    </CTableBody>
                  </CTable>
                </CCollapse>
              </div>
            ))}
          </CCol>
        </div>

        <CModal visible={modalVisible} onClose={closeModal}>
          <CModalHeader>Adicionar Item</CModalHeader>
          <CModalBody>
            <CFormInput
              type="text"
              placeholder="Nome do Item"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="mb-3"
            />
            <CFormInput
              type="text"
              placeholder="Descrição"
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
              className="mb-3"
            />
            <CFormCheck
              label="Status OK?"
              checked={newItemStatus}
              onChange={(e) => setNewItemStatus(e.target.checked)}
            />
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={closeModal}>Cancelar</CButton>
            <CButton color="primary" onClick={saveNewItem}>Salvar</CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  )
}
