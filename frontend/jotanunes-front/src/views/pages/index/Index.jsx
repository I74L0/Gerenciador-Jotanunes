import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CForm,
  CFormSelect,
  CHeader,
  CImage,
  CContainer,
  CSpinner,
} from "@coreui/react";
import './Index-style.css';

import { obras } from "../../../apiClient";

const Index = () => {
  const navigate = useNavigate();

  const [obrasLista, setObrasLista] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selecionados, setSelecionados] = useState([]); // ✅ Novo estado

  const handleTemplateVazio = () => {
    navigate('/projeto');
    return;
  };

  // Função para alternar seleção de checkbox
  const toggleSelecionado = (id) => {
    setSelecionados((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const temSelecionado = selecionados.length > 0; // ✅ Detecta se há selecionados

  // Efeito para carregar os dados
  useEffect(() => {
    const carregarObras = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await obras.list(); 
        setObrasLista(response.data); 
      } catch (error) {
        console.error("Erro ao carregar obras:", error);
        setError("Falha ao carregar as obras. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    carregarObras();
  }, []);

  // Função para renderizar o conteúdo principal
  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className="d-flex justify-content-center align-items-center h-100">
          <CSpinner color="primary" />
          <span className="ms-2">Carregando obras...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="d-flex justify-content-center align-items-center h-100 text-danger">
          {error}
        </div>
      );
    }

    if (obrasLista.length === 0) {
      return (
        <div className="d-flex justify-content-center align-items-center h-100">
          <p>Nenhuma obra encontrada.</p>
        </div>
      );
    }

    return (
      <div className="obras-lista p-3">
        {obrasLista.map((obra) => {
          let statusColor = "blue";
          switch (obra.status) {
            case "Recusado": statusColor = "red"; break;
            case "Em análise": statusColor = "blue"; break;
            case "Não Finalizado": statusColor = "orange"; break;
            case "Finalizado": statusColor = "green"; break;
          }

          return (
            <div
              key={obra.id}
              className="obra-item d-flex align-items-center justify-content-between border-bottom py-2"
            >
              {/* Parte esquerda: checkbox + info em linha */}
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selecionados.includes(obra.id)}
                  onChange={() => toggleSelecionado(obra.id)}
                />

                <div className="d-flex align-items-center flex-wrap gap-custom">
                  <span className="fw-bold">{obra.nome || `Obra ID: ${obra.id}`}</span>
                  {obra.estado && obra.cidade ? (
                    <>
                      <span className="text-muted">{obra.estado}</span>
                      <span className="text-muted">{obra.cidade}</span>
                    </>
                  ) : (
                    <span className="text-muted">Localização não definida</span>
                  )}
                </div>
              </div>

              {/* Parte direita: círculo + botão */}
              <div className="d-flex align-items-center gap-3">
                <div
                  className="status-circle"
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: statusColor,
                  }}
                />
                <CButton
                  size="sm"
                  color="light"
                  className="border"
                  onClick={() => navigate(`/projeto/${obra.id}`)}
                >
                  Abrir Projeto
                </CButton>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
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
            className="text-danger fw-bold d-flex align-items-center gap-2 border-0"
            onClick={handleTemplateVazio}
            style={{ zIndex: 9999, backgroundColor: "#f5f6f8" }}
          >
            <CImage src="/images/mais.png" alt="Mais" height={20} />
            <span className="text-dark">
              {temSelecionado ? "Criar com Referência" : "Criar Projeto"}
            </span>
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

            <div className="main-content-placeholder" style={{ minHeight: 420 }}>
              {renderMainContent()}
            </div>
          </div>
        </div>
        <div className="side right" />
      </CContainer>

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

export default Index;
