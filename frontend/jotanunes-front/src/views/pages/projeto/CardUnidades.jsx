import { useState, useEffect } from 'react'
import { 
  CButton,
  CCard,
  CCardBody,
  CCollapse,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { IoIosAddCircle } from "react-icons/io";
import { usePopper } from 'react-popper'

/* =========================
   Popup de Seleção de Descrição
   ========================= */
const descricoesBase = [
  "Porcelanato ou laminado",
  "Pintura PVA látex branco sobre gesso ou massa de regularização PVA.",
  "Porcelanato ou Laminado, h= 5cm",
  "Mármore ou granito.",
  "Metálico",
  "Alumínio pintado de branco",
  "Liso incolor.",
  "Porta semi–ôca comum pintada c/ esmalte sintético.",
  "Acabamento cromado.",
  "Pontos de luz no teto, tomadas de corrente e interruptores",
  "Pontos secos de comunicação e de antena de TV.",
  "Infraestrutura para high wall com condensadora axial.",
  "Cerâmica.",
  "Cerâmica até o teto.",
  "Forro de gesso.",
  "Mármore ou granito L=3,5cm.",
  "Em mármore ou granito com cuba em louça cor branca",
  "Porta semi-ôca comum pintura c/ esmalte sintético.",
  "Pontilhado Incolor.",
  "Torneira para Lavatório, registro de gaveta e registro de pressão com acabamento cromado .",
  "Vaso Sanitário com Caixa Acoplada em louça cor branca.",
  "Pontos de luz no teto, tomada de corrente e interruptor da Prime, Alumbra, Cemar ou Fame na cor branco.",
  "Sifão em PVC, esgoto em PVC, rede de água fria e ducha higiênica em PEX.",
  "Pintura látex PVA sobre gesso ou argamassa de regularização PVA.",
  "Inox.",
  "Louça cor branca.",
  "Torneiras e registro de gaveta com acabamento cromado.",
  "Rede de água fria em PEX e esgoto em PVC",
  "Tubulação seca.",
  "Em concreto desempolado.",
  "Textura acrílica.",
  "Pintura ou textura acrílica.",
  "Em perfil metálico pintado de branco.",
  "Textura Acrílica ou Pastilha Cerâmica, conforme definido em projeto arquitetônico.",
  "Pintura PVA látex branco sobre gesso ou massa de regulariação PVA ou Forro de gesso.",
  "Porcelanato ou Laminado, h=5cm.",
  "Alumínio pintado de branco com vidro liso.",
  "Ponto de luz no teto.",
  "Grama"
];

function DescricaoPopup({ referenceElement, onSelect, onAdd, onClose }) {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'right-start',
  });

  // 🔹 Carrega lista inicial (do localStorage + base)
  useEffect(() => {
    const salvos = JSON.parse(localStorage.getItem('descricoesSalvas') || '[]');
    const todas = Array.from(new Set([...descricoesBase, ...salvos]));
    setItems(todas);
  }, []);

  // 🔹 Filtra conforme busca
  const filtered = items.filter(i =>
    i.toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 Adiciona nova descrição e salva no localStorage
  const handleAdd = () => {
    const novo = prompt("Digite a nova descrição:");
    if (novo && !items.includes(novo)) {
      const atualizados = [...items, novo];
      setItems(atualizados);
      localStorage.setItem('descricoesSalvas', JSON.stringify(atualizados.filter(x => !descricoesBase.includes(x))));
      onAdd(novo);
    }
  };

  // 🔹 Fecha com ESC
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div
      data-descricao-popup="true"
      ref={setPopperElement}
      style={{
        ...styles.popper,
        zIndex: 9999,
        background: '#ccc',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '8px',
        width: '300px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
      {...attributes.popper}
    >
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Buscar descrição..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
      />
      <div
        style={{
          maxHeight: '200px',
          overflowY: 'auto',
          borderTop: '1px solid #eee',
          paddingTop: '4px',
        }}
      >
        {filtered.map((desc, i) => (
          <div
            key={i}
            onClick={() => onSelect(desc)}
            style={{
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {desc}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-muted small text-center py-2">
            Nenhum resultado encontrado
          </div>
        )}
      </div>
      <button
        className="btn btn-sm btn-outline-primary mt-2 w-100"
        onClick={handleAdd}
      >
        + Adicionar
      </button>
    </div>
  );
}


/* =========================
   Componente Principal
   ========================= */
export default function CardUnidades({ ambientes, setAmbientes }) {
  const [popupTarget, setPopupTarget] = useState(null);

  // const [ambientes, setAmbientes] = useState([
  //   { 
  //     nome: "Sala de Estar/ Jantar", 
  //     editando: false,  
  //     linhas: [
  //       { item: "Piso", descricao: "" },
  //       { item: "Parede", descricao: "" },
  //       { item: "Teto", descricao: "" },
  //       { item: "Rodapé", descricao: "" },
  //       { item: "Soleira", descricao: "" },
  //       { item: "Peitoril", descricao: "" },
  //       { item: "Esquadria", descricao: "" },
  //       { item: "Vidro", descricao: "" },
  //       { item: "Porta", descricao: "" },
  //       { item: "Ferragem", descricao: "" },
  //       { item: "Inst. Elétrica", descricao: "" },
  //       { item: "Inst. Comunic.", descricao: "" },
  //     ]
  //   },
  //   { 
  //     nome: "Circulação", 
  //     editando: false, 
  //     linhas: [
  //       { item: "Piso", descricao: "" },
  //       { item: "Parede", descricao: "" },
  //       { item: "Teto", descricao: "" },
  //       { item: "Rodapé", descricao: "" },
  //       { item: "Inst. Elétrica", descricao: "" },
  //     ]
  //   },
  //   { 
  //     nome: "Quarto e Suíte", 
  //     editando: false, 
  //     linhas: [
  //       { item: "Piso", descricao: "" },
  //       { item: "Parede", descricao: "" },
  //       { item: "Teto", descricao: "" },
  //       { item: "Rodapé", descricao: "" },
  //       { item: "Soleira", descricao: "" },
  //       { item: "Peitoril", descricao: "" },
  //       { item: "Esquadria", descricao: "" },
  //       { item: "Vidro", descricao: "" },
  //       { item: "Porta", descricao: "" },
  //       { item: "Ferragem", descricao: "" },
  //       { item: "Inst. Elétrica", descricao: "" },
  //       { item: "Inst. Comunic.", descricao: "" },
  //       { item: "Ar Condicionado", descricao: "" },
  //     ]
  //   },
  //   { 
  //     nome: "Sanitário/ Lavabo", 
  //     editando: false, 
  //     linhas: [
  //       { item: "Piso", descricao: "" },
  //       { item: "Parede", descricao: "" },
  //       { item: "Teto", descricao: "" },
  //       { item: "Filete", descricao: "" },
  //       { item: "Cordão de Box", descricao: "" },
  //       { item: "Bancada", descricao: "" },
  //       { item: "Porta", descricao: "" },
  //       { item: "Peitoril", descricao: "" },
  //       { item: "Ferragem", descricao: "" },
  //       { item: "Esquadria", descricao: "" },
  //       { item: "Vidro", descricao: "" },
  //       { item: "Metal Sanitário", descricao: "" },
  //       { item: "Louças", descricao: "" },
  //       { item: "Inst. Elétrica", descricao: "" },
  //       { item: "Inst. Hidráulica", descricao: "" },
  //     ]
  //   },
  //   { 
  //     nome: "Cozinha/ Área de Serviço", 
  //     editando: false, 
  //     linhas: [
  //       { item: "Piso", descricao: "" },
  //       { item: "Parede", descricao: "" },
  //       { item: "Teto", descricao: "" },
  //       { item: "Filete", descricao: "" },
  //       { item: "Bancada", descricao: "" },
  //       { item: "Cuba", descricao: "" },
  //       { item: "Peitoril", descricao: "" },
  //       { item: "Tanque", descricao: "" },
  //       { item: "Esquadrias", descricao: "" },
  //       { item: "Metais", descricao: "" },
  //       { item: "Inst. Elétricas", descricao: "" },
  //       { item: "Inst. Hidráulica", descricao: "" },
  //       { item: "Inst. Comunicação", descricao: "" },
  //     ]
  //   },
  //   { 
  //     nome: "Área Técnica", 
  //     editando: false, 
  //     linhas: [
  //       { item: "Piso", descricao: "" },
  //       { item: "Parede", descricao: "" },
  //       { item: "Teto", descricao: "" },
  //       { item: "Gradil", descricao: "" },
  //     ]
  //   },
  //   { 
  //     nome: "Varanda", 
  //     editando: false, 
  //     linhas: [
  //       { item: "Piso", descricao: "" },
  //       { item: "Parede", descricao: "" },
  //       { item: "Teto", descricao: "" },
  //       { item: "Rodapé", descricao: "" },
  //       { item: "Porta", descricao: "" },
  //       { item: "Inst. Elétrica", descricao: "" },
  //       { item: "Guarda Corpo", descricao: "" },
  //     ]
  //   },
  //   { 
  //     nome: "Garden", 
  //     editando: false, 
  //     linhas: [
  //       { item: "Piso", descricao: "" },
  //       { item: "Gradil", descricao: "" },
  //     ]
  //   }
  // ])


  const adicionarAmbiente = () => {
    const novo = { nome: `Novo Ambiente ${ambientes.length + 1}`, editando: true, aberto: true, linhas: [] }
    setAmbientes([...ambientes, novo])
  }

  const atualizarNome = (idx, valor) => {
    const novos = [...ambientes]
    novos[idx].nome = valor
    setAmbientes(novos)
  }

  const finalizarEdicao = (idx) => {
    const novos = [...ambientes]
    novos[idx].editando = false
    setAmbientes(novos)
  }

  const removerAmbiente = (idx) => {
    setAmbientes(ambientes.filter((_, i) => i !== idx))
  }

  const toggleCollapse = (idx) => {
    const novos = [...ambientes]
    novos[idx].aberto = !novos[idx].aberto
    setAmbientes(novos)
  }

  const adicionarLinha = (idx) => {
    const novos = [...ambientes]
    novos[idx].linhas.push({ item: '', descricao: '' })
    setAmbientes(novos)
  }

  const atualizarLinha = (idxAmb, idxLinha, campo, valor) => {
    const novos = [...ambientes]
    novos[idxAmb].linhas[idxLinha][campo] = valor
    setAmbientes(novos)
  }

  const removerLinha = (idxAmb, idxLinha) => {
    const novos = [...ambientes]
    novos[idxAmb].linhas.splice(idxLinha, 1)
    setAmbientes(novos)
  }

  // Fecha o popup quando o usuário clicar fora (popup ou textarea que abriu)
  useEffect(() => {
    const handler = (e) => {
      if (!popupTarget) return;
      const popupEl = document.querySelector('[data-descricao-popup="true"]');
      const clickedInsidePopup = popupEl && popupEl.contains(e.target);
      const clickedTextarea = popupTarget.ref && popupTarget.ref.contains && popupTarget.ref.contains(e.target);

      if (!clickedInsidePopup && !clickedTextarea) {
        setPopupTarget(null);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popupTarget]);

  return (
    <CCard className="h-100 w-75">
      <CCardBody className="p-0">
        <>
          <CRow className="justify-content-between align-items-center mb-2 mt-3">
            <div
              className="d-flex align-items-center add-ambiente"
              onClick={adicionarAmbiente}
              style={{ cursor: 'pointer' }}
            >
              <IoIosAddCircle className="circle-icon" />
              <span className="ms-2">Adicionar Ambiente</span>
            </div>
          </CRow>
          <hr />
          <div className="lista-ambientes">
            {ambientes.map((amb, idx) => (
              <div key={idx}>
                <CRow
                  className="linha-ambiente justify-content-between align-items-center"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleCollapse(idx)}
                >
                  <div className="nome-wrapper">
                    {amb.editando ? (
                      <input
                        type="text"
                        className="inline-input"
                        autoFocus
                        value={amb.nome}
                        onChange={(e) => atualizarNome(idx, e.target.value)}
                        onBlur={() => finalizarEdicao(idx)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') finalizarEdicao(idx)
                        }}
                      />
                    ) : (
                      <span className="nome-ambiente">{`${idx + 1}. ${amb.nome}`}</span>
                    )}
                  </div>

                  <div className="acao-remover">
                    <CButton
                      color="danger"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        removerAmbiente(idx)
                      }}
                    >
                      Remover Ambiente
                    </CButton>
                  </div>
                </CRow>

                <CCollapse className='div-collapse' visible={amb.aberto}>
                  <CCard>
                    <CTable bordered>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Item</CTableHeaderCell>
                          <CTableHeaderCell>Descrição</CTableHeaderCell>
                          <CTableHeaderCell>Ações</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {amb.linhas.map((linha, i) => (
                          <CTableRow key={i}>
                            <CTableDataCell>
                              <textarea
                                className="auto-expand"
                                rows="1"
                                value={linha.item}
                                onChange={(e) =>
                                  atualizarLinha(idx, i, 'item', e.target.value)
                                }
                                onInput={(e) => {
                                  e.target.style.height = 'auto'
                                  e.target.style.height = e.target.scrollHeight + 'px'
                                }}
                              />
                            </CTableDataCell>

                            {/* CAMPO DE DESCRIÇÃO COM POPUP */}
                            <CTableDataCell style={{ position: 'relative' }}>
                              <textarea
                                className="auto-expand"
                                rows="1"
                                ref={(el) => linha.descricaoRef = el}
                                value={linha.descricao}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPopupTarget({ ambIdx: idx, linhaIdx: i, ref: e.target });
                                }}
                                onChange={(e) =>
                                  atualizarLinha(idx, i, 'descricao', e.target.value)
                                }
                                onInput={(e) => {
                                  e.target.style.height = 'auto';
                                  e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                              />
                              {popupTarget &&
                                popupTarget.ambIdx === idx &&
                                popupTarget.linhaIdx === i && (
                                  <DescricaoPopup
                                    referenceElement={popupTarget.ref}
                                    onSelect={(desc) => {
                                      atualizarLinha(idx, i, 'descricao', desc);
                                      setPopupTarget(null);

                                      setTimeout(() => {
                                        if(linha.descricaoRef) adjustTextareaSize(linha.descricaoRef)
                                      }, 0)
                                    }}
                                    onAdd={(novo) => {
                                      atualizarLinha(idx, i, 'descricao', novo);
                                      setPopupTarget(null);
                                    }}
                                    onClose={() => setPopupTarget(null)}
                                  />
                              )}
                            </CTableDataCell>

                            <CTableDataCell>
                              <CButton
                                color="danger"
                                size="sm"
                                onClick={() => removerLinha(idx, i)}
                              >
                                Remover
                              </CButton>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                        <CTableRow>
                          <CTableDataCell colSpan={3}>
                            <CButton
                              color="success"
                              size="sm"
                              onClick={() => adicionarLinha(idx)}
                            >
                              + Adicionar Linha
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      </CTableBody>
                    </CTable>
                  </CCard>
                </CCollapse>
              </div>
            ))}
          </div>
        </>
      </CCardBody>
    </CCard>
  )
}