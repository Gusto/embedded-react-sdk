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
import { ContractorRehire } from './design/prototypes/contractor-management/ContractorRehire'
import { AddContractor } from './design/prototypes/contractor-management/AddContractor'
import { ContractorSelfOnboarding } from './design/prototypes/contractor-self-onboarding'
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
              { path: 'add', element: <AddContractor /> },
              { path: 'add/:contractorId', element: <AddContractor /> },
              { path: ':contractorId', element: <ContractorProfile /> },
              { path: ':contractorId/dismiss', element: <ContractorDismiss /> },
              { path: ':contractorId/rehire', element: <ContractorRehire /> },
            ],
          },
          { path: 'contractor-self-onboarding', element: <ContractorSelfOnboarding /> },
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
