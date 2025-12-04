import React from 'react'
import { CCard, CCardBody } from '@coreui/react'

export default function CardPrefacio({ prefacio, setPrefacio, statusProjeto }) {

  return (
    <div className="body__card-prefacio">
      <div className="prefacio-wrapper">
        <h5>Prefácio</h5>

        <div className="prefacio-linha">
          <label className="prefacio-label">
            Nome:
            <input
              type="text"
              className="prefacio-input"
              value={prefacio.nome}
              onChange={(e) => setPrefacio({ ...prefacio, nome: e.target.value })}
              placeholder='Deixe vazio para não salvar projeto'
            />
          </label>

          <label className="prefacio-label">
            Estado:
            <input
              type="text"
              className="prefacio-input"
              maxLength={2}
              value={prefacio.estado}
              onChange={(e) => setPrefacio({ ...prefacio, estado: e.target.value })}
            />
          </label>

          <label className="prefacio-label">
            Cidade:
            <input
              type="text"
              className="prefacio-input"
              value={prefacio.cidade}
              onChange={(e) => setPrefacio({ ...prefacio, cidade: e.target.value })}
            />
          </label>
        </div>

        <textarea
          className="prefacio-textarea"
          placeholder="Escreva o prefácio aqui..."
          value={prefacio.texto}
          onChange={(e) => setPrefacio({ ...prefacio, texto: e.target.value })}
        />
      </div>

        {(statusProjeto === "EM_ANALISE" || statusProjeto === "RECUSADO") && (
        <div className="observacoes-gestor">
          <h6>Observações do gestor</h6>

          <textarea
            className="prefacio-textarea"
            placeholder="Digite as observações..."
            value={prefacio.observacao_gestor || ""}
            disabled={statusProjeto === "RECUSADO"}  
            onChange={(e) =>
              setPrefacio({ ...prefacio, observacao_gestor: e.target.value })
            }
          />
        </div>
      )}
    
    </div>
  )
}