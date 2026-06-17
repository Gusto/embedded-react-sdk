import type { ReactNode } from 'react'
import type {
  EmployeeTableItem,
  EmployeeTableProps,
} from '../shared/EmployeeTable/EmployeeTableTypes'
import type { RemoveDialogState } from '../shared/PolicyDetailLayout/PolicyDetailLayoutTypes'

/**
 * Row shape for an employee enrolled in a time-off policy.
 *
 * @public
 */
export interface TimeOffPolicyDetailEmployee extends EmployeeTableItem {
  /** Unique identifier for the employee. */
  uuid: string
  /** Current balance in hours, or `null` for unlimited policies. */
  balance: number | null
}

/** @public */
export type RateBasedAccrualMethod =
  | 'perPayPeriod'
  | 'perCalendarYear'
  | 'perAnniversaryYear'
  | 'perHourWorked'
  | 'perHourWorkedNoOvertime'
  | 'perHourPaid'
  | 'perHourPaidNoOvertime'

/** @internal */
export type AccrualMethodKey = 'unlimited' | RateBasedAccrualMethod

/** @public */
export type PolicyTypeKey = 'vacation' | 'sick'

/**
 * Policy details for an unlimited (no-accrual) time-off policy.
 *
 * @public
 */
export interface UnlimitedPolicyDetails {
  /** Whether the policy covers vacation or sick time. */
  policyType: PolicyTypeKey
  /** Accrual method discriminant — always `'unlimited'` for this variant. */
  accrualMethod: 'unlimited'
}

/**
 * Policy details for a rate-based accruing time-off policy.
 *
 * @public
 */
export interface RateBasedPolicyDetails {
  /** Whether the policy covers vacation or sick time. */
  policyType: PolicyTypeKey
  /** The method by which time off accrues. */
  accrualMethod: RateBasedAccrualMethod
  /** Hours accrued per accrual period. */
  accrualRate: number
  /** Divisor used to compute the per-unit accrual rate, if applicable. */
  accrualRateUnit?: number
  /** ISO date string for the annual balance reset, if applicable. */
  resetDate?: string
}

/**
 * Policy type and accrual configuration for the detail view.
 *
 * @remarks
 * A discriminated union on `accrualMethod`. When `accrualMethod` is `'unlimited'`,
 * no rate or reset date is present. For rate-based methods, `accrualRate` is set
 * and `resetDate` / `accrualRateUnit` may also be provided.
 *
 * @public
 */
export type PolicyDetails = UnlimitedPolicyDetails | RateBasedPolicyDetails

/**
 * Accrual caps, carryover, and termination settings displayed alongside a rate-based policy.
 *
 * @public
 */
export interface PolicySettingsDisplay {
  /** Maximum hours that can accrue per year, or `null` for no limit. */
  maxAccrualHoursPerYear: number | null
  /** Maximum balance an employee can hold, or `null` for no limit. */
  maxHours: number | null
  /** Maximum hours that carry over on reset, or `null` for no limit. */
  carryoverLimitHours: number | null
  /** Days before a newly enrolled employee begins accruing, or `null` for no waiting period. */
  accrualWaitingPeriodDays: number | null
  /** Whether the remaining balance is paid out when an employee is terminated. */
  paidOutOnTermination: boolean
}

/**
 * Shared base props for {@link TimeOffPolicyDetailPresentation}.
 *
 * @public
 */
export interface TimeOffPolicyDetailPresentationBaseProps {
  /** Policy name displayed as the page heading. */
  title: string
  /** Secondary label, typically the policy type. */
  subtitle?: string
  /** Called when the back navigation is clicked. */
  onBack: () => void
  /** Label for the back navigation link. */
  backLabel: string
  /** Optional action buttons rendered in the header. */
  actions?: ReactNode[]

  /** The currently active tab id. */
  selectedTabId: string
  /** Called with the new tab id when the user switches tabs. */
  onTabChange: (id: string) => void

  /** Employee table data and callbacks. */
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
  >

  /** Called when the add-employee action is clicked. */
  onAddEmployee?: () => void

  /** State for the employee removal confirmation dialog. */
  removeDialog: RemoveDialogState
  /** Optional success message rendered as a dismissible alert. */
  successAlert?: string
  /** Called when the success alert is dismissed. */
  onDismissAlert?: () => void
}

/**
 * Props for {@link TimeOffPolicyDetailPresentation}.
 *
 * @remarks
 * The props form a discriminated union on `policyDetails.accrualMethod`. Unlimited policies
 * omit `policySettings` and `onChangeSettings`; rate-based policies require `policySettings`
 * and may provide `onChangeSettings` to enable the change-settings action.
 *
 * | Field | Description |
 * | ----- | ----------- |
 * | `title` | The policy name displayed as the page heading. |
 * | `subtitle` | Secondary label, typically the policy type. |
 * | `onBack` | Called when the back navigation is clicked. |
 * | `backLabel` | Label for the back navigation link. |
 * | `actions` | Optional action buttons rendered in the header. |
 * | `policyDetails` | Policy type and accrual configuration. See {@link PolicyDetails}. |
 * | `policySettings` | Accrual caps and termination settings. See {@link PolicySettingsDisplay}. Required for rate-based policies. |
 * | `onChangeSettings` | Called when the change-settings action is clicked. Rate-based policies only. |
 * | `selectedTabId` | The currently active tab id. |
 * | `onTabChange` | Called with the new tab id when the user switches tabs. |
 * | `employees` | Employee table data including `data`, `searchValue`, `onSearchChange`, `onSearchClear`, and optional `itemMenu`. |
 * | `onAddEmployee` | Called when the add-employee action is clicked. |
 * | `removeDialog` | State for the employee removal confirmation dialog. |
 * | `successAlert` | Optional success message rendered as a dismissible alert. |
 * | `onDismissAlert` | Called when the success alert is dismissed. |
 *
 * @public
 */
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
