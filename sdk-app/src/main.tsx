import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { App } from './App'
import { Home } from './Home'
import { RoutedComponentRenderer } from './RoutedComponentRenderer'
import { DesignLayout } from './design/DesignLayout'
import { DesignHome } from './design/DesignHome'
import { ComponentShowcase } from './design/prototypes/component-showcase'
import { ContractorManagementFlow } from './design/prototypes/contractor-management/ContractorManagementFlow'
import { ContractorList } from './design/prototypes/contractor-management/ContractorList'
import { ContractorProfile } from './design/prototypes/contractor-management/ContractorProfile'
import { ContractorDismiss } from './design/prototypes/contractor-management/ContractorDismiss'
import { ContractorRehire } from './design/prototypes/contractor-management/ContractorRehire'
import { AddContractor } from './design/prototypes/contractor-management/AddContractor'
import {
  ContractorSelfOnboarding,
  ContractorSelfOnboardingStates,
} from './design/prototypes/contractor-self-onboarding'
import { ContractorManagementStates } from './design/prototypes/contractor-management'
import {
  CompensationHistoryPrototype,
  CompensationHistoryStates,
} from './design/prototypes/employee-management/CompensationHistory'
import {
  EmployeeManagementFlow,
  EmployeeList as EmployeeManagementList,
  RehireEmployee as EmployeeManagementRehire,
  EmployeeManagementStates,
} from './design/prototypes/employee-management/EmployeeManagement'
import {
  RegularRateOfPayPrototype,
  RegularRateOfPayStates,
} from './design/prototypes/regular-rate-of-pay'
import {
  CreateHistoricalPaymentPrototype,
  CreateHistoricalPaymentStates,
} from './design/prototypes/contractor-payments/CreateHistoricalPayment'
import {
  StateTaxesWithFutureRatesPrototype,
  StateTaxesWithFutureRatesStates,
} from './design/prototypes/company-onboarding/StateTaxesWithFutureRates'
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
              {
                path: 'component-states',
                children: [
                  { index: true, element: <ContractorManagementStates /> },
                  {
                    path: ':componentSlug/:configSlug',
                    element: <ContractorManagementStates />,
                  },
                ],
              },
              { path: ':contractorId', element: <ContractorProfile /> },
              { path: ':contractorId/dismiss', element: <ContractorDismiss /> },
              { path: ':contractorId/rehire', element: <ContractorRehire /> },
            ],
          },
          {
            path: 'contractor-self-onboarding',
            children: [
              { index: true, element: <ContractorSelfOnboarding /> },
              {
                path: 'component-states',
                children: [
                  { index: true, element: <ContractorSelfOnboardingStates /> },
                  {
                    path: ':componentSlug/:configSlug',
                    element: <ContractorSelfOnboardingStates />,
                  },
                ],
              },
            ],
          },
          {
            path: 'employee-management',
            element: <EmployeeManagementFlow />,
            children: [
              { index: true, element: <EmployeeManagementList /> },
              { path: ':employeeId/rehire', element: <EmployeeManagementRehire /> },
              {
                path: 'component-states',
                children: [
                  { index: true, element: <EmployeeManagementStates /> },
                  {
                    path: ':componentSlug/:configSlug',
                    element: <EmployeeManagementStates />,
                  },
                ],
              },
            ],
          },
          {
            path: 'regular-rate-of-pay',
            children: [
              { index: true, element: <RegularRateOfPayPrototype /> },
              {
                path: 'component-states',
                children: [
                  { index: true, element: <RegularRateOfPayStates /> },
                  {
                    path: ':componentSlug/:configSlug',
                    element: <RegularRateOfPayStates />,
                  },
                ],
              },
            ],
          },
          {
            path: 'create-historical-payment',
            children: [
              { index: true, element: <CreateHistoricalPaymentPrototype /> },
              {
                path: 'component-states',
                children: [
                  { index: true, element: <CreateHistoricalPaymentStates /> },
                  {
                    path: ':componentSlug/:configSlug',
                    element: <CreateHistoricalPaymentStates />,
                  },
                ],
              },
            ],
          },
          {
            path: 'state-taxes-with-future-rates',
            children: [
              { index: true, element: <StateTaxesWithFutureRatesPrototype /> },
              {
                path: 'component-states',
                children: [
                  { index: true, element: <StateTaxesWithFutureRatesStates /> },
                  {
                    path: ':componentSlug/:configSlug',
                    element: <StateTaxesWithFutureRatesStates />,
                  },
                ],
              },
            ],
          },
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
