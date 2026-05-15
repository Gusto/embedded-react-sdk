import type { ReactNode } from 'react'
import type { useDataViewProp, SelectionMode } from '@/components/Common/DataView/useDataView'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

export interface EmployeeTableItem {
  uuid: string
  firstName?: string | null
  lastName?: string | null
  jobTitle?: string | null
}

export interface EmployeeTableProps<T extends EmployeeTableItem> {
  data: T[]
  label?: string
  additionalColumns?: useDataViewProp<T>['columns']
  hideJobTitle?: boolean

  searchValue: string
  onSearchChange: (value: string) => void
  onSearchClear: () => void
  searchPlaceholder?: string
  hideSearch?: boolean

  selectionMode?: SelectionMode
  onSelect?: (item: T, checked: boolean) => void
  onSelectAll?: (checked: boolean, visibleItems: T[]) => void
  getIsItemSelected?: (item: T) => boolean
  hideSelectAll?: boolean

  itemMenu?: (item: T) => ReactNode

  pagination?: PaginationControlProps
  isFetching?: boolean

  emptyState?: () => ReactNode
  emptySearchState?: () => ReactNode

  footer?: useDataViewProp<T>['footer']
}
