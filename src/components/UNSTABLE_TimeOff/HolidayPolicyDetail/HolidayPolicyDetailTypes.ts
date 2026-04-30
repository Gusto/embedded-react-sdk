import type { ReactNode } from 'react'
import type { HolidayItem } from '../HolidaySelectionForm/HolidaySelectionFormTypes'
import type {
  EmployeeTableItem,
  EmployeeTableProps,
} from '../shared/EmployeeTable/EmployeeTableTypes'
import type { RemoveDialogState } from '../shared/PolicyDetailLayout/PolicyDetailLayoutTypes'

export interface HolidayPolicyDetailEmployee extends EmployeeTableItem {
  uuid: string
}

export interface HolidayPolicyDetailPresentationProps {
  title: string
  subtitle?: string
  onBack: () => void
  backLabel: string
  actions?: ReactNode[]

  holidays: HolidayItem[]

  selectedTabId: string
  onTabChange: (id: string) => void

  employees: Pick<
    EmployeeTableProps<HolidayPolicyDetailEmployee>,
    | 'data'
    | 'searchValue'
    | 'onSearchChange'
    | 'onSearchClear'
    | 'searchPlaceholder'
    | 'itemMenu'
    | 'pagination'
    | 'isFetching'
    | 'emptyState'
  >

  removeDialog: RemoveDialogState
  successAlert?: string
  onDismissAlert?: () => void
}
