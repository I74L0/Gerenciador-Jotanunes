import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CBadge,
  CButton,
  CFormInput,
  CFormSelect,
  CImage,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilArrowRight, cilUser } from '@coreui/icons'
import './Index-style.css'
import { obras, handleLogout, attemptRefresh, getUser } from '../../../api'

const Index = () => {
  const navigate = useNavigate()

  const [obrasLista, setObrasLista] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // REFERÊNCIA
  const [selectedRefId, setSelectedRefId] = useState(null)

  // FILTROS (Status, Estado, Cidade)
  const [filtroStatus, setFiltroStatus] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroCidade, setFiltroCidade] = useState('')

  // PERFIL
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const handleVerPerfil = () => navigate('/perfil')

  const [permissoes, setPermissoes] = useState(null)
  const [usuario, setUsuario] = useState({ username: '' })
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

    fetch('/api/me/', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    })
      .then((res) => res.json())
      .then((data) => setPermissoes(data))
      .catch((err) => console.error(err))
  }, [])

  // Função para pegar o nome do usuário
  useEffect(() => {
    const token = localStorage.getItem('accessToken')

    getUser(token)
      .then((data) => setUsuario({ username: data.username }))
      .catch((err) => console.error(err))
  }, [])

  const podeCriarProjeto = permissoes?.is_superuser || permissoes?.is_criador
  const podeAdministrar = permissoes?.is_superuser

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
        await attemptRefresh()
        const response = await obras.list()
        setObrasLista(response.data)
      } catch (error) {
        setError('Falha ao carregar as obras. Tente novamente.')
      } finally {
        setIsLoading(false)
      }
    }

    carregarObras()
  }, [])

  // --- LÓGICA PARA POPULAR OS DROPDOWNS ---
  // Extrai lista única de estados
  const uniqueStates = [...new Set(obrasLista.map((o) => o.estado).filter(Boolean))].sort()

  // Extrai lista única de cidades (se um estado estiver selecionado, mostra apenas cidades daquele estado)
  const uniqueCities = [
    ...new Set(
      obrasLista
        .filter((o) => !filtroEstado || o.estado === filtroEstado)
        .map((o) => o.cidade)
        .filter(Boolean),
    ),
  ].sort()

  // --- LÓGICA DE FILTRAGEM ATUALIZADA ---
  const filtrarObras = () => {
    const termo = normalizeText(searchTerm)
    const estadoSelecionado = normalizeText(filtroEstado)
    const cidadeSelecionada = normalizeText(filtroCidade)

    return obrasLista.filter((obra) => {
      const nome = normalizeText(obra.nome || '')
      const cidade = normalizeText(obra.cidade || '')
      const estado = normalizeText(obra.estado || '')

      // 1. Pesquisa por NOME
      const matchTermo = termo === '' || nome.includes(termo)

      // 2. Filtro por ESTADO
      const matchEstado = !filtroEstado || estado === estadoSelecionado

      // 3. Filtro por CIDADE
      const matchCidade = !filtroCidade || cidade === cidadeSelecionada

      // 4. Filtro por STATUS (mantendo a lógica existente)
      const matchStatus = !filtroStatus || getStatusClass(obra.status) === filtroStatus

      return matchTermo && matchEstado && matchCidade && matchStatus
    })
  }

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className="idx-state">
          <CSpinner color="dark" />
          <span>Carregando obras...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="idx-state idx-state--error">
          {error}
        </div>
      )
    }

    const obrasFiltradas = filtrarObras()

    if (obrasFiltradas.length === 0) {
      return (
        <div className="idx-state">
          <p>Nenhuma obra encontrada com os filtros atuais.</p>
        </div>
      )
    }

    return (
      <div className="idx-obras-list">
        {obrasFiltradas
          .sort(
            (a, b) =>
              getStatusPriority(getStatusClass(a.status)) -
              getStatusPriority(getStatusClass(b.status)),
          )
          .map((obra) => (
            <div key={obra.id} className="idx-obra-card">
              {/* Botão Abrir */}
              <div className="idx-obra-card__open">
                <CButton
                  color="dark"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/projeto/${obra.id}`)}
                >
                  <CIcon icon={cilArrowRight} size="sm" className="idx-open-icon" />
                  <span className="ms-1">Abrir</span>
                </CButton>
              </div>

              {/* Nome e localização */}
              <div className="idx-obra-card__info">
                <h6 className="idx-obra-card__name">
                  {obra.nome || `Obra ID: ${obra.id}`}
                </h6>
                <p className="idx-obra-card__location">
                  {obra.cidade && obra.estado
                    ? `${obra.cidade} – ${obra.estado}`
                    : 'Localização não definida'}
                </p>
              </div>

              {/* Checkbox referência */}
              {podeCriarProjeto && (
                <div className="idx-obra-card__ref">
                  <input
                    className="selecionar-referencia"
                    type="checkbox"
                    checked={selectedRefId === obra.id}
                    onChange={() => setSelectedRefId(selectedRefId === obra.id ? null : obra.id)}
                  />
                </div>
              )}

              {/* Status Badge */}
              <div className="idx-obra-card__status">
                <CBadge
                  className={`idx-badge--${getStatusClass(obra.status)}`}
                  shape="rounded-pill"
                >
                  {getStatusLabel(obra.status)}
                </CBadge>
              </div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <div className="idx-page">

      {/* ══════════ TOP BAR ══════════ */}
      <header className="idx-topbar">
        <div className="idx-topbar__logo">
          <img src="/images/Logo Vermelha.png" alt="JotaNunes" />
        </div>

        <div className="idx-topbar__user">
          <span className="idx-topbar__username">{usuario.username}</span>

          <div
            className="idx-topbar__avatar"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <CIcon icon={cilUser} size="sm" />
          </div>

          {/* Menu de perfil */}
          {showProfileMenu && (
            <div className="idx-profile-menu">
              <button onClick={handleVerPerfil} className="idx-profile-menu__btn">
                Ver Perfil
              </button>
              {podeAdministrar && (
                <button
                  onClick={() => (window.location.href = '/admin/')}
                  className="idx-profile-menu__btn"
                >
                  Administrador
                </button>
              )}
              <button
                onClick={handleLogout}
                className="idx-profile-menu__btn idx-profile-menu__btn--danger"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ══════════ TOOLBAR ══════════ */}
      <div className="idx-toolbar">

        {/* Criar Projeto */}
        {podeCriarProjeto && (
          <CButton color="danger" size="sm" onClick={handleTemplateVazio}>
            <CIcon icon={cilPlus} size="sm" />
            <span className="ms-1 idx-toolbar__create-text">
              {selectedRefId ? 'Criar Com Referência' : 'Criar Projeto'}
            </span>
          </CButton>
        )}

        {/* Pesquisa */}
        <div className="idx-toolbar__search">
          <CFormInput
            placeholder="Pesquisar por nome da obra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status pills */}
        <div className="idx-status-filters">
          <div
            className={`idx-status-pill red ${filtroStatus === 'red' ? 'active-filter' : ''}`}
            onClick={() => setFiltroStatus(filtroStatus === 'red' ? null : 'red')}
            title="Recusado"
          />
          <div
            className={`idx-status-pill orange ${filtroStatus === 'orange' ? 'active-filter' : ''}`}
            onClick={() => setFiltroStatus(filtroStatus === 'orange' ? null : 'orange')}
            title="Não Finalizado"
          />
          <div
            className={`idx-status-pill blue ${filtroStatus === 'blue' ? 'active-filter' : ''}`}
            onClick={() => setFiltroStatus(filtroStatus === 'blue' ? null : 'blue')}
            title="Em análise"
          />
          <div
            className={`idx-status-pill green ${filtroStatus === 'green' ? 'active-filter' : ''}`}
            onClick={() => setFiltroStatus(filtroStatus === 'green' ? null : 'green')}
            title="Finalizado"
          />
        </div>

        {/* Filtros de localização */}
        <div className="idx-toolbar__filters">
          <CFormSelect
            size="sm"
            value={filtroEstado}
            onChange={(e) => {
              setFiltroEstado(e.target.value)
              setFiltroCidade('') // Reseta cidade se mudar o estado
            }}
          >
            <option value="">Todos os Estados</option>
            {uniqueStates.map((uf, index) => (
              <option key={index} value={uf}>
                {uf}
              </option>
            ))}
          </CFormSelect>

          <CFormSelect
            size="sm"
            value={filtroCidade}
            onChange={(e) => setFiltroCidade(e.target.value)}
            disabled={!uniqueCities.length && !filtroCidade} // Desabilita se não houver cidades
          >
            <option value="">Todas as Cidades</option>
            {uniqueCities.map((city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            ))}
          </CFormSelect>
        </div>
      </div>

      {/* ══════════ CONTEÚDO PRINCIPAL ══════════ */}
      <main className="idx-content">
        <h5 className="idx-content__title">Editor de Especificações Técnicas</h5>
        {renderMainContent()}
      </main>

      {/* ══════════ FOOTER / LEGENDA ══════════ */}
      <footer className="idx-footer">
        <div className="idx-legend">
          <div className="idx-legend__item">
            <div className="idx-legend__dot red" />
            <span>Recusado</span>
          </div>
          <div className="idx-legend__item">
            <div className="idx-legend__dot blue" />
            <span>Em análise</span>
          </div>
          <div className="idx-legend__item">
            <div className="idx-legend__dot orange" />
            <span>Não Finalizado</span>
          </div>
          <div className="idx-legend__item">
            <div className="idx-legend__dot green" />
            <span>Finalizado</span>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default Index
