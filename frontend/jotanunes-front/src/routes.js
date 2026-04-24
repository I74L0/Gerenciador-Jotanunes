import React from 'react'

const Index = React.lazy(() => import('./views/pages/index/Index'))
const Projeto = React.lazy(() => import('./views/pages/projeto/Projeto'))
const Perfil = React.lazy(() => import('./views/pages/perfil/Perfil'))
const AlterarSenha = React.lazy(() => import('./views/pages/perfil/AlterarSenha'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/index', name: 'Obras', element: Index },
  { path: '/projeto/:id?', name: 'Projeto', element: Projeto },
  { path: '/perfil', name: 'Perfil', element: Perfil },
  { path: '/alterar-senha', name: 'Alterar Senha', element: AlterarSenha },
]

export default routes
