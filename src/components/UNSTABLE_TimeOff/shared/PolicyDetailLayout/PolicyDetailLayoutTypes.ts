import type { ReactNode } from 'react'
import type { EmployeeTableItem, EmployeeTableProps } from '../EmployeeTable/EmployeeTableTypes'

export interface RemoveDialogState {
  isOpen: boolean
  employeeName: string
  onConfirm: () => void
  onClose: () => void
  isPending: boolean
}

export interface PolicyDetailLayoutProps<T extends EmployeeTableItem> {
  title: string
  subtitle?: string
  onBack: () => void
  backLabel: string
  actions?: ReactNode

  firstTab: {
    id: string
    label: string
    content: ReactNode
  }
  selectedTabId: string
  onTabChange: (id: string) => void

  employees: Pick<
    EmployeeTableProps<T>,
    | 'data'
    | 'searchValue'
    | 'onSearchChange'
    | 'onSearchClear'
    | 'searchPlaceholder'
    | 'itemMenu'
    | 'pagination'
    | 'isFetching'
    | 'emptyState'
    | 'additionalColumns'
  >

  removeDialog: RemoveDialogState
  successAlert?: string
  onDismissAlert?: () => void
}
