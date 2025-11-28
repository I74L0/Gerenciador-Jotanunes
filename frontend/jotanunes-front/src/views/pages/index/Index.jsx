import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCardTitle,
  CCardText,
  CForm,
  CFormSelect,
  CHeader,
  CImage,
  CContainer,
  CSpinner,
} from "@coreui/react";
import './Index-style.css';
import { obras, handleLogout, attemptRefresh } from '../../../api'

const Index = () => {
  const navigate = useNavigate()

  const [obrasLista, setObrasLista] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // REFERÊNCIA
  const [selectedRefId, setSelectedRefId] = useState(null)

  // FILTRO
  const [filtroStatus, setFiltroStatus] = useState(null)

  // PERFIL
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const handleVerPerfil = () => navigate('/perfil')

  const [permissoes, setPermissoes] = useState(null)

  // 🔍 Termo de pesquisa que agora filtra a lista principal
  const [searchTerm, setSearchTerm] = useState('')

  const normalizeText = (text) =>
    text
      ?.toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

  // Função para pegar o cargo do usuário
  useEffect(() => {
    const token = localStorage.getItem('accessToken')

    fetch('http://localhost:8000/api/me/', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    })
      .then((res) => res.json())
      .then((data) => setPermissoes(data))
      .catch((err) => console.error(err))
  }, [])

  const podeCriarProjeto = permissoes?.is_superuser || permissoes?.is_criador

  const getStatusClass = (statusRaw) => {
    if (!statusRaw) return 'orange'
    const status = normalizeText(statusRaw)

    switch (true) {
      case /recusado/.test(status):
        return 'red'
      case /analise|em_analise|em analise/.test(status):
        return 'blue'
      case /nao finalizado|nao_finalizado|pendente|incompleto/.test(status):
        return 'orange'
      case /finalizado|concluido/.test(status):
        return 'green'
      default:
        return 'orange'
    }
  }

  const getStatusLabel = (statusRaw) => {
    if (!statusRaw) return 'Status não definido'
    const s = normalizeText(statusRaw)
    if (s.includes('recus')) return 'Recusado'
    if (s.includes('anal')) return 'Em análise'
    if (s.includes('finaliz') && !s.includes('nao')) return 'Finalizado'
    if (s.includes('nao') || s.includes('pend') || s.includes('incompleto')) return 'Não Finalizado'
    return statusRaw
  }

  const getStatusPriority = (statusClass) => {
    const priorities = {
      red: 1,
      orange: 2,
      blue: 3,
      green: 4,
    }
    return priorities[statusClass] || 5
  }

  const handleTemplateVazio = () => {
    if (selectedRefId) {
      navigate(`/projeto?referencia=${selectedRefId}`)
    } else {
      navigate('/projeto')
    }
  }

  useEffect(() => {
    const carregarObras = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Tenta atualizar o token antes de fazer a requisição.
        // Se o token estiver expirado, `attemptRefresh` tentará obter um novo.
        // `attemptRefresh` é importado do seu arquivo `auth.js`.
        await attemptRefresh()

        const response = await obras.list()
        setObrasLista(response.data)
      } catch (error) {
        // Se `obras.list()` falhar (por exemplo, com 401 mesmo após o refresh
        // ter falhado), ele cai no erro. Seu código de API (não visível)
        // deve lidar com o 401 forçando um `handleLogout` se o `attemptRefresh`
        // retornar `null`.
        setError('Falha ao carregar as obras. Tente novamente.')
      } finally {
        setIsLoading(false)
      }
    }

    carregarObras()
  }, [])

  // 🔍 Agora a pesquisa filtra diretamente a lista principal
  const filtrarObras = () => {
    const termo = normalizeText(searchTerm)

    return obrasLista.filter((obra) => {
      const nome = normalizeText(obra.nome || '')
      const cidade = normalizeText(obra.cidade || '')
      const estado = normalizeText(obra.estado || '')

      const matchTermo =
        termo === "" ||
        nome.includes(termo) ||
        cidade.includes(termo) ||
        estado.includes(termo);

      const matchStatus =
      !filtroStatus || getStatusClass(obra.status) === filtroStatus;

      return matchTermo && matchStatus;
    });
  };

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className="d-flex justify-content-center align-items-center h-100">
          <CSpinner color="primary" />
          <span className="ms-2">Carregando obras...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="d-flex justify-content-center align-items-center h-100 text-danger">
          {error}
        </div>
      )
    }
    
    const obrasFiltradas = filtrarObras()
    
    if (obrasFiltradas.length === 0) {
      return (
        <div className="d-flex justify-content-center align-items-center h-100">
          <p>Nenhuma obra encontrada.</p>
        </div>
      )
    }

    return (
      <div className="containerObras">
        {obrasFiltradas
          .filter((obra) => {
            if (!filtroStatus) return true
            return getStatusClass(obra.status) === filtroStatus
          })
          .sort(
            (a, b) =>
              getStatusPriority(getStatusClass(a.status)) -
              getStatusPriority(getStatusClass(b.status))
          )
          .map((obra) => (
            <div key={obra.id} className="obraItem">
              <button
                className="abrirProjeto_botao"
                onClick={() => navigate(`/projeto/${obra.id}`)}
              >
                <p className="IconeAquivo">{'>'}</p>
                <p className="abrirProjeto_botao_texto">Abrir Projeto</p>
              </button>

              <h2 className="tituloProjeto">{obra.nome || `Obra ID: ${obra.id}`}</h2>

              <p className="localizacaoProjeto">
                {obra.cidade && obra.estado
                  ? `${obra.cidade} - ${obra.estado}`
                  : 'Localização não definida'}
              </p>

              {podeCriarProjeto && (
              <div className="selecionar-referencia_container">
                <input
                  className="selecionar-referencia"
                  type="checkbox"
                  checked={selectedRefId === obra.id}
                  onChange={() => setSelectedRefId(selectedRefId === obra.id ? null : obra.id)}
                />
              </div>
              )}
              <div className="statusProjeto">
                <div
                  className={`circle ${getStatusClass(obra.status)}`}
                  title={getStatusLabel(obra.status)}
                />
              </div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <div className="fundo">
      {/* ====== TOPBAR */}
      <header className="header_conteiner">
        <div className="logo">
          <img src="/images/Logo Vermelha.png" alt="Logo" height={45} width={150} />
        </div>

        <div className="usuario_container position-relative">
          <span>Usuário</span>

          {/* ÍCONE */}
          <div
            className="user-icon"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ cursor: 'pointer' }}
          >
            👤
          </div>

          {/* MENU DE PERFIL */}
          {showProfileMenu && (
            <div className="profile-menu">
              <button onClick={handleVerPerfil} className="profile-btn">
                Ver Perfil
              </button>
              <button onClick={handleLogout} className="profile-btn">
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      {/* SUBBAR */}
      <header className="header2_conteiner">
        {podeCriarProjeto && (
          <div className="botao_criarProjeto">
            <button
              className="text-danger fw-bold d-flex align-items-center gap-2 border-0"
              onClick={handleTemplateVazio}
              style={{ backgroundColor: '#f5f6f8' }}
            >
              <CImage src="/images/mais.png" alt="Mais" height={20} />
              <span className="text-dark">
                {selectedRefId ? 'Criar Com Referência' : 'Criar Projeto'}
              </span>
            </button>
          </div>
        )}

        {/* 🔍 Campo de pesquisa agora filtra direto a lista */}
        <div className="barraPesquisa">
          <input
            className="form-control"
            placeholder="Pesquisar obra, cidade ou estado"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bolinhasJuntas">
          <div
            className={`circle red ${filtroStatus === 'red' ? 'active-filter' : ''}`}
            onClick={() => setFiltroStatus(filtroStatus === 'red' ? null : 'red')}
          ></div>

          <div
            className={`circle orange ${filtroStatus === 'orange' ? 'active-filter' : ''}`}
            onClick={() => setFiltroStatus(filtroStatus === 'orange' ? null : 'orange')}
          ></div>

          <div
            className={`circle blue ${filtroStatus === 'blue' ? 'active-filter' : ''}`}
            onClick={() => setFiltroStatus(filtroStatus === 'blue' ? null : 'blue')}
          ></div>

          <div
            className={`circle green ${filtroStatus === 'green' ? 'active-filter' : ''}`}
            onClick={() => setFiltroStatus(filtroStatus === 'green' ? null : 'green')}
          ></div>

          <div className="filter">⚲</div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <section className="conteudoPrincipal">
        <div className="header3_conteiner">
          <span className="spanTitulo">Editor de Especificações Técnicas</span>
          <div className="filtros">
            <CFormSelect style={{ width: '200px' }}>
              <option>Estado</option>
            </CFormSelect>

            <CFormSelect style={{ width: '200px' }}>
              <option>Cidade</option>
            </CFormSelect>
          </div>
        </div>

        <div className="main-content-placeholder" style={{ minHeight: 420 }}>
          {renderMainContent()}
        </div>
      </section>

      {/* FOOTER */}
      <div className="footer">
        <div className="legendas_container">
          <div className="legend-item">
            <div className="legend-circle red"></div>Recusado
          </div>
          <div className="legend-item">
            <div className="legend-circle blue"></div>Em análise
          </div>
          <div className="legend-item">
            <div className="legend-circle orange"></div>Não Finalizado
          </div>
          <div className="legend-item">
            <div className="legend-circle green"></div>Finalizado
          </div>
        </div>
      </div>
    </div>
  )
};

export default Index;