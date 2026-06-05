import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { EmployeeDetailsFormBodyDictionary } from '../shared/EmployeeDetailsFormBody'

/**
 * Resolves the shared `EmployeeDetailsFormBody`'s text against management's
 * `Employee.Management.Profile` namespace. The form copy is owned by
 * management's translation file under the nested `form.*` shape, so partner
 * overrides on `Employee.Management.Profile` flow into the field text via
 * `t(...)` resolution at render time.
 */
export function useManagementProfileFormDictionary(): EmployeeDetailsFormBodyDictionary {
  const { t } = useTranslation('Employee.Management.Profile')

  return useMemo<EmployeeDetailsFormBodyDictionary>(
    () => ({
      en: {
        firstName: t('form.firstName'),
        middleInitial: t('form.middleInitial'),
        lastName: t('form.lastName'),
        email: t('form.email'),
        emailDescription: t('form.emailDescription'),
        ssnLabel: t('form.ssnLabel'),
        dobLabel: t('form.dobLabel'),
        validations: {
          firstName: t('form.validations.firstName'),
          lastName: t('form.validations.lastName'),
          email: t('form.validations.email'),
        },
      },
    }),
    [t],
  )
}
