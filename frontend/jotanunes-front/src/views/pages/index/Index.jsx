import React, { useEffect, useState } from "react"; //
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CForm,
  CFormSelect,
  CHeader,
  CImage,
  CContainer,
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
  CSpinner,
} from "@coreui/react";
import './Index-style.css';

import { obras } from "../../../apiClient";

const Index = () => {
  const navigate = useNavigate();

  const [obrasLista, setObrasLista] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // ID da obra selecionada como referência (somente uma pode estar marcada)
  const [selectedRefId, setSelectedRefId] = useState(null);
  // Filtro de status selecionado (null = todos, ou 'red'/'orange'/'blue'/'green')
  const [filtroStatus, setFiltroStatus] = useState(null);

  // Mapeia o status da obra para a classe de cor do círculo
  const getStatusClass = (statusRaw) => {
    if (!statusRaw) return 'orange'; // padrão caso não venha status
    const status = statusRaw
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\u0300-\u036f/g, ''); // remove acentos

    switch (true) {
      case /recusado/.test(status):
        return 'red';
      case /analise|em_analise|em analise/.test(status):
        return 'blue';
      case /nao finalizado|nao_finalizado|pendente|incompleto/.test(status):
        return 'orange'; // amarelo (classe existente orange)
      case /finalizado|concluido/.test(status):
        return 'green';
      default:
        return 'orange';
    }
  };

  // Texto amigável para título/tooltip do círculo (opcional)
  const getStatusLabel = (statusRaw) => {
    if (!statusRaw) return 'Status não definido';
    const s = statusRaw.toString().toLowerCase();
    if (s.includes('recus')) return 'Recusado';
    if (s.includes('anal')) return 'Em análise';
    if (s.includes('finaliz') && !s.includes('nao')) return 'Finalizado';
    if (s.includes('nao') || s.includes('pend') || s.includes('incompleto')) return 'Não Finalizado';
    return statusRaw;
  };

  const getStatusPriority = (statusClass) => {
    const priorities = {
      'red': 1,  
      'orange': 2,
      'blue': 3,    
      'green': 4    
    };
    return priorities[statusClass] || 5; // fallback para status desconhecido
  };

  const handleTemplateVazio = () => {
    // Se existe referência selecionada, inclui na navegação como query param
    if (selectedRefId) {
      navigate(`/projeto?referencia=${selectedRefId}`)
    } else {
      navigate('/projeto')
    }
  }

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
      <div className="containerObras">
        {obrasLista
          .filter((obra) => {
            // Se não há filtro, mostra todas
            if (!filtroStatus) return true;
            // Filtra pela classe de status
            return getStatusClass(obra.status) === filtroStatus;
          })
          .sort((a, b) => getStatusPriority(getStatusClass(a.status)) - getStatusPriority(getStatusClass(b.status)))
          .map((obra) => (
          <div key={obra.id} className="obraItem">
            <CButton className="abrirProjeto_botao" onClick={() => navigate(`/projeto/${obra.id}`)}>
              Abrir Projeto
            </CButton>
            <CCardTitle className="tituloProjeto">{obra.nome || `Obra ID: ${obra.id}`}
            </CCardTitle>
            <CCardText className="localizacaoProjeto">
              {obra.cidade && obra.estado ? `${obra.cidade} - ${obra.estado}` : 'Localização não definida'}
            </CCardText>
            <div className="selecionar-referencia_container">
              <input
                className="selecionar-referencia"
                type="checkbox"
                checked={selectedRefId === obra.id}
                onChange={() => setSelectedRefId(selectedRefId === obra.id ? null : obra.id)}
                aria-label={`Usar ${obra.nome || 'esta obra'} como referência`}
              />
            </div>
            <div className="statusProjeto">
              <div
              className={`circle ${getStatusClass(obra.status)}`}
              title={getStatusLabel(obra.status)}
              aria-label={`Status: ${getStatusLabel(obra.status)}`}
              />
            </div>
          </div>
        ))}
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
        <div className="botao_criarProjeto">
          <CButton
            color="light"
            className="text-danger fw-bold d-flex align-items-center gap-2 border-0"
            onClick={handleTemplateVazio}
            style={{ zIndex: 9999, backgroundColor: "#f5f6f8" }}
          >
            <CImage src="/images/mais.png" alt="Mais" height={20} />
            <span className="text-dark">{selectedRefId ? 'Criar Com Referência' : 'Criar Projeto'}</span>
          </CButton>
        </div>

        <div className="barraPesquisa">
          <input className="form-control" placeholder="Pesquisar" />
        </div>

        <div className="d-flex align-items-center gap-2">
          <div 
            className={`circle red ${filtroStatus === 'red' ? 'active-filter' : ''}`}
            onClick={() => setFiltroStatus(filtroStatus === 'red' ? null : 'red')}
            style={{ cursor: 'pointer' }}
            title="Filtrar por Recusado"
          ></div>
          <div 
            className={`circle orange ${filtroStatus === 'orange' ? 'active-filter' : ''}`}
            onClick={() => setFiltroStatus(filtroStatus === 'orange' ? null : 'orange')}
            style={{ cursor: 'pointer' }}
            title="Filtrar por Não Finalizado"
          ></div>
          <div 
            className={`circle blue ${filtroStatus === 'blue' ? 'active-filter' : ''}`}
            onClick={() => setFiltroStatus(filtroStatus === 'blue' ? null : 'blue')}
            style={{ cursor: 'pointer' }}
            title="Filtrar por Em Análise"
          ></div>
          <div 
            className={`circle green ${filtroStatus === 'green' ? 'active-filter' : ''}`}
            onClick={() => setFiltroStatus(filtroStatus === 'green' ? null : 'green')}
            style={{ cursor: 'pointer' }}
            title="Filtrar por Finalizado"
          ></div>
          <div className="filter">⚲</div>
        </div>
      </CHeader>

      {/* Conteúdo principal */}
      <CContainer fluid className="conteudoPrincipal">
        <div className="ladoEsquerdo"/>
        <div className="centro">
          <div className="header2">
            <span className="spanTitulo">Editor de Especificações Técnicas</span>
            <div className="filtros">
              <CForm className="d-flex gap-3 align-items-center">
                <CFormSelect style={{ width: "200px" }}>
                  <option>Estado</option>
                </CFormSelect>
                <CFormSelect style={{ width: "200px" }}>
                  <option>Cidade</option>
                </CFormSelect>
              </CForm>
            </div>
          </div>
          <div className="main-content-placeholder" style={{ minHeight: 420 }}>
            {/* 7. Chama a função de renderização */}
            {renderMainContent()}
          </div>

        </div>
        <div className="ladoDireito"/>
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

export default Index
