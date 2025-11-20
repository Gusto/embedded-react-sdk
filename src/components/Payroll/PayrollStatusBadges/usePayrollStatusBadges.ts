import { useMemo } from 'react'
import type {
  PayrollInput,
  WireInRequestInput,
  PayrollStatusBadges,
  PayrollStatusBadge,
} from './payrollStatusConfig'
import { STATUS_CONFIG } from './payrollStatusConfig'

export const getPayrollStatusBadges = (
  payroll: PayrollInput,
  wireInRequest?: WireInRequestInput,
): PayrollStatusBadges => {
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

  return { badges }
}

export const usePayrollStatusBadges = (
  payroll: PayrollInput,
  wireInRequest?: WireInRequestInput,
): PayrollStatusBadges => {
  return useMemo(() => getPayrollStatusBadges(payroll, wireInRequest), [payroll, wireInRequest])
}
