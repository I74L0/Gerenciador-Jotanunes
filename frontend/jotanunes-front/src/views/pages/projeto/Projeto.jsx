import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
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
import { useNavigate } from 'react-router-dom'
import avatar8 from 'src/assets/images/avatars/8.jpg'
import 'src/views/pages/projeto/Projeto-style.scss'
import { obras, ambientes, materiais, getDados } from 'src/apiClient'

const Projeto = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const navigate = useNavigate()
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState(0)
  const [prefacioData, setPrefacioData] = useState({ nome: '', estado: '', cidade: '', texto: '' });
  const [unidadesData, setUnidadesData] = useState([]);
  const [areacomumData, setAreacomumData] = useState([]);
  const [materialData, setMaterialData] = useState([]);
  const [observacoesData, setObservacoesData] = useState({ observacoes: '' });

  // Estados para controle de salvamento e carregamento
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Carrega os dados iniciais da API para o estado do React
  useEffect(() => {
    const carregarDadosDoProjeto = async () => {
      if (id) {
        // Se temos um ID, carregamos um projeto existente
        setIsLoading(true);
        try {
          // Vamos buscar os dados da obra e os ambientes em paralelo
          const obraPromise = obras.retrieve(id);
          const ambientesPromise = ambientes.list(id); // Assumindo que ambientes.list(id) retorna os ambientes desta obra
          // const materiaisPromise = materiais.list(...) // Se materiais forem por obra, adicione aqui

          const [obraRes, ambientesRes] = await Promise.all([obraPromise, ambientesPromise]);
          const dadosObra = obraRes.data;

          // --- Mapeamento de Dados ---

          setPrefacioData({
            nome: dadosObra.nome || '',
            estado: dadosObra.estado || '',
            cidade: dadosObra.cidade || '',
            texto: dadosObra.texto_prefacio || '',
          });

          // Assumindo que os ambientes têm um campo 'tipo' para separar
          // 'UNIDADE' de 'AREA_COMUM'. Se não, você precisará de outra lógica.
          const todosAmbientes = ambientesRes.data || [];
          setUnidadesData(todosAmbientes.filter(a => a.tipo === 'UNIDADE'));
          setAreacomumData(todosAmbientes.filter(a => a.tipo === 'AREA_COMUM'));

          // Assumindo que materiais e observações vêm aninhados na obra
          setMaterialData(dadosObra.materiais || []);
          setObservacoesData(dadosObra.observacoes || { observacoes: '' });

        } catch (error) {
          console.error("Falha ao carregar dados do projeto:", error);
          setSaveError("Não foi possível carregar o projeto.");
        } finally {
          setIsLoading(false);
        }
      } else {
        // É um projeto novo, carregar dados do template (dados.json)
        setIsLoading(true);
        try {
          // 1. Busca todos os dados do template 'dados.json'
          const templateData = await getDados();

          // 2. Define os estados com os dados do template
          setPrefacioData(templateData.prefacioData || { nome: '', estado: '', cidade: '', texto: '' });
          // alert(unidadesData);
          setUnidadesData(templateData.unidadesData || []);
          setAreacomumData(templateData.areacomumData || []);
          setMaterialData(templateData.materialData || []);
          const obsTemplate = templateData.observacoesData && templateData.observacoesData[0];
          setObservacoesData({ observacoes: obsTemplate ? obsTemplate.observacao : '' });

        } catch (error) {
          console.error("Falha ao carregar template (dados.json):", error);
          setSaveError("Não foi possível carregar o template padrão.");
          // Define como vazio em caso de falha
          setPrefacioData({ nome: '', estado: '', cidade: '', texto: '' });
          setUnidadesData([]);
          setAreacomumData([]);
          setMaterialData([]);
          setObservacoesData({ observacoes: '' });
        } finally {
          setIsLoading(false);
        }
      }
    };

    carregarDadosDoProjeto();
  }, [id]);

  const handlePrefacioChange = (novoPrefacio) => {
    setPrefacioData(novoPrefacio);
  };

  const handleUnidadesChange = (novasUnidades) => {
    setUnidadesData(novasUnidades);
  };

  const handleAreaComumChange = (novaAreaComum) => {
    setAreacomumData(novaAreaComum);
  };

  const handleMateriaisChange = (novosMateriais) => {
    setMaterialData(novosMateriais);
  };

  const handleObservacoesChange = (novasObservacoes) => {
    setObservacoesData(novasObservacoes);
  };

  /* --- FUNÇÃO DE SALVAR --- */
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    // Reúne todos os dados do estado em um objeto para a API
    const dadosParaSalvar = {
      // Dados do Prefácio
      nome: prefacioData.nome,
      estado: prefacioData.estado,
      cidade: prefacioData.cidade,
      texto_prefacio: prefacioData.texto,

      // Dados de Ambientes (isto é mais complexo)
      // A API pode querer que você salve os ambientes em /ambientes/
      // e não junto com a obra. Isso depende da sua API.
      // Para este exemplo, vou assumir que a API de obra NÃO salva ambientes
      // e que os CardUnidades/CardAreaComum salvam a si mesmos (o que não fazem).
      // Por simplicidade, vamos focar em salvar os dados do 'prefacio'

      // VAMOS ASSUMIR que a API aceita um 'patch' só com os dados do prefácio
      observacoes: observacoesData,
      // materiais: materialData, //...etc
    };

    try {
      let response;
      if (id) {
        response = await obras.partialUpdate(id, dadosParaSalvar); // Usando partialUpdate (PATCH)
        console.log('Projeto atualizado!', response.data);
      } else {
        // Se não temos ID, CRIA (create) um novo projeto
        response = await obras.create(dadosParaSalvar); //
        console.log('Projeto criado!', response.data);
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
