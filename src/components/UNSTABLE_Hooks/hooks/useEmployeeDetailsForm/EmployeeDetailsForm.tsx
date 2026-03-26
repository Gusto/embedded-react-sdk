import { useTranslation } from 'react-i18next'
import { SDKFormProvider } from '../../form/SDKFormProvider'
import { useEmployeeDetailsForm } from './useEmployeeDetailsForm'
import type { UseEmployeeDetailsFormProps } from './useEmployeeDetailsForm'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base'
import { Form } from '@/components/Common/Form'
import { ActionsLayout } from '@/components/Common'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'

export interface EmployeeDetailsFormProps
  extends UseEmployeeDetailsFormProps, Omit<BaseComponentInterface, 'defaultValues'> {}

function EmployeeDetailsFormRoot({ onEvent, dictionary, ...hookProps }: EmployeeDetailsFormProps) {
  useI18n('UNSTABLE.EmployeeDetailsForm')
  useComponentDictionary('UNSTABLE.EmployeeDetailsForm', dictionary)
  const { t } = useTranslation('UNSTABLE.EmployeeDetailsForm')
  const Components = useComponentContext()
  const employeeDetails = useEmployeeDetailsForm({
    ...hookProps,
    requiredFields: { update: ['ssn'] },
  })

  if (employeeDetails.isLoading) {
    return <BaseLayout isLoading error={employeeDetails.errorHandling.errors} />
  }

  const { Fields } = employeeDetails.form

  const handleSubmit = async () => {
    const result = await employeeDetails.actions.onSubmit({
      onEmployeeCreated: employee => {
        onEvent(componentEvents.EMPLOYEE_CREATED, employee)
      },
      onEmployeeUpdated: employee => {
        onEvent(componentEvents.EMPLOYEE_UPDATED, employee)
      },
      onOnboardingStatusUpdated: status => {
        onEvent(componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED, status)
      },
    })
    if (result) {
      onEvent(componentEvents.EMPLOYEE_PROFILE_DONE, result.data)
    }
  }

  return (
    <BaseLayout error={employeeDetails.errorHandling.errors}>
      <SDKFormProvider formHookResult={employeeDetails}>
        <Form
          onSubmit={e => {
            e.preventDefault()
            void handleSubmit()
          }}
        >
          <Components.Heading as="h2">
            {employeeDetails.status.mode === 'create' ? t('addTitle') : t('editTitle')}
          </Components.Heading>

          <Fields.FirstName
            label={t('firstNameLabel')}
            validationMessages={{
              REQUIRED: t('fieldValidations.firstName.REQUIRED'),
              INVALID_NAME: t('fieldValidations.firstName.INVALID_NAME'),
            }}
          />

          <Fields.MiddleInitial label={t('middleInitialLabel')} />

          <Fields.LastName
            label={t('lastNameLabel')}
            validationMessages={{
              REQUIRED: t('fieldValidations.lastName.REQUIRED'),
              INVALID_NAME: t('fieldValidations.lastName.INVALID_NAME'),
            }}
          />

          <Fields.Email
            label={t('emailLabel')}
            description={t('emailDescription')}
            validationMessages={{
              REQUIRED: t('fieldValidations.email.REQUIRED'),
              INVALID_EMAIL: t('fieldValidations.email.INVALID_EMAIL'),
              EMAIL_REQUIRED_FOR_SELF_ONBOARDING: t(
                'fieldValidations.email.EMAIL_REQUIRED_FOR_SELF_ONBOARDING',
              ),
            }}
          />

          {Fields.SelfOnboarding && (
            <Fields.SelfOnboarding
              label={t('selfOnboardingLabel')}
              description={t('selfOnboardingDescription')}
            />
          )}

          <Fields.DateOfBirth label={t('dateOfBirthLabel')} />

          <Fields.Ssn
            label={t('ssnLabel')}
            validationMessages={{
              INVALID_SSN: t('fieldValidations.ssn.INVALID_SSN'),
            }}
          />

          <ActionsLayout>
            <Components.Button type="submit" isLoading={employeeDetails.status.isPending}>
              {employeeDetails.status.mode === 'create' ? t('createCta') : t('updateCta')}
            </Components.Button>
          </ActionsLayout>
        </Form>
      </SDKFormProvider>
    </BaseLayout>
  )
}

export function EmployeeDetailsForm({ FallbackComponent, ...props }: EmployeeDetailsFormProps) {
  return (
    <BaseBoundaries
      componentName="UNSTABLE.EmployeeDetailsForm"
      FallbackComponent={FallbackComponent}
    >
      <EmployeeDetailsFormRoot {...props} />
    </BaseBoundaries>
  )
}
