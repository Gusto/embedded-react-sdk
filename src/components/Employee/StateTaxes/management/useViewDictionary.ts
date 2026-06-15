import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { StateTaxesViewDictionary } from '../shared'

/**
 * Resolves the shared `EmployeeStateTaxesView`'s text against management's
 * `Employee.Management.StateTaxes` namespace. Partner overrides supplied
 * through the management edit form's `dictionary` prop flow into the view
 * text via `t(...)` resolution at render time.
 *
 * @internal
 */
export function useManagementStateTaxesViewDictionary(): StateTaxesViewDictionary {
  const { t } = useTranslation('Employee.Management.StateTaxes')

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
