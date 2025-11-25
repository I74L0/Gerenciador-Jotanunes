import React, { useRef, useState, useEffect } from 'react';
import prefacioIcon from '../../../assets/images/pen-toolIcon.png';
import unidadesIcon from '../../../assets/images/UnidadesPrivativasIcon.svg';
import areaComumIcon from '../../../assets/images/AreaComumIcon.svg';
import materiaisIcon from '../../../assets/images/brickIcon.png';
import observacoesIcon from '../../../assets/images/infoIcon.ico';

const MenuTabs = ({ activeIndex = 0, onChange = () => {} }) => {
  const menuRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const tabTitles = [
    "Prefácio",
    "Unidades Privativas",
    "Área Comum",
    "Materiais",
    "Observações"
  ];

  const tabIcons = [
    prefacioIcon,
    unidadesIcon,
    areaComumIcon,
    materiaisIcon,
    observacoesIcon
  ];

  // Detecta mudanças no tamanho da viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    // Executar na montagem
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function clickItem(i) {
    if (i === activeIndex) return;
    
    if (menuRef.current) {
      menuRef.current.style.removeProperty('--timeOut');
    }
    
    onChange(i); 
  }

  return (
    <ul className="tabs header__menu__tabs" ref={menuRef}>
      {tabTitles.map((title, index) => (
        <li 
          key={index}
          className={index === activeIndex ? 'active' : ''}
          onClick={() => clickItem(index)}
        >
          {isMobile ? (index + 1).toString() : title}
        </li>
      ))}
    </ul>
  );
}

export default MenuTabs;