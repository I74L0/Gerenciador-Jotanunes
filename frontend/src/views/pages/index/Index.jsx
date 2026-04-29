import React, { useEffect, useState } from 'react'
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
} from '@coreui/react'
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
          <p>Nenhuma obra encontrada com os filtros atuais.</p>
        </div>
      )
    }

    return (
      <div className="containerObras">
        {obrasFiltradas
          .sort(
            (a, b) =>
              getStatusPriority(getStatusClass(a.status)) -
              getStatusPriority(getStatusClass(b.status)),
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
          <span>{usuario.username}</span>

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
              {podeAdministrar && (
                <button
                  onClick={() => (window.location.href = 'http://127.0.0.1:8000/admin/')}
                  className="profile-btn"
                >
                  Administrador
                </button>
              )}
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

        {/* 🔍 BARRA DE PESQUISA: AGORA SÓ POR NOME */}
        <div className="barraPesquisa">
          <input
            className="form-control"
            placeholder="Pesquisar por nome da obra"
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

          {/* DIV FILTROS: AGORA FUNCIONAIS */}
          <div className="filtros">
            <CFormSelect
              style={{ width: '200px' }}
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
              style={{ width: '200px' }}
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
}

export default Index
