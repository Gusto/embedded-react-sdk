import type { ReactElement } from 'react'

export interface ReorderableListItem {
  content: ReactElement
  label: string
  id?: string
}
