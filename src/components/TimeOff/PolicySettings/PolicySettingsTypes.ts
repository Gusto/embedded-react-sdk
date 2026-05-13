export type PolicySettingsAccrualMethod =
  | 'hours_worked'
  | 'fixed_per_pay_period'
  | 'fixed_all_at_once'

export interface PolicySettingsFormData {
  accrualMaximumEnabled: boolean
  accrualMaximum?: number
  balanceMaximumEnabled: boolean
  balanceMaximum?: number
  carryOverLimitEnabled: boolean
  carryOverLimit?: number
  waitingPeriodEnabled: boolean
  waitingPeriod?: number
  paidOutOnTermination: boolean
}

export interface PolicySettingsPresentationProps {
  accrualMethod: PolicySettingsAccrualMethod
  onContinue: (data: PolicySettingsFormData) => void
  onBack: () => void
  defaultValues?: Partial<PolicySettingsFormData>
  mode?: 'create' | 'edit'
  editingPolicyName?: string
  isPending?: boolean
}
