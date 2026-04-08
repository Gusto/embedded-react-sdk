import type { ReactNode } from 'react'

export interface BoxHeaderProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const BoxHeaderDefaults = {
  headingLevel: 'h3',
} as const satisfies Partial<BoxHeaderProps>
