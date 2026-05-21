import type { DesignSystem } from './DesignSystemContext'

export interface DesignSystemOption {
  id: DesignSystem
  label: string
  logo: string
  available: boolean
}

export const DESIGN_SYSTEM_OPTIONS: DesignSystemOption[] = [
  { id: 'default', label: 'Gusto Default', logo: '🎨', available: true },
  { id: 'native', label: 'Native HTML', logo: '🌐', available: true },
  { id: 'cx-portal', label: 'CX Portal', logo: '🏢', available: true },
]
