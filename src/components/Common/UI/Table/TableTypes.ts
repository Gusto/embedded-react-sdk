import type { ReactNode, TableHTMLAttributes } from 'react'

/**
 * Shape of a single cell your {@link TableProps | Table} implementation receives for headers, rows, and footers.
 *
 * @public
 * @childOf {@link TableProps}
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
 * Direction a sorted column is ordered in.
 *
 * @public
 * @childOf {@link TableProps}
 */
export type TableSortDirection = 'ascending' | 'descending'

/**
 * Which column a {@link TableProps | Table} is sorted by, and in which direction.
 *
 * @public
 * @childOf {@link TableProps}
 */
export interface TableSortDescriptor {
  /**
   * `key` of the header cell the table is currently sorted by
   */
  columnKey: string
  /**
   * Direction the sorted column is ordered in
   */
  direction: TableSortDirection
}

/**
 * Shape of a single header cell your {@link TableProps | Table} implementation receives.
 * Extends {@link TableData} with the column's sortability.
 *
 * @public
 * @childOf {@link TableProps}
 */
export interface TableHeaderData extends TableData {
  /**
   * Whether this column can be sorted. Sortable columns should be activatable and should
   * report their sort state to assistive technology via `aria-sort`.
   *
   * @defaultValue `false`
   */
  isSortable?: boolean
}

/**
 * Shape of a single row your {@link TableProps | Table} implementation receives, containing an ordered list of cells.
 *
 * @public
 * @childOf {@link TableProps}
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
 * @group Component props
 */
export interface TableProps extends Pick<
  TableHTMLAttributes<HTMLTableElement>,
  'className' | 'aria-label' | 'id' | 'role' | 'aria-labelledby' | 'aria-describedby'
> {
  /**
   * Array of header cells for the table
   */
  headers: TableHeaderData[]
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
  /**
   * Column the table is currently sorted by. Omit while the data is in its default order.
   */
  sortDescriptor?: TableSortDescriptor
  /**
   * Called when a sortable column header is activated, with the sort the table should move to.
   * Omit to render sortable headers as plain, non-interactive headers.
   */
  onSortChange?: (sortDescriptor: TableSortDescriptor) => void
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
