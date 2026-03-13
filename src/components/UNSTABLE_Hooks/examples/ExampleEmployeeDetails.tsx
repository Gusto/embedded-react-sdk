import { useTranslation } from 'react-i18next'
import { Form } from '../Form'
import {
  useEmployeeDetailsForm,
  EmployeeDetailsFormProvider,
  type EmployeeDetailsFormReady,
} from '../hooks/useEmployeeDetails'
import { ActionsLayout, Grid } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { useI18n } from '@/i18n'

const I18N_NS = 'UNSTABLE_EmployeeDetails' as const

const exampleEmployeeDetailsEvents = {
  EMPLOYEE_DETAILS_UPDATED: 'employee_details_updated',
} as const

type ExampleEmployeeDetailsEvent =
  (typeof exampleEmployeeDetailsEvents)[keyof typeof exampleEmployeeDetailsEvents]

interface ExampleEmployeeDetailsProps {
  employeeId: string
  isSelfOnboardingEnabled?: boolean
  onEvent?: (event: ExampleEmployeeDetailsEvent, data?: unknown) => void
}

export function ExampleEmployeeDetails({
  employeeId,
  isSelfOnboardingEnabled,
  onEvent,
}: ExampleEmployeeDetailsProps) {
  return (
    <BaseBoundaries>
      <ExampleEmployeeDetailsRoot
        employeeId={employeeId}
        isSelfOnboardingEnabled={isSelfOnboardingEnabled}
        onEvent={onEvent}
      />
    </BaseBoundaries>
  )
}

function ExampleEmployeeDetailsRoot({
  employeeId,
  isSelfOnboardingEnabled = true,
  onEvent,
}: ExampleEmployeeDetailsProps) {
  useI18n(I18N_NS)
  const { t } = useTranslation(I18N_NS)
  const employeeDetailsForm = useEmployeeDetailsForm({ employeeId, isSelfOnboardingEnabled })
  const Components = useComponentContext()

  if (employeeDetailsForm.isLoading) {
    return <BaseLayout isLoading />
  }

  const { onSubmit, isPending, errors } = employeeDetailsForm

  const handleSubmit = async () => {
    const result = await onSubmit()
    if (result) {
      onEvent?.(exampleEmployeeDetailsEvents.EMPLOYEE_DETAILS_UPDATED, result.data)
    }
  }

  return (
    <BaseLayout error={errors.error} fieldErrors={errors.fieldErrors}>
      <Form onSubmit={handleSubmit}>
        <Components.Heading as="h2">{t('formTitle')}</Components.Heading>
        <Components.Text>{t('description')}</Components.Text>
        <EmployeeDetailsFormFields form={employeeDetailsForm} />
        <ActionsLayout>
          <Components.Button type="submit" isLoading={isPending}>
            {t('submit')}
          </Components.Button>
        </ActionsLayout>
      </Form>
    </BaseLayout>
  )
}

export interface EmployeeDetailsFormFieldsProps {
  form: EmployeeDetailsFormReady
}

export function EmployeeDetailsFormFields({ form }: EmployeeDetailsFormFieldsProps) {
  const { t } = useTranslation(I18N_NS)

  const { Fields } = form

  return (
    <EmployeeDetailsFormProvider form={form}>
      {Fields.SelfOnboarding && (
        <Fields.SelfOnboarding
          label={t('selfOnboardingLabel')}
          description={t('selfOnboardingDescription')}
        />
      )}
      <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
        <Fields.FirstName
          label={t('firstName')}
          validationMessages={{
            REQUIRED: t('fieldValidations.firstName.REQUIRED'),
            INVALID_NAME: t('fieldValidations.firstName.INVALID_NAME'),
          }}
        />
        <Fields.MiddleInitial label={t('middleInitial')} />
        <Fields.LastName
          label={t('lastName')}
          validationMessages={{
            REQUIRED: t('fieldValidations.lastName.REQUIRED'),
            INVALID_NAME: t('fieldValidations.lastName.INVALID_NAME'),
          }}
        />
        <Fields.PreferredFirstName label={t('preferredFirstName')} />
        <Fields.Email
          label={t('email')}
          description={t('emailDescription')}
          validationMessages={{
            INVALID_EMAIL: t('fieldValidations.email.INVALID_EMAIL'),
          }}
        />
        {Fields.DateOfBirth && (
          <Fields.DateOfBirth
            label={t('dateOfBirth')}
            validationMessages={{
              REQUIRED: t('fieldValidations.dateOfBirth.REQUIRED'),
            }}
          />
        )}
      </Grid>
    </EmployeeDetailsFormProvider>
  )
}
