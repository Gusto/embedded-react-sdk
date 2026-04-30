export type AccrualMethod = 'per_hour_paid' | 'per_calendar_year' | 'unlimited'
export type AccrualMethodFixed = 'per_pay_period' | 'all_at_once'
export type ResetDateType = 'per_anniversary_year' | 'per_calendar_year'

export interface PolicyConfigurationFormData {
  name: string
  accrualMethod: AccrualMethod
  accrualRate?: number
  accrualRateUnit?: number
  includeOvertime?: boolean
  allPaidHours?: boolean
  accrualMethodFixed?: AccrualMethodFixed
  resetDateType?: ResetDateType
  resetMonth?: number
  resetDay?: number
}

export interface PolicyConfigurationFormPresentationProps {
  onContinue: (data: PolicyConfigurationFormData) => void
  onCancel: () => void
  defaultValues?: Partial<PolicyConfigurationFormData>
}
