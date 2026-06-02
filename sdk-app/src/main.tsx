import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { App } from './App'
import { Home } from './Home'
import { RoutedComponentRenderer } from './RoutedComponentRenderer'
import { DesignLayout } from './design/DesignLayout'
import { DesignHome } from './design/DesignHome'
import { ComponentShowcase } from './design/prototypes/component-showcase'
import { ContractorManagementFlow } from './design/prototypes/contractor-management/contractor-profile/ContractorManagementFlow'
import { ContractorListRoute } from './design/prototypes/contractor-management/ContractorListRoute'
import { ContractorProfile } from './design/prototypes/contractor-management/contractor-profile/ContractorProfile'
import { ContractorDismissRoute } from './design/prototypes/contractor-management/ContractorDismissRoute'
import { ContractorRehireRoute } from './design/prototypes/contractor-management/ContractorRehireRoute'
import { AddContractor } from './design/prototypes/contractor-management/AddContractor'
import { ContractorSelfOnboarding } from './design/prototypes/contractor-management/self-onboarding'
import { ContractorManagementStates } from './design/prototypes/contractor-management'
import { MockedEntitiesOutlet } from './design/prototypes/MockedEntitiesOutlet'
import {
  CompensationHistoryPrototype,
  CompensationHistoryStates,
} from './design/prototypes/employee-management/CompensationHistory'
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
              { index: true, element: <ContractorListRoute /> },
              { path: 'add', element: <AddContractor /> },
              { path: 'add/:contractorId', element: <AddContractor /> },
              {
                path: 'component-states',
                element: <MockedEntitiesOutlet />,
                children: [
                  { index: true, element: <ContractorManagementStates /> },
                  {
                    path: ':componentSlug/:configSlug',
                    element: <ContractorManagementStates />,
                  },
                ],
              },
              { path: ':contractorId', element: <ContractorProfile /> },
              { path: ':contractorId/dismiss', element: <ContractorDismissRoute /> },
              { path: ':contractorId/rehire', element: <ContractorRehireRoute /> },
            ],
          },
          { path: 'contractor-self-onboarding', element: <ContractorSelfOnboarding /> },
          {
            path: 'employee-compensation-history',
            children: [
              { index: true, element: <Navigate to="prototype" replace /> },
              { path: 'prototype', element: <CompensationHistoryPrototype /> },
              {
                path: 'component-states',
                children: [
                  { index: true, element: <CompensationHistoryStates /> },
                  {
                    path: ':componentSlug/:configSlug',
                    element: <CompensationHistoryStates />,
                  },
                ],
              },
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
