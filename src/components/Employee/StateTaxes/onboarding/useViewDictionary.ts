import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { StateTaxesViewDictionary } from '../shared'

/**
 * Resolves the shared `EmployeeStateTaxesView`'s text against onboarding's
 * `Employee.StateTaxes` namespace. Partner overrides supplied through the
 * onboarding block's `dictionary` prop flow into the view text via `t(...)`
 * resolution at render time.
 */
export function useOnboardingStateTaxesViewDictionary(): StateTaxesViewDictionary {
  const { t } = useTranslation('Employee.StateTaxes')

  return useMemo<StateTaxesViewDictionary>(
    () => ({
      en: {
        stateTaxesTitle: t('stateTaxesTitle'),
        noWithholding: t('noWithholding'),
        validations: {
          required: t('validations.required'),
        },
      },
    }),
    [t],
  )
}
