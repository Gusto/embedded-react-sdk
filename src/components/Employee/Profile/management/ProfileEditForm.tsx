import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { useEmployeeDetailsForm } from '../shared/useEmployeeDetailsForm'
import styles from './Profile.module.scss'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base'
import { ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { Grid } from '@/components/Common/Grid/Grid'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/**
 * Props for {@link ProfileEditForm}.
 *
 * @public
 */
export interface ProfileEditFormProps extends BaseComponentInterface<'Employee.Management.Profile'> {
  /** The associated employee identifier. */
  employeeId: string
}

/**
 * Standalone edit form for an employee's basic profile details.
 *
 * @remarks
 * Renders fields for first name, middle initial, last name, email, SSN, and
 * date of birth — all required on update — and shows a success alert when
 * the save completes. Save and Cancel both emit events so the parent can
 * return to the read view.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/profile/updated` | Fired after the employee profile is successfully saved | {@link Employee} |
 * | `employee/management/profile/editCancelled` | Fired when the user clicks Cancel | — |
 *
 * @param input - See {@link ProfileEditFormProps}.
 * @returns The employee profile edit form.
 * @public
 */
export function ProfileEditForm({ FallbackComponent, ...props }: ProfileEditFormProps) {
  return (
    <BaseBoundaries
      componentName="Employee.Management.Profile"
      FallbackComponent={FallbackComponent}
    >
      <ProfileEditFormRoot {...props} />
    </BaseBoundaries>
  )
}

function ProfileEditFormRoot({ employeeId, className, dictionary, onEvent }: ProfileEditFormProps) {
  useI18n('Employee.Management.Profile')
  useComponentDictionary('Employee.Management.Profile', dictionary)
  const { t } = useTranslation('Employee.Management.Profile')
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
        onEvent(componentEvents.EMPLOYEE_MANAGEMENT_PROFILE_UPDATED, emp)
      },
    })
    if (!result) return
    setShowSuccess(true)
  }

  const handleCancel = () => {
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_PROFILE_EDIT_CANCELLED)
  }

  const alert = showSuccess ? (
    <Components.Alert
      status="success"
      label={t('form.successAlert')}
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
            <Components.Heading as="h1">{t('form.title')}</Components.Heading>
            <Grid
              gap={{ base: 20, small: 8 }}
              gridTemplateColumns={{ base: '1fr', small: ['1fr', 200] }}
            >
              <Fields.FirstName
                label={t('form.firstName')}
                validationMessages={{
                  REQUIRED: t('form.validations.firstName'),
                  INVALID_NAME: t('form.validations.firstName'),
                }}
              />
              <Fields.MiddleInitial label={t('form.middleInitial')} />
            </Grid>
            <Fields.LastName
              label={t('form.lastName')}
              validationMessages={{
                REQUIRED: t('form.validations.lastName'),
                INVALID_NAME: t('form.validations.lastName'),
              }}
            />
            <Fields.Email
              label={t('form.email')}
              description={t('form.emailDescription')}
              validationMessages={{
                REQUIRED: t('form.validations.email'),
                INVALID_EMAIL: t('form.validations.email'),
                EMAIL_REQUIRED_FOR_SELF_ONBOARDING: t('form.validations.email'),
              }}
            />
            <Fields.Ssn
              label={t('form.ssnLabel')}
              validationMessages={{
                INVALID_SSN: t('validations.ssn', { ns: 'common' }),
                REQUIRED: t('validations.ssnRequired', { ns: 'common' }),
              }}
            />
            <Fields.DateOfBirth
              label={t('form.dobLabel')}
              validationMessages={{ REQUIRED: t('validations.dob', { ns: 'common' }) }}
            />
            <ActionsLayout>
              <Components.Button variant="secondary" onClick={handleCancel}>
                {t('form.cancelCta')}
              </Components.Button>
              <Components.Button type="submit" isLoading={employeeDetails.status.isPending}>
                {t('form.saveCta')}
              </Components.Button>
            </ActionsLayout>
          </Form>
        </SDKFormProvider>
      </BaseLayout>
    </section>
  )
}
