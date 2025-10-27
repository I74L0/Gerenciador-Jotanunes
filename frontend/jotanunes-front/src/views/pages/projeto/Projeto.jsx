import { useState } from 'react'
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

const Projeto = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  
  const [activeTab, setActiveTab] = useState(1)
  
  const [prefacioData, setPrefacioData] = useState({
    nome: '', 
    estado: '',
    cidade: '',
    texto: '',
  })

  const [unidadesData, setUnidadesData] = useState([
    { nome: 'Sala de Estar/ Jantar', editando: false, aberto: false, linhas: [] },
    { nome: 'Circulação', editando: false, aberto: false, linhas: [] },
    { nome: 'Quarto e Suíte', editando: false, aberto: false, linhas: [] },
    { nome: 'Sanitário/ Lavabo', editando: false, aberto: false, linhas: [] },
    { nome: 'Cozinha/ Área de Serviço', editando: false, aberto: false, linhas: [] },
    { nome: 'Área Técnica', editando: false, aberto: false, linhas: [] },
    { nome: 'Varanda', editando: false, aberto: false, linhas: [] },
    { nome: 'Garden', editando: false, aberto: false, linhas: [] },
  ])

  const [areacomumData, setAreacomumData] = useState(
    [
      {
        id: "1.",
        nome: "Guarita",
        editando: false,
        aberto: false,
        items: [
          { item: "Piso", descricao: "Porcelanato", status: true },
          { item: "Rodapé", descricao: "Porcelanato, h-5cm", status: false },
          { item: "Parede", descricao: "Pintura PVA látex branco sobre gesso ou massa de regularização PVA", status: true },
        ],
      },
      {
        id: "2.",
        nome: "Salão de Festas Gourmet",
        editando: false,
        aberto: false,
        items: [
          { item: "Piso", descricao: "Porcelanato", status: true },
          { item: "Rodapé", descricao: "Porcelanato, h-5cm", status: false },
          { item: "Parede", descricao: "Pintura PVA látex branco", status: true },
          { item: "Cozinha", descricao: "Bancada em granito", status: true },
        ],
      },
      {
        id: "3.",
        nome: "Quiosques",
        editando: false,
        aberto: false,
        items: [
          { item: "Churrasqueira", descricao: "Aço inox", status: true },
          { item: "Pia", descricao: "Granito com cuba dupla", status: true },
          { item: "Lixeira", descricao: "Coletora de recicláveis", status: false },
        ],
      },
      {
        id: "4.",
        nome: "Copa Funcionários",
        editando: false,
        aberto: false,
        items: [
          { item: "Pia", descricao: "Aço inox com torneira", status: true },
          { item: "Armário", descricao: "MDF com acabamento", status: false },
          { item: "Geladeira", descricao: "Capacidade 300L", status: true },
        ],
      },
      {
        id: "5.",
        nome: "Salão de Festas",
        editando: false,
        aberto: false,
        items: [
          { item: "Piso", descricao: "Vinílico", status: true },
          { item: "Iluminação", descricao: "LED embutido", status: true },
          { item: "Portas", descricao: "Estandart em madeira", status: false },
        ],
      },
      {
        id: "6.",
        nome: "Brinquedoteca",
        editando: false,
        aberto: false,
        items: [
          { item: "Piso", descricao: "Emborrachado", status: true },
          { item: "Brinquedos", descricao: "Aprovados INMETRO", status: true },
          { item: "Segurança", descricao: "Proteções nas tomadas", status: true },
        ],
      },
      {
        id: "7.",
        nome: "Playground",
        editando: false,
        aberto: false,
        items: [
          { item: "Piso", descricao: "Emborrachado externo", status: true },
          { item: "Estrutura", descricao: "Metálica com pintura", status: false },
          { item: "Cercas", descricao: "Proteção perimetral", status: true },
        ],
      },
      {
        id: "8.",
        nome: "Piscina Adulto",
        editando: false,
        aberto: false,
        items: [
          { item: "Tratamento", descricao: "Cloração automática", status: true },
          { item: "Bombeamento", descricao: "Bomba 2HP", status: true },
          { item: "Degraus", descricao: "Antiaderente", status: false },
        ],
      },
      {
        id: "9.",
        nome: "Piscina Infantil",
        editando: false,
        aberto: false,
        items: [
          { item: "Profundidade", descricao: "0.6 m", status: true },
          { item: "Brinquedos", descricao: "Acessórios lúdicos", status: false },
          { item: "Tratamento", descricao: "Filtragem diária", status: true },
        ],
      },
      {
        id: "10.",
        nome: "Solarium",
        editando: false,
        aberto: false,
        items: [
          { item: "Deck", descricao: "Madeira tratada", status: true },
          { item: "Espreguiçadeiras", descricao: "Em sintético", status: false },
          { item: "Guarda-sol", descricao: "Estrutura metálica", status: true },
        ],
      },
      {
        id: "11.",
        nome: "Deck Molhado",
        editando: false,
        aberto: false,
        items: [
          { item: "Revestimento", descricao: "Antiderrapante", status: true },
          { item: "Dreno", descricao: "Sistema linear", status: true },
          { item: "Corrimão", descricao: "Inox", status: false },
        ],
      },
      {
        id: "12.",
        nome: "Sauna",
        editando: false,
        aberto: false,
        items: [
          { item: "Forno", descricao: "Elétrico 6kW", status: true },
          { item: "Revestimento", descricao: "Madeira nobre", status: true },
          { item: "Ventilação", descricao: "Exaustor", status: false },
        ],
      },
      {
        id: "13.",
        nome: "Academia",
        editando: false,
        aberto: false,
        items: [
          { item: "Equipamentos", descricao: "Esteira, bike, pesos", status: true },
          { item: "Piso", descricao: "Borracha técnica", status: true },
          { item: "Ar-condicionado", descricao: "Split 18.000 BTU", status: false },
        ],
      },
      {
        id: "14.",
        nome: "Quadra Poliesportiva",
        editando: false,
        aberto: false,
        items: [
          { item: "Piso", descricao: "Poliuretano", status: true },
          { item: "Iluminação", descricao: "Holofotes 500W", status: false },
          { item: "Rede", descricao: "Voleibol/Futebol", status: true },
        ],
      },
      {
        id: "15.",
        nome: "Espaço Pet",
        editando: false,
        aberto: false,
        items: [
          { item: "Piso", descricao: "Ladrilho técnico", status: true },
          { item: "Bebedouro", descricao: "Automático", status: false },
          { item: "Cerca", descricao: "Proteção perimetral", status: true },
        ],
      },
      {
        id: "16.",
        nome: "Bicicletário",
        editando: false,
        aberto: false,
        items: [
          { item: "Suporte", descricao: "Capacidade 20 bikes", status: true },
          { item: "Cobertura", descricao: "Policarbonato", status: true },
          { item: "Iluminação", descricao: "Sensor de presença", status: false },
        ],
      },
      {
        id: "17.",
        nome: "Vestiários",
        editando: false,
        aberto: false,
        items: [
          { item: "Chuveiro", descricao: "Box e ducha", status: true },
          { item: "Bancos", descricao: "Madeira tratada", status: true },
          { item: "Armários", descricao: "Aço com fechadura", status: false },
        ],
      },
    ]
  )

  const [materialData, setMaterialData] = useState(
    [
      {
        id: "1",
        nome: "Cerâmica",
        marcas: [
          "Incesa", "Portobello", "Arielle", "Tecnogres", "Pamesa",
          "Camelo Fior", "Biancogrês", "Pointer"
        ]
      },
      {
        id: "2",
        nome: "Porcelanato",
        marcas: [
          "Portobello", "Arielle", "Tecnogres", "Pamesa", "Biancogrês",
          "Elizabeth", "Ceusa", "Pointer", "Villagres"
        ]
      },
      {
        id: "3",
        nome: "Laminado",
        marcas: [
          "Eucatex", "Durafloor ou Espaçofloor"
        ]
      },
      {
        id: "4",
        nome: "Esquadria",
        marcas: [
          "Esaf", "Alumasa", "Atlantica", "Ramassol ou Unicasa"
        ]
      },
      {
        id: "5",
        nome: "Ferragem",
        marcas: [
          "Silvana", "Stam", "Arouca", "Soprano", "Aliança", "Imab"
        ]
      },
      {
        id: "6",
        nome: "Instalação Elétrica",
        marcas: [
          "Alumbra", "Steck", "Ilumi", "Schneider", "Margirius ou Fame"
        ]
      },
      {
        id: "7",
        nome: "Metal Sanitário",
        marcas: [
          "Forusi", "Deca", "Celite", "Fabrimar ou Docol"
        ]
      },
    ]
  )

  const [observacoesData, setObservacoesData] = useState([
    { observacao: '' }
  ])

  return (
    <div className="body bg-body-tertiary vh-100 d-flex flex-column align-items-center">
      <CHeader position="sticky" className="d-flex w-100 p-4 p-3"
      onLoad={() => setColorMode('light')}>
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
                  <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
                    Account
                  </CDropdownHeader>
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
        <CContainer fluid>
          <MenuTabs activeIndex={activeTab - 1} onChange={(i) => setActiveTab(i + 1)} />
          <CButton className='btn-salvar'>Salvar e Sair</CButton>
        </CContainer>
      </CHeader>

      <div className="background w-100 d-flex justify-content-center align-items-center flex-grow-1">
        {activeTab === 1 && <CardPrefacio prefacio={prefacioData} setPrefacio={setPrefacioData} />}
        {activeTab === 2 && <CardUnidades ambientes={unidadesData} setAmbientes={setUnidadesData} />}
        {activeTab === 3 && <CardAreaComum ambientes={areacomumData} setAmbientes={setAreacomumData} />}
        {activeTab === 4 && <CardMateriais materiais={materialData} setMateriais={setMaterialData} />}
        {activeTab === 5 && <CardObservacoes observacoes={observacoesData} setObservacoes={setObservacoesData} />}
      </div>
    </div>
  )
}

export default Projeto
