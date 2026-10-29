import type { TableSortControls, TableSortDirection } from '../UI/Table/TableTypes'

/**
 * Which column a `DataView` is sorted by, and in which direction. Absent while the data is in its
 * default order.
 *
 * @internal
 */
export interface TableSortDescriptor {
  /** `key` of the column the data is currently sorted by. */
  columnKey: string
  /** Direction the sorted column is ordered in. */
  direction: TableSortDirection
}

const NEXT_DIRECTION = {
  none: 'ascending',
  ascending: 'descending',
  descending: 'none',
} as const satisfies Record<TableSortDirection | 'none', TableSortDirection | 'none'>

/**
 * Builds the sort state and handlers for one sortable column, so the desktop table, the mobile
 * cards, and a partner's own table all cycle through the same sorts in the same order.
 *
 * @param columnKey - `key` of the column these controls belong to.
 * @param current - The sort currently applied to the data, if any.
 * @param onSortChange - Receives the sort to move to, or `undefined` to return to the default order.
 * @returns Controls to hand to the column's header cell.
 * @internal
 */
export function getSortControls(
  columnKey: string,
  current: TableSortDescriptor | undefined,
  onSortChange: (sortDescriptor: TableSortDescriptor | undefined) => void,
): TableSortControls {
  const sortDirection = current?.columnKey === columnKey ? current.direction : 'none'
  const sortTo = (direction: TableSortDirection | 'none') => () => {
    onSortChange(direction === 'none' ? undefined : { columnKey, direction })
  }

  return {
    isSortable: true,
    sortDirection,
    onSort: sortTo(NEXT_DIRECTION[sortDirection]),
    onSortAscending: sortTo('ascending'),
    onSortDescending: sortTo('descending'),
    onClearSort: sortTo('none'),
  }
}
