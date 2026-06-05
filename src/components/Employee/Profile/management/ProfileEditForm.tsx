import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { useEmployeeDetailsForm } from '../shared/useEmployeeDetailsForm'
import { EmployeeDetailsFormBody } from '../shared/EmployeeDetailsFormBody'
import { useManagementProfileFormDictionary } from './useFormDictionary'
import styles from './Profile.module.scss'
import {
  BaseBoundaries,
  BaseLayout,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface ProfileEditFormProps extends CommonComponentInterface<'Employee.Management.Profile'> {
  employeeId: string
  onEvent: BaseComponentInterface['onEvent']
}

export function ProfileEditForm({
  FallbackComponent,
  ...props
}: ProfileEditFormProps & Pick<BaseComponentInterface, 'FallbackComponent'>) {
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
  const formDictionary = useManagementProfileFormDictionary()

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
        <Form onSubmit={handleSubmit}>
          {alert}
          <Components.Heading as="h1">{t('form.title')}</Components.Heading>
          <EmployeeDetailsFormBody
            formHookResult={employeeDetails}
            withEmail
            dictionary={formDictionary}
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
      </BaseLayout>
    </section>
  )
}
