import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { EmployeeDetailsFormBodyDictionary } from '../shared/EmployeeDetailsFormBody'

/**
 * Resolves the shared `EmployeeDetailsFormBody`'s text against onboarding's
 * existing `Employee.Profile` namespace.
 *
 * The mapping bridges onboarding's source key names onto the body's nested
 * shape. Most keys already match by name; keeping the source keys unchanged
 * preserves backward compatibility for partners overriding them through the
 * onboarding screen's `dictionary` prop.
 */
export function useOnboardingProfileFormDictionary(): EmployeeDetailsFormBodyDictionary {
  const { t } = useTranslation('Employee.Profile')

  return useMemo<EmployeeDetailsFormBodyDictionary>(
    () => ({
      en: {
        firstName: t('firstName'),
        middleInitial: t('middleInitial'),
        lastName: t('lastName'),
        email: t('email'),
        emailDescription: t('emailDescription'),
        ssnLabel: t('ssnLabel'),
        dobLabel: t('dobLabel'),
        validations: {
          firstName: t('validations.firstName'),
          lastName: t('validations.lastName'),
          email: t('validations.email'),
        },
      },
    }),
    [t],
  )
}
