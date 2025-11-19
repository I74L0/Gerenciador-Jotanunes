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
import { obras, ambientes, getDados } from 'src/apiClient'

const Projeto = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const referenciaId = searchParams.get('referencia') // <-- Novo

  const [activeTab, setActiveTab] = useState(0)
  const [prefacioData, setPrefacioData] = useState({ nome: '', estado: '', cidade: '', texto: '' });
  const [unidadesData, setUnidadesData] = useState([]);
  const [areacomumData, setAreacomumData] = useState([]);
  const [materialData, setMaterialData] = useState([]);
  const [observacoesData, setObservacoesData] = useState({ observacoes: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

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
          setObservacoesData(dadosObra.observacoes || { observacoes: '' });
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
          setObservacoesData(dadosRef.observacoes || { observacoes: '' });
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
    setIsSaving(true);
    setSaveError(null);

    const dadosParaSalvar = {
      nome: prefacioData.nome,
      estado: prefacioData.estado,
      cidade: prefacioData.cidade,
      texto_prefacio: prefacioData.texto,
      observacoes: observacoesData,
      status: 'NAO_FINALIZADO',
    };
     try {
      let response;
      if (id) {
        response = await obras.partialUpdate(id, dadosParaSalvar); // Usando partialUpdate (PATCH)
        console.log('Projeto atualizado!', response.data);
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

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    const dadosParaSalvar = {
      nome: prefacioData.nome,
      estado: prefacioData.estado,
      cidade: prefacioData.cidade,
      texto_prefacio: prefacioData.texto,
      observacoes: observacoesData,
      status: 'EM_ANALISE',
    };
     try {
      let response;
      if (id) {
        response = await obras.partialUpdate(id, dadosParaSalvar); // Usando partialUpdate (PATCH)
        console.log('Projeto atualizado!', response.data);
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
    <div className="body bg-body-tertiary vh-100 d-flex flex-column align-items-center">
      <CHeader position="sticky" className="d-flex w-100 p-4 pb-0">
        <CRow className="header-row w-100 justify-content-between align-items-center">
          <CContainer>
            <CImage src="/images/Logo Vermelha.png" alt="JotaNunes Logo" height={48} />
          </CContainer>
          <CContainer className="d-flex">
            <CRow>
              <CHeaderText className="text-secondary">Maria Joaquina</CHeaderText>
              <CDropdown variant="nav-item">
                <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
                  <CAvatar src={avatar8} size="lg" />
                </CDropdownToggle>
                <CDropdownMenu className="pt-0" placement="bottom-end">
                  <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>
                  <CDropdownItem href="#"><CIcon icon={cilUser} className="me-2" />Profile</CDropdownItem>
                  <CDropdownItem href="#"><CIcon icon={cilSettings} className="me-2" />Settings</CDropdownItem>
                  <CDropdownDivider />
                  <CDropdownItem href="#"><CIcon icon={cilLockLocked} className="me-2" />Logout</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CRow>
          </CContainer>
        </CRow>
        <hr className="w-100" />
        <CRow className="div-tabs w-100 align-items-center">
          <CButton
            className="btn-sair me-3"
            onClick={protectiveSave}
            
          >
            Sair
          </CButton>
          <MenuTabs activeIndex={activeTab} onChange={setActiveTab} />
          <CButton className="btn-salvar" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : (id ? 'Atualizar' : 'Salvar Novo')}
          </CButton>
        </CRow>
      </CHeader>

      {saveError && (
        <CContainer className="w-75 p-2 bg-danger-light text-danger border rounded">
          Erro: {saveError}
        </CContainer>
      )}

      <div className="background w-100 d-flex justify-content-center align-items-center flex-grow-1">
        {activeTab === 0 && <CardPrefacio prefacio={prefacioData} setPrefacio={setPrefacioData} />}
        {activeTab === 1 && <CardUnidades ambientes={unidadesData} setAmbientes={setUnidadesData} />}
        {activeTab === 2 && <CardAreaComum ambientes={areacomumData} setAmbientes={setAreacomumData} />}
        {activeTab === 3 && <CardMateriais materiais={materialData} setMateriais={setMaterialData} />}
        {activeTab === 4 && <CardObservacoes observacoes={observacoesData} setObservacoes={setObservacoesData} />}
      </div>
    </div>
  )
}

export default Projeto
