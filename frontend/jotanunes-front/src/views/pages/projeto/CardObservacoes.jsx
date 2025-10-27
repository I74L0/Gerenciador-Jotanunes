import React from 'react'
import { CCard, CCardBody, CRow } from '@coreui/react'

export default function CardObservacoes({ observacoes, setObservacoes }) {
  const handleChange = (event) => {
    setObservacoes([{ observacao: event.target.value }])
  }

  return (
    <CCard className="m-4 h-100 w-75">
      <CCardBody>
        <CRow className="justify-content-between align-items-center">
          <div>
            <h5>Observações</h5>
          </div>
        </CRow>
        <hr />
        <textarea
          className="w-100 h-75 form-control"
          placeholder="Observações do projeto"
          value={observacoes[0].observacao}
          onChange={handleChange}
        ></textarea>
      </CCardBody>
    </CCard>
  )
}