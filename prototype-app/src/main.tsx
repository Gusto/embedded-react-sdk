import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { App } from './App'
import { Home } from './Home'
import { ComponentShowcase } from './prototypes/component-showcase'
import { SampleFlowLayout } from './prototypes/sample-flow'
import { StepOne } from './prototypes/sample-flow/StepOne'
import { StepTwo } from './prototypes/sample-flow/StepTwo'
import '@/styles/sdk.scss'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'component-showcase', element: <ComponentShowcase /> },
      {
        path: 'sample-flow',
        element: <SampleFlowLayout />,
        children: [
          { index: true, element: <StepOne /> },
          { path: 'step-one', element: <StepOne /> },
          { path: 'step-two', element: <StepTwo /> },
        ],
      },
      // Add new prototype routes here
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
