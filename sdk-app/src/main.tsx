import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { App } from './App'
import { Home } from './Home'
import { RoutedComponentRenderer } from './RoutedComponentRenderer'
import './app.scss'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: ':category/:component', element: <RoutedComponentRenderer /> },
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
