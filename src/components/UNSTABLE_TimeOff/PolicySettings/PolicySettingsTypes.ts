export type PolicySettingsAccrualMethod = 'hours_worked' | 'fixed'

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
}
