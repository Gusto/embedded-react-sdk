import type { PaidTimeOff } from '@gusto/embedded-api/models/components/paidtimeoff'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

export interface EmployeeItem {
  uuid: string
  firstName?: string | null
  lastName?: string | null
  jobTitle?: string | null
  department?: string | null
  balance?: string | null
  eligiblePaidTimeOff?: PaidTimeOff[]
}

export interface SelectEmployeesPresentationProps {
  employees: EmployeeItem[]
  selectedUuids: Set<string>
  searchValue: string
  onSelect: (item: EmployeeItem, checked: boolean) => void
  onSelectAll?: (checked: boolean, visibleItems: EmployeeItem[]) => void
  onSearchChange: (value: string) => void
  onSearchClear: () => void
  onBack: () => void
  onContinue: () => void
  showReassignmentWarning: boolean
  isHolidayPolicy?: boolean
  policyTypeLabel?: string
  balances?: Record<string, string>
  onBalanceChange?: (uuid: string, value: string) => void
  pagination?: PaginationControlProps
  isFetching?: boolean
  /** Disables the back button and shows a spinner on the continue button while a submit is in flight. */
  isPending?: boolean
}
