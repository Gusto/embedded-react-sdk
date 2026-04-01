import type { ReactNode } from 'react'

export interface BoxProps {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
  withPadding?: boolean
  className?: string
}

/** @deprecated Use BoxProps with header/footer/children instead of compound subcomponents */
export interface BoxSectionProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'flush'
}
