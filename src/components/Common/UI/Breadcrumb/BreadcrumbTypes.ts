import type { ReactNode } from 'react'

export interface Crumb {
  label: ReactNode
  isCurrent?: boolean
  href?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}

export interface BreadcrumbsProps {
  crumbs: Crumb[]
  className?: string
}
