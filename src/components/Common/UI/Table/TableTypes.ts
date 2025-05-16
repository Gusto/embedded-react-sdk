import type { ReactNode, TableHTMLAttributes } from 'react'

export interface TableData {
  key: string
  content: ReactNode
}

export interface TableRow {
  key: string
  data: TableData[]
}

export interface TableProps
  extends Pick<
    TableHTMLAttributes<HTMLTableElement>,
    'className' | 'aria-label' | 'id' | 'role' | 'aria-labelledby' | 'aria-describedby'
  > {
  headers: TableData[]
  rows: TableRow[]
  emptyState?: ReactNode
}
