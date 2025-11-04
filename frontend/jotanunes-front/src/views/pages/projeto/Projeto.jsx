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
import avatar8 from 'src/assets/images/avatars/8.jpg'
import 'src/views/pages/projeto/Projeto-style.scss'
import { obras, ambientes, materiais } from 'src/apiClient'

const Projeto = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState(0)
  const [prefacioData, setPrefacioData] = useState({ nome: '', estado: '', cidade: '', texto: '' });
  const [unidadesData, setUnidadesData] = useState([]);
  const [areacomumData, setAreacomumData] = useState([]);
  const [materialData, setMaterialData] = useState([]);
  const [observacoesData, setObservacoesData] = useState({texto: ''});

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

          // --- IMPORTANTE: Mapeamento de Dados ---
          // Você precisa ajustar os nomes dos campos (ex: 'dadosObra.nome')
          // para bater com o que sua API real retorna.

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
          setObservacoesData(dadosObra.observacoes || { texto: '' });

        } catch (error) {
          console.error("Falha ao carregar dados do projeto:", error);
          setSaveError("Não foi possível carregar o projeto.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setPrefacioData({ nome: '', estado: '', cidade: '', texto: '' });
        setUnidadesData([]);
        setAreacomumData([]);
        setMaterialData([]);
        setObservacoesData({ texto: '' });
        setIsLoading(false);
      }
    };

    carregarDadosDoProjeto();
  }, [id]);

  const handlePrefacioChange = (novoPrefacio) => {
    setPrefacioData(novoPrefacio);
    // apiClient.setPrefacio(novoPrefacio);
  };

  const handleUnidadesChange = (novasUnidades) => {
    setUnidadesData(novasUnidades);
    // apiClient.setUnidades(novasUnidades);
  };

  const handleAreaComumChange = (novaAreaComum) => {
    setAreacomumData(novaAreaComum);
    // apiClient.setAreaComum(novaAreaComum);
  };

  const handleMateriaisChange = (novosMateriais) => {
    setMaterialData(novosMateriais);
    // apiClient.setMateriais(novosMateriais);
  };

  const handleObservacoesChange = (novasObservacoes) => {
    setObservacoesData(novasObservacoes);
    // apiClient.setObservacoes(novasObservacoes);
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
      texto_prefacio: prefacioData.texto, // Exemplo
      
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
        // Opcional: redirecionar para a nova URL /projeto/NOVO_ID
        // navigate(`/projeto/${response.data.id}`);
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
        <CRow className="div-tabs w-100">
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
