import type { ComponentType, ReactNode } from 'react'

export interface DemoChromeProps {
  children: ReactNode
  onOpenSettings: () => void
}

export interface DemoChromeEntry {
  id: string
  label: string
  description: string
  Chrome: ComponentType<DemoChromeProps>
}
