import { useTranslation } from 'react-i18next'
import type { PendingChangeDetail } from './getPendingCompensationChanges'
import { useFormatCompensationRate } from '@/helpers/formattedStrings'

/**
 * Renders a single `PendingChangeDetail` produced by `getPendingCompensationChanges`
 * into the user-facing bullet string. Resolves FLSA enum values to their human
 * labels and formats pay/min-wage rates with the shared `useFormatCompensationRate`
 * helper so the copy matches the form. All copy resolves from the
 * `Employee.Management.Compensation` namespace.
 *
 * @internal
 */
export function usePendingChangeDetailRenderer(employeeFirstName: string | null | undefined) {
  const { t } = useTranslation('Employee.Management.Compensation')
  const formatCompensationRate = useFormatCompensationRate()
  const name = employeeFirstName ?? ''

  return (detail: PendingChangeDetail): string => {
    const interpolation = { interpolation: { escapeValue: false } }
    switch (detail.kind) {
      case 'titleChange':
        return t('card.pendingChange.details.titleChange', {
          title: detail.title,
          ...interpolation,
        })
      case 'payChange':
        return t('card.pendingChange.details.payChange', {
          formattedRate: formatCompensationRate(detail.rate, detail.paymentUnit),
          ...interpolation,
        })
      case 'flsaChange':
        return t('card.pendingChange.details.flsaChange', {
          flsaLabel: t(`flsaStatusLabels.${detail.flsaStatus}`),
          ...interpolation,
        })
      case 'newJob': {
        const hasRate = detail.rate !== null && detail.paymentUnit !== null
        const formattedRate = hasRate
          ? formatCompensationRate(detail.rate!, detail.paymentUnit!)
          : null
        if (detail.title && hasRate) {
          return t('card.pendingChange.details.newJob', {
            name,
            title: detail.title,
            formattedRate,
            ...interpolation,
          })
        }
        if (hasRate) {
          return t('card.pendingChange.details.newJobNoTitle', {
            name,
            formattedRate,
            ...interpolation,
          })
        }
        if (detail.title) {
          return t('card.pendingChange.details.newJobNoRate', {
            name,
            title: detail.title,
            ...interpolation,
          })
        }
        return t('card.pendingChange.details.newJobMinimal', {
          name,
          ...interpolation,
        })
      }
      case 'minWageEnabled':
        return detail.wage
          ? t('card.pendingChange.details.minWageEnabled', {
              formattedWage: formatCompensationRate(Number(detail.wage), 'Hour'),
              ...interpolation,
            })
          : t('card.pendingChange.details.minWageEnabledNoRate')
      case 'minWageDisabled':
        return t('card.pendingChange.details.minWageDisabled')
      case 'minWageChanged':
        return detail.wage
          ? t('card.pendingChange.details.minWageChanged', {
              formattedWage: formatCompensationRate(Number(detail.wage), 'Hour'),
              ...interpolation,
            })
          : t('card.pendingChange.details.minWageChangedNoRate')
    }
  }
}
