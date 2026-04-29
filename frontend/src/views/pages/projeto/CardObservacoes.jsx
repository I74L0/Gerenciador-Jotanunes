import React from 'react'
import { CCard, CCardBody, CRow } from '@coreui/react'

export default function CardObservacoes({ observacao_final, setObservacoes }) {
  // garante que temos um objeto
  const obsObj =
    typeof observacao_final === 'string'
      ? { observacao_final }
      : observacao_final || { observacao_final: '' }

  return (
    <div className="body__card-prefacio">
      <CRow className="justify-content-between align-items-center">
        <div>
          <h5>Observações</h5>
        </div>
      </CRow>
      <hr />
      <textarea
        className="w-100 h-75 form-control"
        placeholder="Observações do projeto"
        value={obsObj.observacao_final}
        onChange={(e) => setObservacoes({ ...obsObj, observacao_final: e.target.value })}
      ></textarea>
    </div>
  )
}
