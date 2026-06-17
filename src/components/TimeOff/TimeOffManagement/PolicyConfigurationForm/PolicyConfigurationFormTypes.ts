/**
 * Top-level accrual method selected on the policy configuration form.
 *
 * @remarks
 * `per_hour_paid` covers all hourly accrual variants — the `allPaidHours` and
 * `includeOvertime` toggles on {@link PolicyConfigurationFormData} narrow it to
 * a specific API accrual method on submit.
 *
 * @public
 */
export type AccrualMethod = 'per_hour_paid' | 'per_calendar_year' | 'unlimited'

/**
 * Sub-method for fixed (per-calendar-year) accrual — whether hours are granted
 * at the start of the year or spread evenly across pay periods.
 *
 * @public
 */
export type AccrualMethodFixed = 'per_pay_period' | 'all_at_once'

/**
 * When a policy's balance resets — on each employee's hire anniversary or on
 * a fixed calendar month/day shared across all employees.
 *
 * @public
 */
export type ResetDateType = 'per_anniversary_year' | 'per_calendar_year'

/**
 * Values collected by {@link PolicyConfigurationForm} for a sick or vacation
 * time off policy.
 *
 * @remarks
 * Fields beyond `name` and `accrualMethod` are conditionally relevant based on
 * the selected `accrualMethod`:
 *
 * - `unlimited` — no other fields apply.
 * - `per_hour_paid` — `accrualRate`, `accrualRateUnit`, `includeOvertime`, and
 *   `allPaidHours` configure the hourly accrual variant.
 * - `per_calendar_year` — `accrualRate` and `accrualMethodFixed` configure how
 *   hours are granted; `resetDateType` plus `resetMonth`/`resetDay` configure
 *   when balances reset.
 *
 * @public
 */
export interface PolicyConfigurationFormData {
  /** Display name of the policy. */
  name: string
  /** Top-level accrual strategy selected by the user. */
  accrualMethod: AccrualMethod
  /** Hours accrued per `accrualRateUnit` (hourly) or per year (fixed). */
  accrualRate?: number
  /** Hours worked needed to earn `accrualRate` hours of time off. Hourly only. */
  accrualRateUnit?: number
  /** Whether overtime hours count toward accrual. Hourly only. */
  includeOvertime?: boolean
  /** Whether all paid hours (not just worked hours) count toward accrual. Hourly only. */
  allPaidHours?: boolean
  /** For `per_calendar_year`: grant hours all at once or spread per pay period. */
  accrualMethodFixed?: AccrualMethodFixed
  /** Whether balances reset on anniversary or on a fixed calendar date. */
  resetDateType?: ResetDateType
  /** Reset month (1–12) when `resetDateType` is `per_calendar_year`. */
  resetMonth?: number
  /** Reset day of month when `resetDateType` is `per_calendar_year`. */
  resetDay?: number
}

/** @internal */
type LockedAccrualCategory = 'unlimited' | 'accrual_based'

/** @internal */
export interface PolicyConfigurationFormPresentationProps {
  /** Called with form values when the user submits a valid form. */
  onContinue: (data: PolicyConfigurationFormData) => void
  /** Called when the user clicks the cancel button. */
  onCancel: () => void
  /** Pre-populated values to merge into the form's defaults. */
  defaultValues?: Partial<PolicyConfigurationFormData>
  /** When set, renders the edit-title variant with this policy name. */
  editingPolicyName?: string
  /** When true, disables actions and shows the submit button in a loading state. */
  isPending?: boolean
  /** Restricts the accrual method options when editing a completed policy. */
  lockedAccrualCategory?: LockedAccrualCategory
}
