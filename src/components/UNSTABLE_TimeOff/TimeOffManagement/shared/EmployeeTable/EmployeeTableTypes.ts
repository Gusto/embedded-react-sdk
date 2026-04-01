import type { ReactNode } from 'react'
import type { useDataViewProp, SelectionMode } from '@/components/Common/DataView/useDataView'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

export interface EmployeeTableItem {
  firstName?: string | null
  lastName?: string | null
  jobTitle?: string | null
}

export interface EmployeeTableProps<T extends EmployeeTableItem> {
  data: T[]
  label?: string
  additionalColumns?: useDataViewProp<T>['columns']

  searchValue: string
  onSearchChange: (value: string) => void
  onSearchClear: () => void
  searchPlaceholder?: string

  selectionMode?: SelectionMode
  onSelect?: (item: T, checked: boolean) => void
  isItemSelected?: (item: T, index: number) => boolean

  itemMenu?: (item: T) => ReactNode

  pagination?: PaginationControlProps
  isFetching?: boolean

  emptyState?: () => ReactNode
  emptySearchState?: () => ReactNode

  footer?: useDataViewProp<T>['footer']
}
