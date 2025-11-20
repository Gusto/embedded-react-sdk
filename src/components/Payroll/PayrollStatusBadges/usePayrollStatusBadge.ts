import { useMemo } from 'react'
import type {
  PayrollInput,
  WireInRequestInput,
  EnhancedPayrollStatus,
  PayrollStatusBadge,
} from './payrollStatusConfig'
import { STATUS_CONFIG } from './payrollStatusConfig'

export const getPayrollStatusBadges = (
  payroll: PayrollInput,
  wireInRequest?: WireInRequestInput,
): EnhancedPayrollStatus => {
  const badges: PayrollStatusBadge[] = []

  for (const config of STATUS_CONFIG) {
    if (config.condition(payroll, wireInRequest)) {
      const badge =
        typeof config.badge === 'function' ? config.badge(payroll, wireInRequest) : config.badge
      badges.push(badge)

      if (!config.continueChecking) {
        break
      }
    }
  }

  if (badges.length === 0) {
    badges.push({
      variant: 'info',
      translationKey: 'unprocessed',
    })
  }

  return { badges }
}

export const usePayrollStatusBadge = (
  payroll: PayrollInput,
  wireInRequest?: WireInRequestInput,
): EnhancedPayrollStatus => {
  return useMemo(() => getPayrollStatusBadges(payroll, wireInRequest), [payroll, wireInRequest])
}
