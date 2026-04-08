import type { ReactNode } from 'react'

export interface BoxProps {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
  withPadding?: boolean
  className?: string
}
