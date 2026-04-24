import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilBuilding, cilUser, cilLockLocked } from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavTitle,
    name: 'Gerenciador de Ativos',
  },
  {
    component: CNavItem,
    name: 'Obras',
    to: '/index',
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Conta',
  },
  {
    component: CNavItem,
    name: 'Perfil',
    to: '/perfil',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Alterar Senha',
    to: '/alterar-senha',
    icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
  },
]

export default _nav
