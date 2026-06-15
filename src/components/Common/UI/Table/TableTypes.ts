import type { ReactNode, TableHTMLAttributes } from 'react'

/**
 * Shape of a single cell your `Table` implementation receives for headers, rows, and footers.
 *
 * @public
 */
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

/**
 * Shape of a single row your `Table` implementation receives, containing an ordered list of cells.
 *
 * @public
 */
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

/**
 * Props your `Table` implementation must accept from the component adapter.
 * Renders a table with column headers, body rows, an optional footer row, and an optional empty state.
 *
 * @public
 * @group Component Props
 */
export interface TableProps extends Pick<
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
  /**
   * Removes borders and background for use inside a Box component
   *
   * @defaultValue `false`
   */
  isWithinBox?: boolean
  /**
   * Whether the first column contains checkboxes (affects which column gets leading variant)
   *
   * @defaultValue `false`
   */
  hasCheckboxColumn?: boolean
}

/**
 * Default prop values for the Table component.
 *
 * @internal
 */
export const TableDefaults = {
  isWithinBox: false,
  hasCheckboxColumn: false,
} as const satisfies Partial<TableProps>
