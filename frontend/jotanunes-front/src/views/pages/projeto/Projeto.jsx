import { useState, useEffect } from 'react'
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
import avatar8 from 'src/assets/images/avatars/8.jpg'
import 'src/views/pages/projeto/Projeto-style.scss'
import { obras, ambientes, perfil, getTemplate, itens } from '../../../api'

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
  const [observacoesData, setObservacoesData] = useState({ observacoes: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [showStatus, setShowStatus] = useState(null)

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
    const carregarDadosDoProjeto = async () => {
      setIsLoading(true)
      try {
        if (id) {
          const [obraRes, ambientesRes] = await Promise.all([
            obras.retrieve(id),
            ambientes.list(id),
          ])
          const dadosObra = obraRes.data

          setPrefacioData({
            nome: dadosObra.nome || '',
            estado: dadosObra.estado || '',
            cidade: dadosObra.cidade || '',
            texto: dadosObra.texto_prefacio || '',
          })

          const todosAmbientes = ambientesRes.data || []
          setUnidadesData(todosAmbientes.filter((a) => a.tipo === 'UNIDADE'))
          setAreacomumData(todosAmbientes.filter((a) => a.tipo === 'AREA_COMUM'))
          setMaterialData(dadosObra.materiais || [])
          setObservacoesData(dadosObra.observacoes || '')
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

          const todosAmbientes = ambientesRes.data || []
          setUnidadesData(todosAmbientes.filter((a) => a.tipo === 'UNIDADE'))
          setAreacomumData(todosAmbientes.filter((a) => a.tipo === 'AREA_COMUM'))
          setMaterialData(dadosRef.materiais || [])
          setObservacoesData(dadosRef.observacoes || '')
        } else {
          const templateData = await getTemplate()
          setPrefacioData(
            templateData.prefacioData || { nome: '', estado: '', cidade: '', texto: '' },
          )
          setUnidadesData(templateData.unidadesData || [])
          setAreacomumData(templateData.areacomumData || [])
          setMaterialData(templateData.materialData || [])
          const obsTemplate = templateData.observacoesData && templateData.observacoesData[0]
          setObservacoesData({ observacoes: obsTemplate ? obsTemplate.observacao : '' })
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
    const MapUnidades = unidadesData.map((unidade) => ({
      nome: unidade.nome,
      itens: [],
      tipo: 'PRIVATIVO',
    }))

    const MapAreaComum = areacomumData.map((area) => ({
      nome: area.nome,
      itens: [],
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
      observacoes: observacoesData.observacoes,
      status: 'NAO_FINALIZADO',
      ambientes: ambientes
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
      observacoes: observacoesData.observacoes,
      status: 'EM_ANALISE',
      ambientes: ambientes
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
        response = await obras.create(dadosParaSalvar) //
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
          <div className="header__header__user">
            <p className="text-secondary">Usuário</p>
            <CDropdown variant="nav-item">
              <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
                <CAvatar src={avatar8} size="lg" />
              </CDropdownToggle>
              <CDropdownMenu className="pt-0" placement="bottom-end">
                <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
                  Account
                </CDropdownHeader>
                <CDropdownItem href="#">
                  <CIcon icon={cilUser} className="me-2" />
                  Profile
                </CDropdownItem>
                <CDropdownItem href="#">
                  <CIcon icon={cilSettings} className="me-2" />
                  Settings
                </CDropdownItem>
                <CDropdownDivider />
                <CDropdownItem href="#">
                  <CIcon icon={cilLockLocked} className="me-2" />
                  Logout
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </div>
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
          <CardObservacoes observacoes={observacoesData} setObservacoes={setObservacoesData} />
        )}
      </section>
    </div>
  )
}

export default Projeto
