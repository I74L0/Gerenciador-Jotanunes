import React, { useRef, useState, useEffect } from 'react';
import prefacioIcon from '../../../assets/images/pen-toolIcon.png';
import unidadesIcon from '../../../assets/images/inIcon.png';
import areaComumIcon from '../../../assets/images/outIcon.png';
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

  const [iconFailed, setIconFailed] = useState(() => new Array(tabIcons.length).fill(false));

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
    <ul className="tabs" ref={menuRef}>
      {tabTitles.map((title, index) => {
        let mobileContent
        if (index === activeIndex) {
          mobileContent = title
        } else if (iconFailed[index]) {
          mobileContent = tabAbbreviations[index]
        } else {
          mobileContent = (
            <img
              src={tabIcons[index]}
              alt={title}
              className="tab-icon"
              style={{ width: 22, height: 22, objectFit: 'contain' }}
              onError={() => setIconFailed(prev => {
                const copy = [...prev]
                copy[index] = true
                return copy
              })}
            />
          )
        }

        return (
          <li
            key={index}
            className={index === activeIndex ? 'active' : ''}
            onClick={() => clickItem(index)}
          >
            {isMobile ? mobileContent : title}
          </li>
        )
      })}
    </ul>
  );
}

export default MenuTabs;