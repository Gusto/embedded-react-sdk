import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEmployeeDetails, type EmployeeDetailsFormData } from '../UNSTABLE_EmployeeDetailsForm'
import { EmployeeDetailsFields } from '../UNSTABLE_EmployeeDetailsForm/EmployeeDetailsFields'
import { useEmployeeHomeAddress } from '../UNSTABLE_EmployeeHomeAddressForm/useEmployeeHomeAddress'
import { HomeAddressFields } from '../UNSTABLE_EmployeeHomeAddressForm/HomeAddressFields'
import type { HomeAddressFormData } from '../UNSTABLE_EmployeeHomeAddressForm'
import { useEmployeeWorkAddress } from '../UNSTABLE_EmployeeWorkAddressForm/useEmployeeWorkAddress'
import { WorkAddressFields } from '../UNSTABLE_EmployeeWorkAddressForm/WorkAddressFields'
import type { WorkAddressFormData } from '../UNSTABLE_EmployeeWorkAddressForm'
import { Form } from '@/components/Common/Form'
import { Flex, ActionsLayout, SwitchField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import {
  BaseLayout,
  BaseBoundaries,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { componentEvents, type EventType, EmployeeOnboardingStatus } from '@/shared/constants'
import { useI18n } from '@/i18n'

const I18N_NS = 'Employee.UNSTABLE_AdminProfile' as const

type AdminProfileFormData =
  | (EmployeeDetailsFormData & HomeAddressFormData & WorkAddressFormData)
  | (EmployeeDetailsFormData & WorkAddressFormData)

const SELF_ONBOARDING_COMPLETED_STATUSES = new Set([
  EmployeeOnboardingStatus.ONBOARDING_COMPLETED,
  EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW,
  EmployeeOnboardingStatus.SELF_ONBOARDING_COMPLETED_BY_EMPLOYEE,
])

interface ExampleAdminProfileProps extends CommonComponentInterface {
  companyId: string
  employeeId?: string
  isSelfOnboardingEnabled?: boolean
}

export function ExampleAdminProfile({
  onEvent,
  FallbackComponent,
  ...props
}: ExampleAdminProfileProps & BaseComponentInterface) {
  return (
    <BaseBoundaries
      FallbackComponent={FallbackComponent}
      onErrorBoundaryError={error => {
        onEvent(componentEvents.ERROR, error)
      }}
    >
      <Root {...props} onEvent={onEvent} />
    </BaseBoundaries>
  )
}

function Root({
  companyId,
  employeeId,
  isSelfOnboardingEnabled = true,
  onEvent,
}: ExampleAdminProfileProps & { onEvent: OnEventType<EventType, unknown> }) {
  useI18n(I18N_NS)
  const { t } = useTranslation(I18N_NS)
  const Components = useComponentContext()

  const [selfOnboarding, setSelfOnboarding] = useState(false)

  const employeeFieldsToRequire = !selfOnboarding
    ? (['email', 'ssn', 'dateOfBirth'] as const)
    : (['email'] as const)

  const employeeDetails = useEmployeeDetails({
    companyId,
    employeeId,
    optionalFieldsToRequire: [...employeeFieldsToRequire],
  })
  const homeAddress = useEmployeeHomeAddress({ employeeId })
  const workAddress = useEmployeeWorkAddress({
    companyId,
    employeeId,
    optionalFieldsToRequire: ['effectiveDate'],
  })

  const { employee } = employeeDetails.data
  const hasCompletedSelfOnboarding =
    employee?.onboarded ||
    (employee?.onboardingStatus != null &&
      (SELF_ONBOARDING_COMPLETED_STATUSES as Set<string>).has(employee.onboardingStatus))

  useEffect(() => {
    if (employeeDetails.defaultValues.selfOnboarding) {
      setSelfOnboarding(employeeDetails.defaultValues.selfOnboarding)
    }
  }, [employeeDetails.defaultValues.selfOnboarding])

  const showSelfOnboardingSwitch =
    employeeDetails.mode === 'create'
      ? isSelfOnboardingEnabled
      : isSelfOnboardingEnabled && !employeeDetails.fields.selfOnboarding.isDisabled

  const showHomeAddress =
    employeeDetails.mode === 'create'
      ? !selfOnboarding
      : !selfOnboarding || hasCompletedSelfOnboarding

  const isLoading = employeeDetails.isLoading || homeAddress.isLoading || workAddress.isLoading

  const combinedSchema = showHomeAddress
    ? employeeDetails.schema.and(homeAddress.schema).and(workAddress.schema)
    : employeeDetails.schema.and(workAddress.schema)

  const formMethods = useForm({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      ...employeeDetails.defaultValues,
      ...(showHomeAddress ? homeAddress.defaultValues : {}),
      ...workAddress.defaultValues,
    },
  })

  const isPending = employeeDetails.isPending || homeAddress.isPending || workAddress.isPending

  const apiError =
    employeeDetails.errors.error || homeAddress.errors.error || workAddress.errors.error
  const apiFieldErrors = [
    ...(employeeDetails.errors.fieldErrors ?? []),
    ...(homeAddress.errors.fieldErrors ?? []),
    ...(workAddress.errors.fieldErrors ?? []),
  ]

  const handleSubmit = async (data: AdminProfileFormData) => {
    const result = await employeeDetails.onSubmit(data)
    if (!result) return

    const employeeEvent =
      employeeDetails.mode === 'create'
        ? componentEvents.EMPLOYEE_CREATED
        : componentEvents.EMPLOYEE_UPDATED
    onEvent(employeeEvent, result)

    if (showHomeAddress) {
      const homeAddressData = homeAddress.schema.parse(data)
      const address = await homeAddress.onSubmit(homeAddressData, result.uuid)
      if (!address) return

      const addressEvent = homeAddress.data.currentAddress
        ? componentEvents.EMPLOYEE_HOME_ADDRESS_UPDATED
        : componentEvents.EMPLOYEE_HOME_ADDRESS_CREATED
      onEvent(addressEvent, address)
    }

    const work = await workAddress.onSubmit(data, result.uuid)
    if (!work) return

    const workEvent = workAddress.data.currentWorkAddress
      ? componentEvents.EMPLOYEE_WORK_ADDRESS_UPDATED
      : componentEvents.EMPLOYEE_WORK_ADDRESS_CREATED
    onEvent(workEvent, work)

    onEvent(componentEvents.EMPLOYEE_PROFILE_DONE, result)
  }

  return (
    <BaseLayout
      error={apiError}
      fieldErrors={apiFieldErrors.length > 0 ? apiFieldErrors : null}
      isLoading={isLoading}
    >
      <FormProvider {...formMethods}>
        <Form onSubmit={formMethods.handleSubmit(handleSubmit)}>
          <Flex flexDirection="column" gap={32}>
            <header>
              <Components.Heading as="h2">{t('title')}</Components.Heading>
              <Components.Text>{t('description')}</Components.Text>
            </header>

            {showSelfOnboardingSwitch && (
              <SwitchField
                name={employeeDetails.fields.selfOnboarding.name}
                isRequired={employeeDetails.fields.selfOnboarding.isRequired}
                label={t('selfOnboardingLabel')}
                description={t('selfOnboardingDescription')}
                onChange={setSelfOnboarding}
              />
            )}

            <Flex flexDirection="column" gap={12}>
              <Components.Heading as="h3">{t('personalDetails.title')}</Components.Heading>
              <EmployeeDetailsFields fields={employeeDetails.fields} />
            </Flex>

            <Flex flexDirection="column" gap={12}>
              <Components.Heading as="h3">{t('workDetails.title')}</Components.Heading>
              <WorkAddressFields
                fields={workAddress.fields}
                companyLocations={workAddress.data.companyLocations}
              />
            </Flex>

            {showHomeAddress && (
              <Flex flexDirection="column" gap={12}>
                <header>
                  <Components.Heading as="h3">{t('homeAddress.title')}</Components.Heading>
                  <Components.Text>{t('homeAddress.description')}</Components.Text>
                </header>
                <HomeAddressFields fields={homeAddress.fields} />
              </Flex>
            )}

            <ActionsLayout>
              <Components.Button type="submit" isLoading={isPending}>
                {t('buttons.save')}
              </Components.Button>
            </ActionsLayout>
          </Flex>
        </Form>
      </FormProvider>
    </BaseLayout>
  )
}
