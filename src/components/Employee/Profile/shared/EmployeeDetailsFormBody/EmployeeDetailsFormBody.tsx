import { useTranslation } from 'react-i18next'
import type { UseEmployeeDetailsFormReady } from '../useEmployeeDetailsForm'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { Grid } from '@/components/Common/Grid/Grid'
import { useComponentDictionary, useI18n } from '@/i18n'
import type { ResourceDictionary } from '@/types/Helpers'

export type EmployeeDetailsFormBodyDictionary =
  ResourceDictionary<'Employee.EmployeeDetailsFormBody'>

export interface EmployeeDetailsFormBodyProps {
  /**
   * The ready result of `useEmployeeDetailsForm`. The body renders the
   * personal-details fields against this form so the owning surface keeps
   * control over submit orchestration (standalone vs. composed).
   */
  formHookResult: UseEmployeeDetailsFormReady
  /**
   * Renders the personal email field. Onboarding's self-service screen omits
   * it; the management edit form and admin screen include it.
   */
  withEmail?: boolean
  /**
   * Translation overrides for the body's strings. Each consuming surface
   * passes the dictionary it resolved from its own namespace so partner
   * overrides on that namespace flow into the field copy.
   */
  dictionary?: EmployeeDetailsFormBodyDictionary
}

/**
 * Shared body of the employee personal-details form: name, optional email,
 * SSN, and date of birth. Owns its own i18n namespace
 * (`Employee.EmployeeDetailsFormBody`) and accepts a per-surface `dictionary`
 * so the field/validation copy can be themed independently while the field
 * and validation logic live in one place.
 */
export function EmployeeDetailsFormBody({
  formHookResult,
  withEmail = false,
  dictionary,
}: EmployeeDetailsFormBodyProps) {
  useI18n('Employee.EmployeeDetailsFormBody')
  useComponentDictionary('Employee.EmployeeDetailsFormBody', dictionary)
  const { t } = useTranslation('Employee.EmployeeDetailsFormBody')

  const Fields = formHookResult.form.Fields

  return (
    <SDKFormProvider formHookResult={formHookResult}>
      <Grid gap={{ base: 20, small: 8 }} gridTemplateColumns={{ base: '1fr', small: ['1fr', 200] }}>
        <Fields.FirstName
          label={t('firstName')}
          validationMessages={{
            REQUIRED: t('validations.firstName'),
            INVALID_NAME: t('validations.firstName'),
          }}
        />
        <Fields.MiddleInitial label={t('middleInitial')} />
      </Grid>
      <Fields.LastName
        label={t('lastName')}
        validationMessages={{
          REQUIRED: t('validations.lastName'),
          INVALID_NAME: t('validations.lastName'),
        }}
      />
      {withEmail && (
        <Fields.Email
          label={t('email')}
          description={t('emailDescription')}
          validationMessages={{
            REQUIRED: t('validations.email'),
            INVALID_EMAIL: t('validations.email'),
            EMAIL_REQUIRED_FOR_SELF_ONBOARDING: t('validations.email'),
          }}
        />
      )}
      <Fields.Ssn
        label={t('ssnLabel')}
        validationMessages={{
          INVALID_SSN: t('validations.ssn', { ns: 'common' }),
          REQUIRED: t('validations.ssnRequired', { ns: 'common' }),
        }}
      />
      <Fields.DateOfBirth
        label={t('dobLabel')}
        validationMessages={{ REQUIRED: t('validations.dob', { ns: 'common' }) }}
      />
    </SDKFormProvider>
  )
}
