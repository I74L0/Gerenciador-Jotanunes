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
  CSpinner
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
  cilUser
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
import { obras, ambientes, perfil, getDados } from '../../../api'

const Projeto = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const referenciaId = searchParams.get('referencia')

  const [activeTab, setActiveTab] = useState(0)
  const [prefacioData, setPrefacioData] = useState({ nome: '', estado: '', cidade: '', texto: '' });
  const [unidadesData, setUnidadesData] = useState([]);
  const [areacomumData, setAreacomumData] = useState([]);
  const [materialData, setMaterialData] = useState([]);
  const [observacoesData, setObservacoesData] = useState({ observacoes: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [userRole, setUserRole] = useState(null)
  const [showStatus, setShowStatus] = useState(false)
  
  function decodeJwt(token) {
    try {
      const payload = token.split('.')[1]
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
      const json = atob(base64)
      return JSON.parse(decodeURIComponent(json))
    } catch {
      return null
    }
  }
  function detectUserRole() {
    try {
      if (window && window.__USER__ && window.__USER__.role) return String(window.__USER__.role)
      const keys = [
        'user',
        'auth',
        'authUser',
        'currentUser',
        'profile',
        'usuario',
        'app_user',
        'USER',
      ]
      for (const k of keys) {
        const raw = localStorage.getItem(k)
        if (!raw) continue
        try {
          const parsed = JSON.parse(raw)
          if (parsed && parsed.role) return String(parsed.role)
          if (parsed && parsed.user && parsed.user.role) return String(parsed.user.role)
        } catch {}
      }
      const accessCandidates = [
        localStorage.getItem('access'),
        localStorage.getItem('token'),
        localStorage.getItem('authTokens'),
        localStorage.getItem('auth_token'),
        localStorage.getItem('accessToken'),
      ]
      for (const t of accessCandidates) {
        if (!t) continue
        const p = decodeJwt(t)
        if (p && p.role) return String(p.role)
      }
      const cookieMatch = document.cookie.match(/user=([^;]+)/)
      if (cookieMatch) {
        try {
          const parsed = JSON.parse(decodeURIComponent(cookieMatch[1]))
          if (parsed && parsed.role) return String(parsed.role)
        } catch {}
      }
    } catch {}
    return null
  }

  useEffect(() => {
    let mounted = true
    const fetchRole = async () => {
      try {
        const res = await perfil.get()
        const remoteRole =
          res && res.data && (res.data.role || (res.data.user && res.data.user.role))
            ? String(res.data.role || res.data.user.role).toLowerCase()
            : null
        if (mounted && remoteRole) {
          setUserRole(remoteRole)
          setShowStatus(remoteRole === 'gestor')
          return
        }
      } catch (err) {
        // ignore, fallback abaixo
      }

      const localRole = detectUserRole()
      if (mounted) {
        const lr = localRole ? localRole.toLowerCase() : null
        setUserRole(lr)
        setShowStatus(lr === 'gestor')
      }
    }

    fetchRole()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const carregarDadosDoProjeto = async () => {
      setIsLoading(true);
      try {
        if (id) {
          // --- Caso 1: Projeto existente ---
          const [obraRes, ambientesRes] = await Promise.all([
            obras.retrieve(id),
            ambientes.list(id),
          ]);
          const dadosObra = obraRes.data;

          setPrefacioData({
            nome: dadosObra.nome || '',
            estado: dadosObra.estado || '',
            cidade: dadosObra.cidade || '',
            texto: dadosObra.texto_prefacio || '',
          });

          const todosAmbientes = ambientesRes.data || [];
          setUnidadesData(todosAmbientes.filter(a => a.tipo === 'UNIDADE'));
          setAreacomumData(todosAmbientes.filter(a => a.tipo === 'AREA_COMUM'));
          setMaterialData(dadosObra.materiais || []);
          setObservacoesData(dadosObra.observacoes || '' );
        } 
        else if (referenciaId) {
          // --- Caso 2: Criar com referência ---
          const [obraRes, ambientesRes] = await Promise.all([
            obras.retrieve(referenciaId),
            ambientes.list(referenciaId),
          ]);
          const dadosRef = obraRes.data;

          setPrefacioData({
            nome: `${dadosRef.nome} (Cópia)`,
            estado: dadosRef.estado || '',
            cidade: dadosRef.cidade || '',
            texto: dadosRef.texto_prefacio || '',
          });

          const todosAmbientes = ambientesRes.data || [];
          setUnidadesData(todosAmbientes.filter(a => a.tipo === 'UNIDADE'));
          setAreacomumData(todosAmbientes.filter(a => a.tipo === 'AREA_COMUM'));
          setMaterialData(dadosRef.materiais || []);
          setObservacoesData(dadosRef.observacoes || '' );
        } 
        else {
          // --- Caso 3: Novo projeto (template padrão) ---
          const templateData = await getDados();
          setPrefacioData(templateData.prefacioData || { nome: '', estado: '', cidade: '', texto: '' });
          setUnidadesData(templateData.unidadesData || []);
          setAreacomumData(templateData.areacomumData || []);
          setMaterialData(templateData.materialData || []);
          const obsTemplate = templateData.observacoesData && templateData.observacoesData[0];
          setObservacoesData({ observacoes: obsTemplate ? obsTemplate.observacao : '' });
        }
      } catch (error) {
        console.error("Falha ao carregar dados do projeto:", error);
        setSaveError("Não foi possível carregar os dados.");
      } finally {
        setIsLoading(false);
      }
    };

    carregarDadosDoProjeto();
  }, [id, referenciaId]);

  const protectiveSave = async () => {
    // 1. Verifica se o campo 'nome' do prefácio está preenchido
    if (!prefacioData.nome) {
      // Se não houver nome, apenas redireciona e encerra a função
      console.log('Nome do projeto ausente. Redirecionando sem salvar.')
      navigate('/index')
      return
    }

    // 2. Se houver nome, procede com a lógica de salvamento
    setIsSaving(true)
    setSaveError(null)

    const dadosParaSalvar = {
      nome: prefacioData.nome,
      estado: prefacioData.estado,
      cidade: prefacioData.cidade,
      texto_prefacio: prefacioData.texto,
      observacoes: observacoesData.observacoes,
      status: 'NAO_FINALIZADO',
    }

    try {
      let response
      let statusTest
      if (id) {
        statusTest = obras.retrieve(id)
        if (statusTest.status != 'NAO_FINALIZADO'){
          dadosParaSalvar.status = statusTest.status
        }
        response = await obras.partialUpdate(id, dadosParaSalvar) // Usando partialUpdate (PATCH)
        console.log('Projeto atualizado!', response.data)
        // Após salvar, redireciona o usuário (se for o caso de 'Sair')
        navigate('/index')
      } else {
        // Se não temos ID, CRIA (create) um novo projeto
        // Nota: A lógica atual já redireciona no 'create'
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
    setIsSaving(true);
    setSaveError(null);

    const dadosParaSalvar = {
      nome: prefacioData.nome,
      estado: prefacioData.estado,
      cidade: prefacioData.cidade,
      texto_prefacio: prefacioData.texto,
      observacoes: observacoesData.observacoes,
      status: 'EM_ANALISE',
    };
     try {
      let response;
      if (id) {
        response = await obras.partialUpdate(id, dadosParaSalvar); // Usando partialUpdate (PATCH)
        console.log('Projeto atualizado!', response.data);
        navigate('/index')
      } else {
        // Se não temos ID, CRIA (create) um novo projeto
        response = await obras.create(dadosParaSalvar); //
        navigate("/index")
      }

    } catch (error) {
      console.error("Erro ao salvar:", error);
      setSaveError(error.message || 'Falha ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <CSpinner color="primary" />
        <span className="ms-3">Carregando Projeto...</span>
      </div>
    );
  }

  return (
    <div className='body__body'>
      <header className='header'>
        <div className="header__header">
          <div className='header__header__logo'>
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
        <hr/>
        <ul className="header__menu">
          <li className="header__menu__item"
            onClick={protectiveSave}>
            Sair
          </li>
          <MenuTabs activeIndex={activeTab} onChange={setActiveTab} />
          <li className="header__menu__item" 
            onClick={handleSave} disabled={isSaving}>
            {/*isSaving ? 'Salvando...' : (id ? 'Atualizar' : 'Salvar Novo')*/"Enviar"}
          </li>
        </ul>
      </header>

      {saveError && (
        <CContainer className="w-75 p-2 bg-danger-light text-danger border rounded">
          Erro: {saveError}
        </CContainer>
      )}

      <section className="content background">
        {activeTab === 0 && <CardPrefacio prefacio={prefacioData} setPrefacio={setPrefacioData}/>}
        {activeTab === 1 && (
          <CardUnidades
            ambientes={unidadesData}
            setAmbientes={setUnidadesData}
            showStatus={showStatus}
          />
        )}
        {activeTab === 2 && (
          <CardAreaComum
            ambientes={areacomumData}
            setAmbientes={setAreacomumData}
            showStatus={showStatus}
          />
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
