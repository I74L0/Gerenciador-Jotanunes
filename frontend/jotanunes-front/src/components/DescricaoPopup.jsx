import { useState, useEffect } from 'react';
import { usePopper } from 'react-popper';
import { IoIosAddCircle } from 'react-icons/io'; // Assumindo que você tem essa dependência

// 1. IMPORTAR a função de API
import { descricoes } from '../api';

// Variável para armazenar as descrições base carregadas da API
// Usaremos um 'ref' ou 'let' fora do componente para evitar carregar a base
// toda vez que o componente renderizar.
let descricoesBaseDaAPI = [];

export default function DescricaoPopup({ referenceElement, onSelect, onAdd, onClose }) {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState(['']);
  const [popperElement, setPopperElement] = useState(null);
  const [popperOffset, setPopperOffset] = useState([0, 10]);

  // Responsividade: ajustar offset com base no tamanho da tela
  useEffect(() => {
    const atualizarOffset = () => {
      const width = window.innerWidth;
      
      if (width < 600) {
        setPopperOffset([34, -200]);
      } else if (width < 1060) {
        setPopperOffset([36, -190]);
      } else {
        setPopperOffset([-8, 8]);
      }
    };

    atualizarOffset();
    window.addEventListener('resize', atualizarOffset);
    return () => window.removeEventListener('resize', atualizarOffset);
  }, []);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'right-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: popperOffset, // Usa o offset dinâmico
        },
      },
    ],
  });

  // 2. MODIFICAR O useEffect para carregar da API
  useEffect(() => {
    // Função assíncrona para buscar os dados da base
    const carregarDescricoesBase = async () => {
      try {
        if (descricoesBaseDaAPI.length === 0) {
            // Chama a API para obter a lista base
            const response = await descricoes.list(); 
            
            descricoesBaseDaAPI = response.data.map(item => item.detalhe);
        }

        const salvos = JSON.parse(localStorage.getItem('descricoesSalvas') || '[]');
        const todas = Array.from(new Set([...descricoesBaseDaAPI, ...salvos]));
        setItems(todas);
      } catch (error) {
        console.error("Erro ao carregar descrições base da API:", error);
        // Em caso de erro, inicializa com os salvos para não travar
        const salvos = JSON.parse(localStorage.getItem('descricoesSalvas') || '[]');
        setItems(salvos);
      }
    };
    
    carregarDescricoesBase();
  }, []);

  const filtered = items.filter(i =>
    i.toLowerCase().includes(search.toLowerCase())
  );

  // estado para fluxo de adicionar inline (substitui prompt)
  const [adding, setAdding] = useState(false);
  const [newDesc, setNewDesc] = useState('');

  const handleAdd = () => {
    setAdding(true);
    setNewDesc('');
  };

  const confirmAdd = () => {
    const novo = newDesc && newDesc.trim();
    if (novo && !items.includes(novo)) {
      const atualizados = [...items, novo];
      setItems(atualizados);
      localStorage.setItem('descricoesSalvas', JSON.stringify(atualizados.filter(x => !descricoesBaseDaAPI.includes(x))));
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