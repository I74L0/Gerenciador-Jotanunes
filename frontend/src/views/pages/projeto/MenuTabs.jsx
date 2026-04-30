import React from 'react';
import { CNav, CNavItem, CNavLink } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPen, cilHouse, cilVector, cilLayers, cilInfo } from '@coreui/icons';

const MenuTabs = ({ activeIndex = 0, onChange = () => {} }) => {
  const tabs = [
    { title: "Prefácio", icon: cilPen },
    { title: "Unidades Privativas", icon: cilHouse },
    { title: "Área Comum", icon: cilVector },
    { title: "Materiais", icon: cilLayers },
    { title: "Observações", icon: cilInfo }
  ];

  return (
    <CNav variant="pills" className="flex-nowrap overflow-auto prj-tabs hide-scrollbar py-2">
      {tabs.map((tab, index) => (
        <CNavItem key={index}>
          <CNavLink 
            active={activeIndex === index}
            onClick={() => onChange(index)}
            style={{ 
              cursor: 'pointer', 
              whiteSpace: 'nowrap', 
              color: activeIndex === index ? '#fff' : '#6c757d',
              backgroundColor: activeIndex === index ? '#BC1F1B' : 'transparent',
              borderRadius: '20px',
              padding: '0.5rem 1rem',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            className="d-flex align-items-center gap-2 me-2"
          >
            <CIcon icon={tab.icon} size="sm" />
            <span className="d-none d-sm-inline">{tab.title}</span>
            <span className="d-inline d-sm-none" title={tab.title}>{tab.title.split(' ')[0]}</span>
          </CNavLink>
        </CNavItem>
      ))}
    </CNav>
  );
}

export default MenuTabs;