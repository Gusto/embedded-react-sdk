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
 * Sort state and handlers a sortable header cell carries, which your
 * {@link TableProps | Table} implementation uses to render that column's sort affordance.
 *
 * @remarks
 * Every handler takes no arguments and returns nothing, so each one can be passed straight to an
 * `onClick`. Render whichever affordance suits your design system: a single control wired to
 * {@link TableSortControls.onSort | onSort}, or separate controls wired to
 * {@link TableSortControls.onSortAscending | onSortAscending},
 * {@link TableSortControls.onSortDescending | onSortDescending}, and
 * {@link TableSortControls.onClearSort | onClearSort}.
 *
 * A sortable column should be activatable by both pointer and keyboard, and should report
 * {@link TableSortControls.sortDirection | sortDirection} to assistive technology via `aria-sort`.
 *
 * @public
 * @childOf {@link TableProps}
 */
export interface TableSortControls {
  /**
   * Marks this header cell as sortable
   */
  isSortable: true
  /**
   * Direction this column is currently sorted in, or `'none'` while the data is in its default
   * order or is sorted by a different column
   */
  sortDirection: TableSortDirection | 'none'
  /**
   * Advances this column to the next sort in the cycle: `'none'` to `'ascending'` to
   * `'descending'` and back to `'none'`
   */
  onSort: () => void
  /**
   * Sorts this column in ascending order
   */
  onSortAscending: () => void
  /**
   * Sorts this column in descending order
   */
  onSortDescending: () => void
  /**
   * Clears the sort, returning the data to its default order
   */
  onClearSort: () => void
}

/**
 * Shape of a single header cell your {@link TableProps | Table} implementation receives.
 * Extends {@link TableData} with the column's sort state when the column is sortable.
 *
 * @remarks
 * A header cell either omits `isSortable` (or sets it to `false`), in which case it carries nothing
 * beyond {@link TableData}, or sets `isSortable: true` and carries the full
 * {@link TableSortControls} alongside it.
 *
 * @public
 * @childOf {@link TableProps}
 */
export type TableHeaderData = TableData & ({ isSortable?: false } | TableSortControls)

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
   * Array of header cells for the table. A cell with `isSortable: true` also carries the
   * {@link TableSortControls} for that column.
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
