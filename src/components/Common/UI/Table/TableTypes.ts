import type { ReactNode, TableHTMLAttributes } from 'react'

export interface TableData {
  /**
   * Unique identifier for the table cell
   */
  key: string
  /**
   * Content to be displayed in the table cell
   */
  content: ReactNode
}

export interface TableRow {
  /**
   * Unique identifier for the table row
   */
  key: string
  /**
   * Array of cells to be displayed in the row
   */
  data: TableData[]
}

export interface TableProps
  extends Pick<
    TableHTMLAttributes<HTMLTableElement>,
    'className' | 'aria-label' | 'id' | 'role' | 'aria-labelledby' | 'aria-describedby'
  > {
  /**
   * Array of header cells for the table
   */
  headers: TableData[]
  /**
   * Array of rows to be displayed in the table
   */
  rows: TableRow[]
  /**
   * Array of footer cells for the table
   */
  footer?: TableData[]
  /**
   * Content to display when the table has no rows
   */
  emptyState?: ReactNode
}
