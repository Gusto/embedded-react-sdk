import type { ReactNode } from 'react'

export interface DescriptionListItem {
  term: ReactNode | ReactNode[]
  description: ReactNode | ReactNode[]
}

export interface DescriptionListProps {
  items: DescriptionListItem[]
  className?: string
}

export const DescriptionListDefaults = {} as const satisfies Partial<DescriptionListProps>
