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
import { obras, handleLogout, ambientes, perfil, getTemplate, itens } from '../../../api'

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
  const [userRole, setUserRole] = useState(null)
  const [showStatus, setShowStatus] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const userIconRef = useRef(null)
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 })
  
  useEffect(() => {
    if (!showProfileMenu) return
  
    const update = () => {
      const rect = userIconRef.current?.getBoundingClientRect()
      if (rect) {
        const menuWidth = 160
        const left = Math.max(8, rect.right - menuWidth + window.scrollX)
        const top = rect.bottom + window.scrollY + 6
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


  useEffect(() => {
    let mounted = true
    const fetchRole = async () => {
      try {
        const res = await perfil.get()
        const role =
          res && res.data && (res.data.role || (res.data.user && res.data.user.role))
            ? String(res.data.role || res.data.user.role).toLowerCase()
            : null
        if (mounted && role) {
          setUserRole(role)
          return
        }
      } catch (err) {}
    }

    fetchRole()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const normalizeAmbientes = (rawAmbientes = []) => {
      return rawAmbientes.map((a, index) => {
        const itensRaw = Array.isArray(a.itens) ? a.itens : []
        const itens = itensRaw.map((it) => {
          if (!it) return { item: '', descricao: '', status: false }
          const nome = it.nome ?? it.item ?? it.name ?? ''
          const descricoesArr = Array.isArray(it.descricoes)
            ? it.descricoes
            : Array.isArray(it.descricao)
              ? it.descricao
              : []
          const descricao = descricoesArr.join('; ')
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

          setPrefacioData({
            nome: dadosObra.nome || '',
            estado: dadosObra.estado || '',
            cidade: dadosObra.cidade || '',
            texto: dadosObra.texto_prefacio || '',
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
          console.log('Materiais normalizados:', materiaisNormalizados)
          setMaterialData(materiaisNormalizados)
          setObservacoesData({ observacao_final: dadosRef.observacao_final || '' })
        } else {
          const templateData = await getTemplate()
          console.log("template:", templateData)
          const pref = templateData.prefacioData || { nome: '', estado: '', cidade: '', texto: '' }
          setPrefacioData(pref)

          const unidadesRaw = templateData.unidadesData || []
          const areacomumRaw = templateData.areacomumData || []
          const materialRaw = templateData.materialData || []
          const obsTemplate = templateData.observacoesData && templateData.observacoesData[0]

          const unidadesNorm = normalizeAmbientes(unidadesRaw)
          const areacomumNorm = normalizeAmbientes(areacomumRaw)

          setUnidadesData(unidadesNorm)
          setAreacomumData(areacomumNorm)
          setMaterialData(materialRaw || [])
          setObservacoesData({ observacao_final: obsTemplate ? obsTemplate.observacao : '' })
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

    console.log("unidadesData:", unidadesData)

    const MapUnidades = unidadesData.map((unidade) => ({
      nome: unidade.nome,
      itens: [
        {
          nome: 'Piso',
          descricoes: ['Borda reta polida']
        },
      ],
      tipo: 'PRIVATIVO',
    }))

    const MapAreaComum = areacomumData.map((area) => ({
      nome: area.nome,
      itens: [{
        nome: "Parede",
        descricoes: ["Acabamento fosco", "LED 4000K"]
      }],
      tipo: 'COMUM',
    }))

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
      status: 'NAO_FINALIZADO',
      ambientes: ambientes,
      materiais: materialData
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
      status: 'EM_ANALISE',
      ambientes: ambientes,
      materiais: materialData
    }

    console.log('Salvando dados do projeto...', dadosParaSalvar)

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
        navigate('/index')
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
    <div className="body__body">
      <header className="header">
        <div className="header__header">
          <div className="header__header__logo">
            <CImage src="/images/Logo Vermelha.png" alt="JotaNunes Logo" height={48} />
          </div>
          <div className="usuario_container position-relative">
            <span>Usuário</span>

            {/* ÍCONE */}
            <div
              className="user-icon"
              ref={userIconRef}
              onClick={() => {
                const opening = !showProfileMenu
                setShowProfileMenu(opening)
                if (opening) {
                  // calcula posição do menu ao abrir
                  const rect = userIconRef.current?.getBoundingClientRect()
                  if (rect) {
                    // largura do menu definida no CSS (~160px)
                    const menuWidth = 160
                    const left = Math.max(8, rect.right - menuWidth + window.scrollX)
                    const top = rect.bottom + window.scrollY + 6
                    setMenuCoords({ top, left })
                  }
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              👤
            </div>
          </div>
          {/* Perfil: renderizado via portal para escapar de stacking contexts */}
          {showProfileMenu && userIconRef.current && createPortal(
            <div
              className="profile-menu"
              style={{
                position: 'absolute',
                top: `${menuCoords.top}px`,
                left: `${menuCoords.left}px`,
                zIndex: 200000,
              }}
            >
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
          , document.body)}
        </div>
        <hr />
        <ul className="header__menu">
          <li className="header__menu__item" onClick={protectiveSave}>
            Sair
          </li>
          <MenuTabs activeIndex={activeTab} onChange={setActiveTab} />
          <li className="header__menu__item" onClick={handleSave} disabled={isSaving}>
            {'Enviar'}
          </li>
        </ul>
      </header>

      {saveError && (
        <CContainer className="d-flex w-75 p-2 bg-danger-light text-danger border rounded z-3">
          Erro: {saveError}
        </CContainer>
      )}

      <section className="content background">
        {activeTab === 0 && <CardPrefacio prefacio={prefacioData} setPrefacio={setPrefacioData} />}
        {activeTab === 1 && (
          <CardUnidades
            ambientes={unidadesData}
            setAmbientes={setUnidadesData}
            showStatus={showStatus}
          />
        )}
        {activeTab === 2 && (
          <CardAreaComum ambientes={areacomumData} setAmbientes={setAreacomumData} />
        )}
        {activeTab === 3 && (
          <CardMateriais materiais={materialData} setMateriais={setMaterialData} />
        )}
        {activeTab === 4 && (
          <CardObservacoes observacao_final={observacoesData} setObservacoes={setObservacoesData} />
        )}
      </section>
    </div>
  )
}

export default Projeto
