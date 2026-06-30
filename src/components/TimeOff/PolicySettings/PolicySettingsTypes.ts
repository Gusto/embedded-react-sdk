/**
 * Accrual method category for a time off policy. Determines which settings fields are shown.
 *
 * @public
 */
export type PolicySettingsAccrualMethod =
  'hours_worked' | 'fixed_per_pay_period' | 'fixed_all_at_once'

/**
 * Form values captured by the policy settings form.
 *
 * @public
 */
export interface PolicySettingsFormData {
  /** Whether an annual accrual cap is enabled. */
  accrualMaximumEnabled: boolean
  /** Maximum hours that can accrue per year when {@link PolicySettingsFormData.accrualMaximumEnabled} is true. */
  accrualMaximum?: number
  /** Whether a total balance cap is enabled. */
  balanceMaximumEnabled: boolean
  /** Maximum hours an employee can hold in their balance at any time when {@link PolicySettingsFormData.balanceMaximumEnabled} is true. */
  balanceMaximum?: number
  /** Whether a carry-over limit is enabled. */
  carryOverLimitEnabled: boolean
  /** Maximum hours that carry over when the policy resets when {@link PolicySettingsFormData.carryOverLimitEnabled} is true. */
  carryOverLimit?: number
  /** Whether a waiting period is enabled. */
  waitingPeriodEnabled: boolean
  /** Number of days a new employee must wait before accrual begins when {@link PolicySettingsFormData.waitingPeriodEnabled} is true. */
  waitingPeriod?: number
  /** Whether accrued balance is paid out when an employee is terminated. */
  paidOutOnTermination: boolean
}

/**
 * Props for {@link PolicySettingsPresentation}.
 *
 * @public
 */
export interface PolicySettingsPresentationProps {
  /** Accrual method category of the policy. Controls which fields are shown. */
  accrualMethod: PolicySettingsAccrualMethod
  /** Called with the form values when the user submits. */
  onContinue: (data: PolicySettingsFormData) => void
  /** Called when the user navigates back. */
  onBack: () => void
  /** Optional default values to prefill the form. */
  defaultValues?: Partial<PolicySettingsFormData>
  /** Whether the form is being used to create a new policy or edit an existing one. Defaults to create. */
  mode?: 'create' | 'edit'
  /** Name of the policy being edited. Shown in the heading when `mode` is `'edit'`. */
  editingPolicyName?: string
  /** Whether a submit is in flight. Disables the back button and shows a loading state on the continue button. */
  isPending?: boolean
}
