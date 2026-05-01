import type { ReactNode } from 'react'
import type {
  EmployeeTableItem,
  EmployeeTableProps,
} from '../shared/EmployeeTable/EmployeeTableTypes'
import type {
  RemoveDialogState,
  BulkRemoveDialogState,
} from '../shared/PolicyDetailLayout/PolicyDetailLayoutTypes'

export interface TimeOffPolicyDetailEmployee extends EmployeeTableItem {
  uuid: string
  balance: number | null
}

export type RateBasedAccrualMethod =
  | 'perPayPeriod'
  | 'perCalendarYear'
  | 'perAnniversaryYear'
  | 'perHourWorked'
  | 'perHourWorkedNoOvertime'
  | 'perHourPaid'
  | 'perHourPaidNoOvertime'

export type AccrualMethodKey = 'unlimited' | RateBasedAccrualMethod

export type PolicyTypeKey = 'vacation' | 'sick'

interface UnlimitedPolicyDetails {
  policyType: PolicyTypeKey
  accrualMethod: 'unlimited'
}

interface RateBasedPolicyDetails {
  policyType: PolicyTypeKey
  accrualMethod: RateBasedAccrualMethod
  accrualRate: number
  accrualRateUnit?: number
  resetDate?: string
}

export type PolicyDetails = UnlimitedPolicyDetails | RateBasedPolicyDetails

export interface PolicySettingsDisplay {
  maxAccrualHoursPerYear: number | null
  maxHours: number | null
  carryoverLimitHours: number | null
  accrualWaitingPeriodDays: number | null
  paidOutOnTermination: boolean
}

interface TimeOffPolicyDetailPresentationBaseProps {
  title: string
  subtitle?: string
  onBack: () => void
  backLabel: string
  actions?: ReactNode[]

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

export type TimeOffPolicyDetailPresentationProps = TimeOffPolicyDetailPresentationBaseProps &
  (
    | {
        policyDetails: UnlimitedPolicyDetails
        policySettings?: never
        onChangeSettings?: never
      }
    | {
        policyDetails: RateBasedPolicyDetails
        policySettings: PolicySettingsDisplay
        onChangeSettings?: () => void
      }
  )
