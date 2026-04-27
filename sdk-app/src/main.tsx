import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { App } from './App'
import { Home } from './Home'
import { RoutedComponentRenderer } from './RoutedComponentRenderer'
import { DesignLayout } from './design/DesignLayout'
import { DesignHome } from './design/DesignHome'
import { ComponentShowcase } from './design/prototypes/component-showcase'
import { ContractorManagementFlow } from './design/prototypes/contractor-management/ContractorManagementFlow'
import ContractorList from './design/prototypes/contractor-management/ContractorList'
import { ContractorProfile } from './design/prototypes/contractor-management/ContractorProfile'
import { ContractorDismiss } from './design/prototypes/contractor-management/ContractorDismiss'
import './app.scss'
import '@/styles/sdk.scss'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: ':category/:component', element: <RoutedComponentRenderer /> },
      {
        path: 'design',
        element: <DesignLayout />,
        children: [
          { index: true, element: <DesignHome /> },
          { path: 'component-showcase', element: <ComponentShowcase /> },
          {
            path: 'contractor-management',
            element: <ContractorManagementFlow />,
            children: [
              { index: true, element: <ContractorList /> },
              { path: ':contractorId', element: <ContractorProfile /> },
              { path: ':contractorId/dismiss', element: <ContractorDismiss /> },
            ],
          },
        ],
      },
    ],
  },
])

const container = document.getElementById('root')
if (container) {
  createRoot(container).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
