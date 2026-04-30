import React from 'react'
import { CCard, CCardBody, CCardHeader, CFormTextarea } from '@coreui/react'

export default function CardObservacoes({ observacao_final, setObservacoes, podeEditar }) {
  // garante que temos um objeto
  const obsObj =
    typeof observacao_final === 'string'
      ? { observacao_final }
      : observacao_final || { observacao_final: '' }

  return (
    <div className="section__section">
      <CCard className="mb-4 shadow-sm border-0" style={{ borderRadius: '10px' }}>
        <CCardHeader className="bg-white border-bottom-0 pt-4 pb-0">
          <h5 className="mb-0 text-dark">Observações</h5>
        </CCardHeader>
        <CCardBody className="p-4">
          <CFormTextarea
            rows={15}
            placeholder="Observações adicionais do projeto..."
            value={obsObj.observacao_final}
            disabled={!podeEditar && typeof podeEditar !== 'undefined'}
            onChange={(e) => setObservacoes({ ...obsObj, observacao_final: e.target.value })}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}
