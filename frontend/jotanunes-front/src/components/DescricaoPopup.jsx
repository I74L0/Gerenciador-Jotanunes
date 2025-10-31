import { useState, useEffect } from 'react';
import { usePopper } from 'react-popper';
import { IoIosAddCircle } from 'react-icons/io'; // Assumindo que você tem essa dependência

// 1. IMPORTAR a função de API
import { descricoes } from '../apiClient'; 

// Variável para armazenar as descrições base carregadas da API
// Usaremos um 'ref' ou 'let' fora do componente para evitar carregar a base
// toda vez que o componente renderizar.
let descricoesBaseDaAPI = [];

export default function DescricaoPopup({ referenceElement, onSelect, onAdd, onClose }) {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState(['']);
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'right-start',
  });

  // 2. MODIFICAR O useEffect para carregar da API
  useEffect(() => {
    // Função assíncrona para buscar os dados da base
    const carregarDescricoesBase = async () => {
      try {
        if (descricoesBaseDaAPI.length === 0) {
            // Chama a API para obter a lista base
            const response = await descricoes.list(); 
            
            // ATENÇÃO: Ajuste a linha abaixo para acessar o array de strings corretamente
            // Assumindo que a API retorna um array de objetos, e você quer a propriedade 'nome' ou 'texto'
            // Exemplo: se a resposta for [{id: 1, nome: "Porcelanato"}, ...]
            descricoesBaseDaAPI = response.data.map(item => item.detalhe);
            // Se a API retorna um array de strings diretamente: descricoesBaseDaAPI = response.data;
        }

        const salvos = JSON.parse(localStorage.getItem('descricoesSalvas') || '[]');
        
        // Combina a lista da API com os itens salvos localmente
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
  }, []); // Dependência vazia: roda apenas uma vez na montagem

  const filtered = items.filter(i =>
    i.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    const novo = prompt("Digite a nova descrição:");
    if (novo && !items.includes(novo)) {
      const atualizados = [...items, novo];
      setItems(atualizados);
      
      // Filtra os itens da base antes de salvar no localStorage
      const itensSalvos = atualizados.filter(x => !descricoesBaseDaAPI.includes(x));
      localStorage.setItem('descricoesSalvas', JSON.stringify(itensSalvos));
      onAdd(novo);
    }
  };

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    // ... restante do seu código JSX ...
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
        {items.length === 0 && <p className="text-muted small text-center py-2">Carregando descrições...</p>}
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
        {filtered.length === 0 && items.length > 0 && (
          <div className="text-muted small text-center py-2">
            Nenhum resultado encontrado
          </div>
        )}
      </div>
      <button
        className="btn btn-sm btn-outline-primary mt-2 w-100"
        onClick={handleAdd}
      >
        <IoIosAddCircle style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Adicionar Nova
      </button>
    </div>
  );
}