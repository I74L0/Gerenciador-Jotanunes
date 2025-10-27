import React, { Suspense } from 'react'
import { Outlet } from 'react-router-dom' 
import { CContainer, CSpinner } from '@coreui/react'

const AppContent = () => {
  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Outlet />
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)