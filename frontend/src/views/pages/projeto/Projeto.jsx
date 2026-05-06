import axios from 'axios'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import {
  CImage,
  CHeader,
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CContainer,
  CRow,
  CHeaderText,
  CButton,
  useColorModes,
  CSpinner,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import CardPrefacio from './CardPrefacio'
import CardUnidades from './CardUnidades'
import CardAreaComum from './CardAreaComum'
import CardMateriais from './CardMateriais'
import CardObservacoes from './CardObservacoes'
import MenuTabs from './MenuTabs'
import 'src/views/pages/projeto/Projeto-style.scss'
import { obras, handleLogout, ambientes, perfil, getTemplate, getUser } from '../../../api'

const Projeto = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const referenciaId = searchParams.get('referencia')

  const [activeTab, setActiveTab] = useState(0)
  const [prefacioData, setPrefacioData] = useState({ nome: '', estado: '', cidade: '', texto: '' })
  const [unidadesData, setUnidadesData] = useState([])
  const [areacomumData, setAreacomumData] = useState([])
  const [materialData, setMaterialData] = useState([])
  const [observacoesData, setObservacoesData] = useState({ observacao_final: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [showStatus, setShowStatus] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 })
  const [usuario, setUsuario] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  })
  const userIconRef = useRef(null)

  useEffect(() => {
    if (!showProfileMenu) return

    const update = () => {
      const rect = userIconRef.current?.getBoundingClientRect()
      if (rect) {
        const menuWidth = 160
        const left = Math.max(8, rect.right - menuWidth)
        const top = rect.bottom + 6
        setMenuCoords({ top, left })
      }
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)

    const onDocClick = (e) => {
      if (userIconRef.current && !userIconRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', onDocClick)

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      document.removeEventListener('mousedown', onDocClick)
    }
  }, [showProfileMenu])
  const handleVerPerfil = () => navigate('/perfil')
  const [permissoes, setPermissoes] = useState(null)

  const podeAdministrar = permissoes?.is_superuser
  const podeEditar = permissoes?.is_superuser || permissoes?.is_criador
  const podeGestionar = permissoes?.is_gestor

  useEffect(() => {
    const normalizeAmbientes = (rawAmbientes = []) => {
      return rawAmbientes.map((a, index) => {
        const itensRaw = Array.isArray(a.itens) ? a.itens : []

        const itens = itensRaw.map((it) => {
          if (!it) return { item: '', descricao: '', status: false }

          // 1. Resolve o Nome (prioriza 'nome', fallback para 'item')
          const nome = it.nome ?? it.item ?? it.name ?? ''

          // 2. Resolve a Descrição (CORREÇÃO AQUI)
          // Pega o valor bruto de descricao ou descricoes
          const rawDesc = it.descricao ?? it.descricoes

          let descricao = ''
          if (Array.isArray(rawDesc)) {
            // Se for array (antigo), junta com ponto e vírgula
            descricao = rawDesc.join('; ')
          } else if (typeof rawDesc === 'string') {
            // Se for string (novo), usa direto
            descricao = rawDesc
          }

          // Mantive status como false conforme seu código, mas se quiser
          // que os itens venham marcados por padrão, mude para true.
          return { item: nome, descricao, status: false }
        })

        return {
          ...a,
          id: a.id ?? `${index + 1}`,
          nome: a.nome ?? a.name ?? '',
          tipo: (a.tipo ?? '').toUpperCase(),
          itens,
          editando: !!a.editando,
          aberto: typeof a.aberto === 'boolean' ? a.aberto : false,
        }
      })
    }

    const carregarDadosDoProjeto = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem('accessToken')

        const permissaoRes = await fetch('http://localhost:8000/api/me/', {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        })

        if (!permissaoRes.ok) throw new Error('Erro ao buscar permissões')

        const dadosUsuario = await getUser(token)
        setUsuario({
          username: dadosUsuario.username,
          email: dadosUsuario.email,
          first_name: dadosUsuario.first_name,
          last_name: dadosUsuario.last_name,
        })

        const dadosPermissoes = await permissaoRes.json()
        setPermissoes({
          is_superuser: dadosPermissoes.is_superuser,
          is_gestor: dadosPermissoes.is_gestor,
          is_criador: dadosPermissoes.is_criador,
        })

        if (id) {
          const [obraRes, ambientesRes] = await Promise.all([
            obras.retrieve(id),
            ambientes.list(id),
          ])
          const dadosObra = obraRes.data
          console.log('Dados da obra carregados:', dadosObra)

          setShowStatus(dadosObra.status)

          setPrefacioData({
            nome: dadosObra.nome || '',
            estado: dadosObra.estado || '',
            cidade: dadosObra.cidade || '',
            texto: dadosObra.texto_prefacio || '',
            observacao_gestor: dadosObra.observacao_gestor || '',
          })

          const rawAmbientes =
            (ambientesRes && (ambientesRes.data || ambientesRes.results || [])) || []
          const todosAmbientes = normalizeAmbientes(rawAmbientes)

          console.log(
            'todosAmbientes privativo',
            todosAmbientes.filter((a) => a.tipo === 'PRIVATIVO'),
          )
          console.log(
            'dados.ambientes COMUM',
            todosAmbientes.filter((a) => a.tipo === 'COMUM'),
          )

          // usa os ambientes normalizados
          setUnidadesData(todosAmbientes.filter((a) => a.tipo === 'PRIVATIVO'))
          setAreacomumData(todosAmbientes.filter((a) => a.tipo === 'COMUM'))

          const normalizeMateriais = (rawMateriais = []) => {
            return rawMateriais.map((m) => {
              // 1. Pega o nome do item. Se for { nome: "..." }, pega o nome. Senão, assume que é string.
              const nomeItem =
                typeof m.item === 'object' && m.item !== null ? m.item.nome : m.item || ''

              // 2. Pega as marcas. Se for array de objetos { nome: "..." }, extrai o nome. Senão, mantém como está.
              const marcasArr = Array.isArray(m.marcas)
                ? m.marcas
                  .map((marca) =>
                    typeof marca === 'object' && marca !== null ? marca.nome : marca,
                  )
                  .filter(Boolean)
                : []

              return {
                item: nomeItem, // AGORA É STRING
                marcas: marcasArr, // AGORA É ARRAY DE STRINGS
              }
            })
          }
          const materiaisNormalizados = normalizeMateriais(dadosObra.materiais || [])
          console.log('Materiais normalizados:', materiaisNormalizados)
          setMaterialData(materiaisNormalizados)
          setObservacoesData({ observacao_final: dadosObra.observacao_final || '' })
        } else if (referenciaId) {
          const [obraRes, ambientesRes] = await Promise.all([
            obras.retrieve(referenciaId),
            ambientes.list(referenciaId),
          ])
          const dadosRef = obraRes.data

          setPrefacioData({
            nome: `${dadosRef.nome} (Cópia)`,
            estado: dadosRef.estado || '',
            cidade: dadosRef.cidade || '',
            texto: dadosRef.texto_prefacio || '',
            observacao_gestor: dadosObra.observacao_gestor || '',
          })

          const rawAmbientes =
            (ambientesRes && (ambientesRes.data || ambientesRes.results || [])) || []
          const todosAmbientes = normalizeAmbientes(rawAmbientes)

          setUnidadesData(todosAmbientes.filter((a) => a.tipo === 'PRIVATIVO'))
          setAreacomumData(todosAmbientes.filter((a) => a.tipo === 'COMUM'))

          const normalizeMateriais = (rawMateriais = []) => {
            return rawMateriais.map((m) => {
              // 1. Pega o nome do item. Se for { nome: "..." }, pega o nome. Senão, assume que é string.
              const nomeItem =
                typeof m.item === 'object' && m.item !== null ? m.item.nome : m.item || ''

              // 2. Pega as marcas. Se for array de objetos { nome: "..." }, extrai o nome. Senão, mantém como está.
              const marcasArr = Array.isArray(m.marcas)
                ? m.marcas
                  .map((marca) =>
                    typeof marca === 'object' && marca !== null ? marca.nome : marca,
                  )
                  .filter(Boolean)
                : []

              return {
                item: nomeItem, // AGORA É STRING
                marcas: marcasArr, // AGORA É ARRAY DE STRINGS
              }
            })
          }
          const materiaisNormalizados = normalizeMateriais(dadosObra.materiais || [])
          setMaterialData(materiaisNormalizados)
          setObservacoesData({ observacao_final: dadosRef.observacao_final || '' })
        } else {
          const templateData = await getTemplate()
          console.log('template:', templateData)

          const pref = {
            nome: templateData.nome || '',
            estado: templateData.estado || '',
            cidade: templateData.cidade || '',
            texto: templateData.texto_prefacio || '',
          }
          setPrefacioData(pref)

          const todosAmbientes = templateData.ambientes || []

          const unidadesRaw = todosAmbientes.filter((a) => a.tipo === 'PRIVATIVO')
          const areacomumRaw = todosAmbientes.filter((a) => a.tipo === 'COMUM')

          const unidadesNorm = normalizeAmbientes(unidadesRaw)
          const areacomumNorm = normalizeAmbientes(areacomumRaw)

          setUnidadesData(unidadesNorm)
          setAreacomumData(areacomumNorm)

          const materialRaw = templateData.materiais || []
          setMaterialData(materialRaw)

          setObservacoesData({
            observacao_final: templateData.observacao_final || '',
          })
        }
      } catch (error) {
        console.error('Falha ao carregar dados do projeto:', error)
        setSaveError('Não foi possível carregar os dados.')
      } finally {
        setIsLoading(false)
      }
    }

    carregarDadosDoProjeto()
  }, [id, referenciaId])

  const validarEstadoCidade = () => {
    if (
      !prefacioData.estado ||
      !prefacioData.estado.toString().trim() ||
      !prefacioData.cidade ||
      !prefacioData.cidade.toString().trim()
    ) {
      setSaveError('Os campos Estado e Cidade não podem ficar vazios.')
      setActiveTab(0)
      return false
    }
    return true
  }

  const getMappedAmbientes = () => {
    // Adicionando console.log para fins de depuração (debug)
    console.log('unidadesData:', unidadesData)
    console.log('areacomumData:', areacomumData)

    const mapItens = (itensRaw = []) =>
      (Array.isArray(itensRaw) ? itensRaw : []).map((it) => {
        if (!it) return { nome: '', descricao: '' } // Retorno no novo formato

        const nome = it.nome ?? it.item ?? it.name ?? ''

        // 1. Resolve a Descrição (usando a lógica robusta da correção anterior)
        const rawDesc = it.descricao ?? it.descricoes
        let descricao = ''

        if (Array.isArray(rawDesc)) {
          // Se for array (formato antigo/misto), junta em uma string única (separando por '; ')
          descricao = rawDesc.join('; ')
        } else if (typeof rawDesc === 'string') {
          // Se for string (novo formato), usa direto
          descricao = rawDesc
        } else {
          // Se o formato antigo de string que precisa ser splitado ainda existir no source (como no seu código original)
          // A sua lógica original fazia o split:
          if (typeof it.descricao === 'string' && it.descricao.trim()) {
            descricao = it.descricao // Se você mantiver a correção de dados na normalização, pode usar direto
          }
        }

        // Retorna o item no formato solicitado: { "nome": "string", "descricao": "string" }
        return { nome, descricao }
      })

    // Mapeamento das Unidades (tipo: PRIVATIVO)
    const MapUnidades = (unidadesData || []).map((unidade) => ({
      nome: unidade.nome,
      tipo: 'PRIVATIVO',
      itens: mapItens(unidade.itens),
    }))

    // Mapeamento da Área Comum
    const MapAreaComum = (areacomumData || []).map((area) => ({
      nome: area.nome,
      tipo: 'COMUM',
      itens: mapItens(area.itens),
    }))

    // Retorna todos os ambientes juntos no formato final
    return [...MapUnidades, ...MapAreaComum]
  }

  const protectiveSave = async () => {
    if (!prefacioData.nome) {
      console.log('Nome do projeto ausente. Redirecionando sem salvar.')
      navigate('/index')
      return
    }

    if (!validarEstadoCidade()) {
      return
    }

    setIsSaving(true)
    setSaveError(null)

    const ambientes = getMappedAmbientes()

    const dadosParaSalvar = {
      nome: prefacioData.nome,
      estado: prefacioData.estado,
      cidade: prefacioData.cidade,
      texto_prefacio: prefacioData.texto,
      observacao_final: observacoesData.observacao_final,
      observacao_gestor: prefacioData.observacao_gestor,
      status: 'NAO_FINALIZADO',
      ambientes: ambientes,
      materiais: materialData,
    }

    console.log('Salvando dados do projeto antes de sair...', dadosParaSalvar)

    try {
      let response
      let statusTest
      if (id) {
        statusTest = (await obras.retrieve(id)).data
        if (statusTest.status == 'EM_ANALISE') {
          console.log('Projetos Em Analise não podem ser editados!')
          navigate('/index')
          return
        }
        response = await obras.partialUpdate(id, dadosParaSalvar)
        console.log('Projeto atualizado!', response.data)
        navigate('/index')
      } else {
        response = await obras.create(dadosParaSalvar)
        console.log('Novo projeto criado!', response.data)
        navigate('/index')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setSaveError(error.message || 'Falha ao salvar. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  // se o projeto estiver em análise, salva o objeto com status 'FINALIZADO', se não salva como 'EM_ANALISE'
  const handleSave = async () => {
    if (!validarEstadoCidade()) {
      return
    }

    setIsSaving(true)
    setSaveError(null)

    const ambientes = getMappedAmbientes()

    const dadosParaSalvar = {
      nome: prefacioData.nome,
      estado: prefacioData.estado,
      cidade: prefacioData.cidade,
      texto_prefacio: prefacioData.texto,
      observacao_final: observacoesData.observacao_final,
      observacao_gestor: prefacioData.observacao_gestor,
      status: showStatus === 'EM_ANALISE' ? 'FINALIZADO' : 'EM_ANALISE',
      ambientes: ambientes,
      materiais: materialData,
    }

    console.log('Salvando dados do projeto...', dadosParaSalvar)

    try {
      let response
      if (id) {
        response = await obras.partialUpdate(id, dadosParaSalvar)
        console.log('Projeto atualizado!', response.data)
        navigate(`/index`)
      } else {
        response = await obras.create(dadosParaSalvar)
        console.log('Novo projeto criado!', response.data)
        navigate(`/index`)
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setSaveError(error.message || 'Falha ao salvar. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <CSpinner color="primary" />
        <span className="ms-3">Carregando Projeto...</span>
      </div>
    )
  }

  return (
    <div className="prj-page">
      <header className="header">
        <div className="idx-topbar">
          <div className="idx-topbar__logo">
            <CImage src="/images/Logo Vermelha.png" alt="JotaNunes Logo" height={48} />
          </div>
          <div className="idx-topbar__user">
            <span className="idx-topbar__username">{usuario.username}</span>

            {/* ÍCONE */}
            <div
              className="idx-topbar__avatar"
              ref={userIconRef}
              onClick={() => {
                const opening = !showProfileMenu
                setShowProfileMenu(opening)
                if (opening) {
                  const rect = userIconRef.current?.getBoundingClientRect()
                  if (rect) {
                    const menuWidth = 160
                    // position:fixed é relativo à viewport — não somar scroll
                    const left = Math.max(8, rect.right - menuWidth)
                    const top = rect.bottom + 6
                    setMenuCoords({ top, left })
                  }
                }
              }}
            >
              <CIcon icon={cilUser} size="sm" />
            </div>
          </div>
          {/* Perfil: renderizado via portal para escapar de stacking contexts */}
          {showProfileMenu &&
            userIconRef.current &&
            createPortal(
              <div
                className="idx-profile-menu"
                style={{
                  position: 'fixed',
                  top: `${menuCoords.top}px`,
                  left: `${menuCoords.left}px`,
                  zIndex: 200000,
                }}
              >
                <button onClick={handleVerPerfil} className="idx-profile-menu__btn">
                  Ver Perfil
                </button>
                {podeAdministrar && (
                  <button
                    onClick={() => (window.location.href = 'http://127.0.0.1:8000/admin/')}
                    className="idx-profile-menu__btn"
                  >
                    Administrador
                  </button>
                )}
                <button onClick={handleLogout} className="idx-profile-menu__btn idx-profile-menu__btn--danger">
                  Sair
                </button>
              </div>,
              document.body,
            )}

        </div>
        <div className="prj-toolbar">
          <div className="prj-toolbar__tabs">
            <MenuTabs activeIndex={activeTab} onChange={setActiveTab} />
          </div>
          
          <div className="prj-toolbar__actions">
            <CButton color="dark" variant="ghost" onClick={protectiveSave} className="me-2">
              Voltar
            </CButton>
            <CButton color="danger" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <CSpinner size="sm" /> : (podeEditar ? 'Salvar Projeto' : 'Finalizar Avaliação')}
            </CButton>
          </div>
        </div>
      </header>

      {saveError && (
        <CContainer className="d-flex w-75 p-2 bg-danger-light text-danger border rounded z-3 mt-3">
          Erro: {saveError}
        </CContainer>
      )}

      <main className="prj-content">
        {activeTab === 0 && (
          <CardPrefacio
            prefacio={prefacioData}
            setPrefacio={setPrefacioData}
            statusProjeto={showStatus}
            podeEditar={podeEditar}
          />
        )}
        {activeTab === 1 && (
          <CardUnidades
            ambientes={unidadesData}
            setAmbientes={setUnidadesData}
            showStatus={showStatus}
            podeEditar={podeEditar}
            podeGestionar={podeGestionar}
          />
        )}
        {activeTab === 2 && (
          <CardAreaComum
            ambientes={areacomumData}
            setAmbientes={setAreacomumData}
            showStatus={showStatus}
            podeEditar={podeEditar}
            podeGestionar={podeGestionar}
          />
        )}
        {activeTab === 3 && (
          <CardMateriais
            materiais={materialData}
            setMateriais={setMaterialData}
            showStatus={showStatus}
            podeEditar={podeEditar}
            podeGestionar={podeGestionar}
          />
        )}
        {activeTab === 4 && (
          <CardObservacoes 
            observacao_final={observacoesData} 
            setObservacoes={setObservacoesData} 
            podeEditar={podeEditar} 
          />
        )}
      </main>
    </div>
  )
}

export default Projeto
