import React, { useRef } from 'react';

const MenuTabs = ({ activeIndex = 0, onChange = () => {} }) => {
  const menuRef = useRef(null);

  const tabTitles = [
    "Prefácio",
    "Unidades Privativas",
    "Área Comum",
    "Materiais",
    "Observações"
  ];

  function clickItem(i) {
    if (i === activeIndex) return;
    
    if (menuRef.current) {
      menuRef.current.style.removeProperty('--timeOut');
    }
    
    onChange(i); 
  }

  return (
    <>
      <section className="wrapper">
        <ul className="tabs p-0" ref={menuRef}>
          {tabTitles.map((title, index) => (
            <li 
              key={index}
              className={index === activeIndex ? 'active' : ''}
              onClick={() => clickItem(index)}
            >
              {title}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default MenuTabs;