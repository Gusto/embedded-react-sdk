import type { ReactNode } from 'react'
import type { useDataViewProp, SelectionMode } from '@/components/Common/DataView/useDataView'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

/**
 * Minimum shape an employee row must satisfy to be rendered in the shared employee table.
 *
 * Extend this interface to add fields specific to a given policy detail view.
 *
 * @public
 */
export interface EmployeeTableItem {
  /** Unique identifier for the employee. */
  uuid: string
  /** Employee's first name; combined with `lastName` to render the name column. */
  firstName?: string | null
  /** Employee's last name; combined with `firstName` to render the name column. */
  lastName?: string | null
  /** Employee's job title; rendered in its own column unless `hideJobTitle` is set. */
  jobTitle?: string | null
}

/**
 * Props for the shared employee table rendered inside time-off and holiday policy detail views.
 *
 * @typeParam T - The employee row shape, which must extend {@link EmployeeTableItem}.
 * @public
 */
export interface EmployeeTableProps<T extends EmployeeTableItem> {
  /** Employee rows to render. */
  data: T[]
  /** Accessible label for the underlying data view; defaults to a localized table label. */
  label?: string
  /** Additional columns appended after the name and job title columns. */
  additionalColumns?: useDataViewProp<T>['columns']
  /** When true, omits the job title column. */
  hideJobTitle?: boolean

  /** Current value of the search input. */
  searchValue: string
  /** Called when the search input value changes. */
  onSearchChange: (value: string) => void
  /** Called when the search input is cleared. */
  onSearchClear: () => void
  /** Placeholder text for the search input; defaults to a localized placeholder. */
  searchPlaceholder?: string
  /** When true, hides the search input entirely. */
  hideSearch?: boolean

  /** Selection behavior for the table (e.g. single or multi-select). */
  selectionMode?: SelectionMode
  /** Called when an individual row is selected or deselected. */
  onSelect?: (item: T, checked: boolean) => void
  /** Called when the select-all checkbox is toggled; receives the items currently visible. */
  onSelectAll?: (checked: boolean, visibleItems: T[]) => void
  /** Returns whether the given item is currently selected. */
  getIsItemSelected?: (item: T) => boolean
  /** When true, hides the select-all checkbox even if selection is enabled. */
  hideSelectAll?: boolean

  /** Renders a row-level menu (e.g. a kebab menu) for the given item. */
  itemMenu?: (item: T) => ReactNode

  /** Pagination control props passed through to the underlying data view. */
  pagination?: PaginationControlProps
  /** When true, renders the loading state instead of the rows. */
  isFetching?: boolean

  /** Renders a custom empty state when `data` is empty and there is no active search. */
  emptyState?: () => ReactNode
  /** Renders a custom empty state when a search returns no results; falls back to a localized default. */
  emptySearchState?: () => ReactNode

  /** Footer content rendered below the rows. */
  footer?: useDataViewProp<T>['footer']
}
