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
import { FaCheck } from 'react-icons/fa'
import { BsXLg } from 'react-icons/bs'

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

  useEffect(() => {
    const salvos = JSON.parse(localStorage.getItem('descricoesSalvas') || '[]');
    const todas = Array.from(new Set([...descricoesBase, ...salvos]));
    setItems(todas);
  }, []);

  const filtered = items.filter(i =>
    i.toLowerCase().includes(search.toLowerCase())
  );

  // estado para fluxo de adicionar inline (substitui prompt)
  const [adding, setAdding] = useState(false);
  const [newDesc, setNewDesc] = useState('');

  const handleAdd = () => {
    // abre o input dentro do popup
    setAdding(true);
    setNewDesc('');
  };

  const confirmAdd = () => {
    const novo = newDesc && newDesc.trim();
    if (novo && !items.includes(novo)) {
      const atualizados = [...items, novo];
      setItems(atualizados);
      localStorage.setItem('descricoesSalvas', JSON.stringify(atualizados.filter(x => !descricoesBase.includes(x))));
      onAdd(novo);
    }
    setAdding(false);
    setNewDesc('');
  };

  const cancelAdd = () => {
    setAdding(false);
    setNewDesc('');
  };

  useEffect(() => {
    const esc = (e) => {
      if (e.key === 'Escape') {
        if (adding) {
          cancelAdd();
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose, adding]);

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
      {adding ? (
        <div className="clicado_novaDescricao">
          <input
            type="text"
            className="form-control"
            placeholder="Nova descrição..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmAdd();
              if (e.key === 'Escape') cancelAdd();
            }}
            autoFocus
          />
          <div className='clicado_novaDescricao_botoes'>
            <button className="btn btn-sm btn-primary" onClick={confirmAdd}>Adicionar</button>
            <button className="btn btn-sm btn-secondary" onClick={cancelAdd}>Cancelar</button>
          </div>
        </div>
      ) : (
        <button
          className="btn btn-sm btn-outline-primary mt-2 w-100"
          onClick={handleAdd}
        >
          + Adicionar
        </button>
      )}
    </div>
  );
}

export default function CardUnidades({ ambientes, setAmbientes }) {
  const [popupTarget, setPopupTarget] = useState(null);

  const adicionarAmbiente = () => {
    const novo = { nome: `Novo Ambiente ${ambientes.length + 1}`, editando: true, aberto: true, items: [] }
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

  const adicionarItem = (idx) => {
    const novos = [...ambientes]
    if (!novos[idx].items) novos[idx].items = []
    novos[idx].items.push({ item: '', descricao: '', status: false })
    setAmbientes(novos)
  }

  const atualizarItem = (idxAmb, idxItem, campo, valor) => {
    const novos = [...ambientes]
    if (!novos[idxAmb].items) return
    novos[idxAmb].items[idxItem][campo] = valor
    setAmbientes(novos)
  }

  const removerItem = (idxAmb, idxItem) => {
    const novos = [...ambientes]
    if (!novos[idxAmb].items) return
    novos[idxAmb].items.splice(idxItem, 1)
    setAmbientes(novos)
  }

  const toggleStatus = (idxAmb, idxItem) => {
    const novos = [...ambientes]
    if (!novos[idxAmb].items) return
    novos[idxAmb].items[idxItem].status = !novos[idxAmb].items[idxItem].status
    setAmbientes(novos)
  }

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
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Ações</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      { (amb.items || []).map((linha, i) => (
                        <CTableRow key={i}>
                          <CTableDataCell>
                            <textarea
                              className="auto-expand"
                              rows="1"
                              value={linha.item}
                              onChange={(e) =>
                                atualizarItem(idx, i, 'item', e.target.value)
                              }
                              onInput={(e) => {
                                e.target.style.height = 'auto'
                                e.target.style.height = e.target.scrollHeight + 'px'
                              }}
                            />
                          </CTableDataCell>

                          <CTableDataCell style={{ position: 'relative' }}>
                            <textarea
                              className="auto-expand"
                              rows="1"
                              ref={(el) => linha.descricaoRef = el}
                              value={linha.descricao}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPopupTarget({ ambIdx: idx, itemIdx: i, ref: e.target });
                              }}
                              onChange={(e) =>
                                atualizarItem(idx, i, 'descricao', e.target.value)
                              }
                              onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                              }}
                            />
                            {popupTarget &&
                              popupTarget.ambIdx === idx &&
                              popupTarget.itemIdx === i && (
                                <DescricaoPopup
                                  referenceElement={popupTarget.ref}
                                  onSelect={(desc) => {
                                    atualizarItem(idx, i, 'descricao', desc);
                                    setPopupTarget(null);
                                    setTimeout(() => {
                                      if(linha.descricaoRef) adjustTextareaSize(linha.descricaoRef)
                                    }, 0)
                                  }}
                                  onAdd={(novo) => {
                                    atualizarItem(idx, i, 'descricao', novo);
                                    setPopupTarget(null);
                                  }}
                                  onClose={() => setPopupTarget(null)}
                                />
                            )}
                          </CTableDataCell>

                          <CTableDataCell
                            style={{ textAlign: 'center', cursor: 'pointer' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStatus(idx, i);
                            }}
                          >
                            {linha.status ? (
                              <FaCheck color="green" />
                            ) : (
                              <BsXLg color="red" strokeWidth={1} />
                            )}
                          </CTableDataCell>

                          <CTableDataCell>
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => removerItem(idx, i)}
                            >
                              Remover
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                      <CTableRow>
                        <CTableDataCell colSpan={4}>
                          <CButton
                            color="success"
                            size="sm"
                            onClick={() => adicionarItem(idx)}
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
      </CCardBody>
    </CCard>
  )
}
