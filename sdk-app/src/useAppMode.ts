import { useLocation } from 'react-router-dom'

export type AppMode = 'preview' | 'design'

export function useAppMode(): AppMode {
  const location = useLocation()
  return location.pathname.startsWith('/design') ? 'design' : 'preview'
}
