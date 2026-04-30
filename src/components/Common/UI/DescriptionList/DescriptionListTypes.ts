import type { ReactNode } from 'react'

export interface DescriptionListItem {
  term: ReactNode | ReactNode[]
  description: ReactNode | ReactNode[]
}

export interface DescriptionListProps {
  items: DescriptionListItem[]
  layout?: 'stacked' | 'horizontal'
  showSeparators?: boolean
  className?: string
}

export const DescriptionListDefaults = {
  layout: 'stacked',
  showSeparators: true,
} as const satisfies Partial<DescriptionListProps>
