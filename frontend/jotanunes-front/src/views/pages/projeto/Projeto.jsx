import { useState, useEffect } from 'react'
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
  useColorModes
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
import { useNavigate } from 'react-router-dom'
import avatar8 from 'src/assets/images/avatars/8.jpg'
import 'src/views/pages/projeto/Projeto-style.scss'
import * as apiClient from 'src/apiClient'

const Projeto = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState(0)
  const [prefacioData, setPrefacioData] = useState({ nome: '', estado: '', cidade: '', texto: '' });
  const [unidadesData, setUnidadesData] = useState([]);
  const [areacomumData, setAreacomumData] = useState([]);
  const [materialData, setMaterialData] = useState([]);
  const [observacoesData, setObservacoesData] = useState([]);

  // Estados para controle de salvamento
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Carrega os dados iniciais da API para o estado do React
  useEffect(() => {
    apiClient.getDados().then(d => {
      setPrefacioData(d.prefacioData || { nome: '', estado: '', cidade: '', texto: '' });
      setUnidadesData(d.unidadesData || []);
      setAreacomumData(d.areacomumData || []);
      setMaterialData(d.materialData || []);
      setObservacoesData(d.observacoesData || []);
    }).catch(error => {
      console.error("Falha ao carregar dados:", error);
    });
  }, [])

  const handlePrefacioChange = (novoPrefacio) => {
    setPrefacioData(novoPrefacio);
    apiClient.setPrefacio(novoPrefacio);
  };

  const handleUnidadesChange = (novasUnidades) => {
    setUnidadesData(novasUnidades);
    apiClient.setUnidades(novasUnidades);
  };

  const handleAreaComumChange = (novaAreaComum) => {
    setAreacomumData(novaAreaComum);
    apiClient.setAreaComum(novaAreaComum);
  };

  const handleMateriaisChange = (novosMateriais) => {
    setMaterialData(novosMateriais);
    apiClient.setMateriais(novosMateriais);
  };

  const handleObservacoesChange = (novasObservacoes) => {
    setObservacoesData(novasObservacoes);
    apiClient.setObservacoes(novasObservacoes);
  };

  /* --- FUNÇÃO DE SALVAR --- */
  // Esta função chama a API para persistir o cache no servidor
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await apiClient.saveDados();
      // Opcional: mostrar uma mensagem de sucesso (ex: toast)
      console.log('Dados salvos com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setSaveError(error.message || 'Falha ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="body bg-body-tertiary vh-100 d-flex flex-column align-items-center">
      <CHeader position="sticky" className="d-flex w-100 p-4 pb-0" onLoad={() => setColorMode('light')}>
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
                  <CDropdownItem href="#">
                    <CIcon icon={cilBell} className="me-2" />
                    Updates
                    <CBadge color="info" className="ms-2">42</CBadge>
                  </CDropdownItem>
                  <CDropdownItem href="#">
                    <CIcon icon={cilEnvelopeOpen} className="me-2" />
                    Messages
                    <CBadge color="success" className="ms-2">42</CBadge>
                  </CDropdownItem>
                  <CDropdownItem href="#">
                    <CIcon icon={cilTask} className="me-2" />
                    Tasks
                    <CBadge color="danger" className="ms-2">42</CBadge>
                  </CDropdownItem>
                  <CDropdownItem href="#">
                    <CIcon icon={cilCommentSquare} className="me-2" />
                    Comments
                    <CBadge color="warning" className="ms-2">42</CBadge>
                  </CDropdownItem>
                  <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Settings</CDropdownHeader>
                  <CDropdownItem href="#"><CIcon icon={cilUser} className="me-2" />Profile</CDropdownItem>
                  <CDropdownItem href="#"><CIcon icon={cilSettings} className="me-2" />Settings</CDropdownItem>
                  <CDropdownItem href="#"><CIcon icon={cilCreditCard} className="me-2" />Payments
                    <CBadge color="secondary" className="ms-2">42</CBadge>
                  </CDropdownItem>
                  <CDropdownItem href="#"><CIcon icon={cilFile} className="me-2" />Projects
                    <CBadge color="primary" className="ms-2">42</CBadge>
                  </CDropdownItem>
                  <CDropdownDivider />
                  <CDropdownItem href="#"><CIcon icon={cilLockLocked} className="me-2" />Lock Account</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CRow>
          </CContainer>
        </CRow>
        <hr className="w-100" />
        <CRow className="div-tabs w-100 align-items-center">
          <CButton
            className="btn-sair me-3"
            onClick={() => navigate('/index')}
            style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000ff' }}
          >
            Sair
          </CButton>
          <MenuTabs activeIndex={activeTab} onChange={setActiveTab} />
          <CButton className="btn-salvar ms-auto" onClick={handleSave} disabled={isSaving}>Enviar</CButton>
        </CRow>
      </CHeader>

      <div className="background w-100 d-flex justify-content-center align-items-center flex-grow-1">
        {/* Agora passamos os NOVOS handlers para os componentes filhos */}
        {activeTab === 0 && <CardPrefacio prefacio={prefacioData} setPrefacio={handlePrefacioChange} />}
        {activeTab === 1 && <CardUnidades ambientes={unidadesData} setAmbientes={handleUnidadesChange} />}
        {activeTab === 2 && <CardAreaComum ambientes={areacomumData} setAmbientes={handleAreaComumChange} />}
        {activeTab === 3 && <CardMateriais materiais={materialData} setMateriais={handleMateriaisChange} />}
        {activeTab === 4 && <CardObservacoes observacoes={observacoesData} setObservacoes={handleObservacoesChange} />}
      </div>
    </div>
  )
}

export default Projeto
