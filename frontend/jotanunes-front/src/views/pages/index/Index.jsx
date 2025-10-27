import React, { useState } from "react";
import {
  CButton,
  CForm,
  CFormSelect,
  CHeader,
  CImage,
  CContainer,
} from "@coreui/react";
import './Index-style.css';

const Index = () => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div className="create-page d-flex flex-column vh-100">
      {/* Topbar */}
      <CHeader
        position="sticky"
        className="topbar d-flex justify-content-between align-items-center px-4 py-2 border-bottom bg-white"
      >
        <div>
          <CImage src="/images/Logo Vermelha.png" alt="Logo" height={45} width={150} />
        </div>
        <div className="d-flex align-items-center gap-2">
          <span>Usuário</span>
          <div className="user-icon">👤</div>
        </div>
      </CHeader>

      {/* Subbar */}
      <CHeader
        position="sticky"
        className="subbar d-flex justify-content-between align-items-center px-4 py-2 border-bottom bg-light"
      >
        <div className="d-flex gap-3">
          <CButton
            color="light"
            className="text-danger fw-bold d-flex align-items-center gap-2 border-0 bg-transparent"
          >
            <CImage src="/images/mais.png" alt="Mais" height={20} />
            <span className="text-dark">Cadastrar Materiais</span>
          </CButton>

          <CButton
            color="light"
            className="text-danger fw-bold d-flex align-items-center gap-2 border-0 bg-transparent"
            onClick={() => setShowModal(true)}
          >
            <CImage src="/images/mais.png" alt="Mais" height={20} />
            <span className="text-dark">Criar Projeto</span>
          </CButton>
        </div>

        <div className="flex-grow-1 px-3">
          <input className="form-control" placeholder="Pesquisar" />
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="circle red"></div>
          <div className="circle orange"></div>
          <div className="circle blue"></div>
          <div className="circle green"></div>
          <div className="filter">⚲</div>
        </div>
      </CHeader>

      {/* Conteúdo principal */}
      <CContainer fluid className="create-frame p-0">
        <div className="side left" />
        <div className="center-area">
          <div className="center-inner">
            <div className="tab">Editor de Especificações Técnicas</div>

            <div className="filters my-3">
              <CForm className="d-flex gap-3 align-items-center">
                <CFormSelect style={{ width: "200px" }}>
                  <option>Estado</option>
                </CFormSelect>
                <CFormSelect style={{ width: "200px" }}>
                  <option>Cidade</option>
                </CFormSelect>
              </CForm>
            </div>

            <div className="main-content-placeholder" style={{ minHeight: 420 }} />
          </div>
        </div>
        <div className="side right" />
      </CContainer>

      {/* Modal Criar Projeto */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}>↩</button>
            <div className="modal-content">
              <CButton color="light" className="modal-btn">Template Vazio</CButton>
              <CButton color="light" className="modal-btn">Com Referência</CButton>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="footer p-2">
        <div className="legend d-flex gap-4">
          <div className="legend-item"><div className="legend-circle red"></div>Recusado</div>
          <div className="legend-item"><div className="legend-circle blue"></div>Em análise</div>
          <div className="legend-item"><div className="legend-circle orange"></div>Não Finalizado</div>
          <div className="legend-item"><div className="legend-circle green"></div>Finalizado</div>
        </div>
      </div>
    </div>
  );
}

export default Index
