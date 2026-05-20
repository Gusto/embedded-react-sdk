import { useTranslation } from 'react-i18next'
import type { PendingChangeDetail } from './getPendingCompensationChanges'
import { useFormatCompensationRate } from '@/helpers/formattedStrings'

/**
 * Renders a single `PendingChangeDetail` produced by `getPendingCompensationChanges`
 * into the user-facing bullet string. Resolves FLSA enum values to their human
 * labels via the Compensation namespace and formats pay/min-wage rates with the
 * shared `useFormatPayRate` helper so the copy matches the form.
 */
export function usePendingChangeDetailRenderer(employeeFirstName: string | null | undefined) {
  const { t: tDashboard } = useTranslation('Employee.Dashboard')
  const { t: tCompensation } = useTranslation('Employee.Compensation')
  const formatCompensationRate = useFormatCompensationRate()
  const name = employeeFirstName ?? ''

  return (detail: PendingChangeDetail): string => {
    const interpolation = { interpolation: { escapeValue: false } }
    switch (detail.kind) {
      case 'titleChange':
        return tDashboard('jobAndPay.compensation.pendingChange.details.titleChange', {
          title: detail.title,
          ...interpolation,
        })
      case 'payChange':
        return tDashboard('jobAndPay.compensation.pendingChange.details.payChange', {
          formattedRate: formatCompensationRate(detail.rate, detail.paymentUnit),
          ...interpolation,
        })
      case 'flsaChange':
        return tDashboard('jobAndPay.compensation.pendingChange.details.flsaChange', {
          flsaLabel: tCompensation(`flsaStatusLabels.${detail.flsaStatus}`),
          ...interpolation,
        })
      case 'newJob': {
        const hasRate = detail.rate !== null && detail.paymentUnit !== null
        const formattedRate = hasRate
          ? formatCompensationRate(detail.rate!, detail.paymentUnit!)
          : null
        if (detail.title && hasRate) {
          return tDashboard('jobAndPay.compensation.pendingChange.details.newJob', {
            name,
            title: detail.title,
            formattedRate,
            ...interpolation,
          })
        }
        if (hasRate) {
          return tDashboard('jobAndPay.compensation.pendingChange.details.newJobNoTitle', {
            name,
            formattedRate,
            ...interpolation,
          })
        }
        if (detail.title) {
          return tDashboard('jobAndPay.compensation.pendingChange.details.newJobNoRate', {
            name,
            title: detail.title,
            ...interpolation,
          })
        }
        return tDashboard('jobAndPay.compensation.pendingChange.details.newJobMinimal', {
          name,
          ...interpolation,
        })
      }
      case 'minWageEnabled':
        return detail.wage
          ? tDashboard('jobAndPay.compensation.pendingChange.details.minWageEnabled', {
              formattedWage: formatCompensationRate(Number(detail.wage), 'Hour'),
              ...interpolation,
            })
          : tDashboard('jobAndPay.compensation.pendingChange.details.minWageEnabledNoRate')
      case 'minWageDisabled':
        return tDashboard('jobAndPay.compensation.pendingChange.details.minWageDisabled')
      case 'minWageChanged':
        return detail.wage
          ? tDashboard('jobAndPay.compensation.pendingChange.details.minWageChanged', {
              formattedWage: formatCompensationRate(Number(detail.wage), 'Hour'),
              ...interpolation,
            })
          : tDashboard('jobAndPay.compensation.pendingChange.details.minWageChangedNoRate')
    }
  }
}
