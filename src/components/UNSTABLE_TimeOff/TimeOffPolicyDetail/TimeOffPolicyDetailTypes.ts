import type { ReactNode } from 'react'
import type {
  EmployeeTableItem,
  EmployeeTableProps,
} from '../shared/EmployeeTable/EmployeeTableTypes'
import type {
  RemoveDialogState,
  BulkRemoveDialogState,
} from '../shared/PolicyDetailLayout/PolicyDetailLayoutTypes'

export type { BulkRemoveDialogState }

export interface TimeOffPolicyDetailEmployee extends EmployeeTableItem {
  uuid: string
  balance: number | null
}

export type AccrualMethodKey =
  | 'unlimited'
  | 'perPayPeriod'
  | 'perCalendarYear'
  | 'perAnniversaryYear'
  | 'perHourWorked'
  | 'perHourWorkedNoOvertime'
  | 'perHourPaid'
  | 'perHourPaidNoOvertime'

export type PolicyTypeKey = 'vacation' | 'sick'

export interface PolicyDetails {
  policyType: PolicyTypeKey
  accrualMethod: AccrualMethodKey
  accrualRate?: number
  accrualRateUnit?: number
  resetDate?: string
}

export interface PolicySettingsDisplay {
  maxAccrualHoursPerYear: number | null
  maxHours: number | null
  carryoverLimitHours: number | null
  accrualWaitingPeriodDays: number | null
  paidOutOnTermination: boolean
}

export interface TimeOffPolicyDetailPresentationProps {
  title: string
  subtitle?: string
  onBack: () => void
  backLabel: string
  actions?: ReactNode[]

  policyDetails: PolicyDetails
  policySettings?: PolicySettingsDisplay
  onChangeSettings?: () => void

  selectedTabId: string
  onTabChange: (id: string) => void

  employees: Pick<
    EmployeeTableProps<TimeOffPolicyDetailEmployee>,
    | 'data'
    | 'searchValue'
    | 'onSearchChange'
    | 'onSearchClear'
    | 'searchPlaceholder'
    | 'itemMenu'
    | 'pagination'
    | 'isFetching'
    | 'emptyState'
    | 'selectionMode'
    | 'onSelect'
    | 'getIsItemSelected'
    | 'footer'
  >

  removeDialog: RemoveDialogState
  bulkRemoveDialog?: BulkRemoveDialogState
  successAlert?: string
  onDismissAlert?: () => void
}
