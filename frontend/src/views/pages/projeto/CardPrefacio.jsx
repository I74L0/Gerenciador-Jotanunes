import React from 'react'
import { CCard, CCardBody, CCardHeader, CFormInput, CFormTextarea } from '@coreui/react'

export default function CardPrefacio({ prefacio, setPrefacio, statusProjeto, podeEditar }) {

  return (
    <div className="section__section">
      <CCard className="mb-4 shadow-sm border-0" style={{ borderRadius: '10px' }}>
        <CCardHeader className="bg-white border-bottom-0 pt-4 pb-0">
          <h5 className="mb-0 text-dark">Prefácio</h5>
        </CCardHeader>
        <CCardBody className="p-4">

        <div className="row g-3 mb-4">
          <div className="col-md-5">
            <CFormInput
              type="text"
              label="Nome do Empreendimento"
              value={prefacio.nome}
              disabled={!podeEditar}
              onChange={(e) => setPrefacio({ ...prefacio, nome: e.target.value })}
              placeholder='Deixe vazio para não salvar'
            />
          </div>

          <div className="col-md-2">
            <CFormInput
              type="text"
              label="Estado"
              maxLength={2}
              value={prefacio.estado}
              disabled={!podeEditar}
              onChange={(e) => setPrefacio({ ...prefacio, estado: e.target.value })}
            />
          </div>

          <div className="col-md-5">
            <CFormInput
              type="text"
              label="Cidade"
              value={prefacio.cidade}
              disabled={!podeEditar}
              onChange={(e) => setPrefacio({ ...prefacio, cidade: e.target.value })}
            />
          </div>
        </div>

        <CFormTextarea
          label="Descrição do Prefácio"
          rows={10}
          placeholder="Escreva o prefácio aqui..."
          value={prefacio.texto}
          disabled={!podeEditar}
          onChange={(e) => setPrefacio({ ...prefacio, texto: e.target.value })}
        />

        {(statusProjeto === "EM_ANALISE" || statusProjeto === "RECUSADO") && (
          <div className="mt-4 pt-3 border-top">
            <h6 className="text-muted mb-3">Observações do Gestor</h6>
            <CFormTextarea
              rows={4}
              placeholder="Digite as observações..."
              value={prefacio.observacao_gestor || ""}
              disabled={statusProjeto === "RECUSADO" || !podeEditar}  
              onChange={(e) =>
                setPrefacio({ ...prefacio, observacao_gestor: e.target.value })
              }
            />
          </div>
        )}
      </CCardBody>
    </CCard>
    </div>
  )
}