import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

export interface EmployeeItem {
  uuid: string
  firstName?: string | null
  lastName?: string | null
  jobTitle?: string | null
  department?: string | null
  balance?: string | null
}

export interface SelectEmployeesProps {
  employees: EmployeeItem[]
  selectedUuids: Set<string>
  searchValue: string
  onSelect: (item: EmployeeItem, checked: boolean) => void
  onSearchChange: (value: string) => void
  onSearchClear: () => void
  onBack: () => void
  onContinue: () => void
  showReassignmentWarning: boolean
  balances?: Record<string, string>
  onBalanceChange?: (uuid: string, value: string) => void
  pagination?: PaginationControlProps
  isFetching?: boolean
}
