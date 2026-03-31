import type { ReactNode } from 'react'

export interface BoxProps {
  children: ReactNode
  className?: string
}

export interface BoxSectionProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'flush'
}
