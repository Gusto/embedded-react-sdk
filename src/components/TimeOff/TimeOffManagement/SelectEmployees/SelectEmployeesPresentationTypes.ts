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

export interface RemoveConfirmDialogState {
  isOpen: boolean
  count: number
  onConfirm: () => void
  onClose: () => void
  isPending?: boolean
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
  policyTypeLabel?: string
  balances?: Record<string, string>
  onBalanceChange?: (uuid: string, value: string) => void
  pagination?: PaginationControlProps
  isFetching?: boolean
  /** UUIDs of employees already on the policy. These render with read-only balances and cannot have their balance edited from this screen. */
  originallyOnPolicyUuids?: Set<string>
  /** Current policy balances keyed by employee uuid. Used to render read-only balance text for originally-on-policy employees. */
  originalBalances?: Record<string, string>
  /** Optional confirm dialog shown before submitting when the user is about to remove employees from the policy. */
  removeConfirmDialog?: RemoveConfirmDialogState
  addConfirmDialog?: RemoveConfirmDialogState
  /** Disables the back button and shows a spinner on the continue button while a submit is in flight. */
  isPending?: boolean
}
