import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { useEmployeeDetailsForm } from '../shared/useEmployeeDetailsForm'
import styles from './Profile.module.scss'
import {
  BaseBoundaries,
  BaseLayout,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { Grid } from '@/components/Common/Grid/Grid'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface EditProfileProps extends CommonComponentInterface<'Employee.Profile'> {
  employeeId: string
  onEvent: BaseComponentInterface['onEvent']
}

export function EditProfile({
  FallbackComponent,
  ...props
}: EditProfileProps & Pick<BaseComponentInterface, 'FallbackComponent'>) {
  return (
    <BaseBoundaries componentName="Employee.Profile" FallbackComponent={FallbackComponent}>
      <EditProfileRoot {...props} />
    </BaseBoundaries>
  )
}

function EditProfileRoot({ employeeId, className, dictionary, onEvent }: EditProfileProps) {
  useI18n('Employee.Profile')
  useComponentDictionary('Employee.Profile', dictionary)
  const { t } = useTranslation('Employee.Profile')
  const Components = useComponentContext()

  const employeeDetails = useEmployeeDetailsForm({
    employeeId,
    withSelfOnboardingField: false,
    optionalFieldsToRequire: {
      update: ['firstName', 'lastName', 'email', 'dateOfBirth', 'ssn'],
    },
  })

  const [showSuccess, setShowSuccess] = useState(false)

  if (employeeDetails.isLoading) {
    return <BaseLayout isLoading error={employeeDetails.errorHandling.errors} />
  }

  const Fields = employeeDetails.form.Fields

  const handleSubmit = async () => {
    setShowSuccess(false)
    const result = await employeeDetails.actions.onSubmit({
      onEmployeeUpdated: emp => {
        onEvent(componentEvents.EMPLOYEE_PROFILE_MANAGEMENT_UPDATED, emp)
      },
    })
    if (!result) return
    setShowSuccess(true)
  }

  const handleCancel = () => {
    onEvent(componentEvents.EMPLOYEE_PROFILE_MANAGEMENT_EDIT_CANCELLED)
  }

  const alert = showSuccess ? (
    <Components.Alert
      status="success"
      label={t('successAlert')}
      onDismiss={() => {
        setShowSuccess(false)
      }}
    />
  ) : undefined

  return (
    <section className={classNames(styles.container, className)}>
      <BaseLayout error={employeeDetails.errorHandling.errors}>
        <SDKFormProvider formHookResult={employeeDetails}>
          <Form onSubmit={handleSubmit}>
            {alert}
            <Components.Heading as="h1">{t('title')}</Components.Heading>
            <Grid
              gap={{ base: 20, small: 8 }}
              gridTemplateColumns={{ base: '1fr', small: ['1fr', 200] }}
            >
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
            <Fields.Email
              label={t('email')}
              description={t('emailDescription')}
              validationMessages={{
                REQUIRED: t('validations.email'),
                INVALID_EMAIL: t('validations.email'),
                EMAIL_REQUIRED_FOR_SELF_ONBOARDING: t('validations.email'),
              }}
            />
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
            <ActionsLayout>
              <Components.Button variant="secondary" onClick={handleCancel}>
                {t('cancelCta')}
              </Components.Button>
              <Components.Button type="submit" isLoading={employeeDetails.status.isPending}>
                {t('saveCta')}
              </Components.Button>
            </ActionsLayout>
          </Form>
        </SDKFormProvider>
      </BaseLayout>
    </section>
  )
}
