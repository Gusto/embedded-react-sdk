import { within } from '@testing-library/react'
import { assertDefined } from './assertions'

/**
 * The cell in `row` under the column titled `headerName`, scoped to `table` (so same-named
 * columns in a different table on the same screen can't be matched by mistake).
 *
 * `DataTable` renders the first column of every row as `role="rowheader"` and the rest as
 * `role="gridcell"`, so the header's position has to be translated into the right query for
 * whichever role actually lives at that index.
 */
export function getCellByColumnHeader(
  table: HTMLElement,
  row: HTMLElement,
  headerName: string,
): HTMLElement {
  const headers = within(table).getAllByRole('columnheader')
  const columnIndex = headers.findIndex(header => header.textContent === headerName)
  if (columnIndex === -1) {
    throw new Error(`No column header "${headerName}" found in table`)
  }

  if (columnIndex === 0) {
    return within(row).getByRole('rowheader')
  }
  const cell = within(row).getAllByRole('gridcell')[columnIndex - 1]
  assertDefined(cell)
  return cell
}
