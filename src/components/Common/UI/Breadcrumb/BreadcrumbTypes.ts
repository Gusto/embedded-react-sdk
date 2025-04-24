import type { ReactNode } from 'react'

export interface BreadcrumbsProps {
  children: ReactNode
  className?: string
}

export interface BreadcrumbProps {
  children: ReactNode
  className?: string
  isCurrent?: boolean
  href?: string
  onClick?: () => void
}
