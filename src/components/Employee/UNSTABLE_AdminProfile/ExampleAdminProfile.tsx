import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { Location } from '@gusto/embedded-api/models/components/location'
import type { EntityErrorObject } from '@gusto/embedded-api/models/components/entityerrorobject'
import {
  useCreateEmployeeDetails,
  useUpdateEmployeeDetails,
  type OptionalEmployeeField,
  type EmployeeDetailsFormData,
} from '../UNSTABLE_EmployeeDetailsForm'
import { EmployeeDetailsFields } from '../UNSTABLE_EmployeeDetailsForm/EmployeeDetailsFields'
import type { EmployeeDetailsFieldsMetadata } from '../UNSTABLE_EmployeeDetailsForm/EmployeeDetailsFields'
import type { EmployeeDetailsSchema } from '../UNSTABLE_EmployeeDetailsForm/schema'
import { useCreateEmployeeHomeAddress } from '../UNSTABLE_EmployeeHomeAddressForm/useCreateEmployeeHomeAddress'
import { useUpdateEmployeeHomeAddress } from '../UNSTABLE_EmployeeHomeAddressForm/useUpdateEmployeeHomeAddress'
import { HomeAddressFields } from '../UNSTABLE_EmployeeHomeAddressForm/HomeAddressFields'
import type { HomeAddressFieldsMetadata } from '../UNSTABLE_EmployeeHomeAddressForm/HomeAddressFields'
import type { HomeAddressSchema } from '../UNSTABLE_EmployeeHomeAddressForm/schema'
import { useCreateEmployeeWorkAddress } from '../UNSTABLE_EmployeeWorkAddressForm/useCreateEmployeeWorkAddress'
import { useUpdateEmployeeWorkAddress } from '../UNSTABLE_EmployeeWorkAddressForm/useUpdateEmployeeWorkAddress'
import { WorkAddressFields } from '../UNSTABLE_EmployeeWorkAddressForm/WorkAddressFields'
import type { WorkAddressFieldsMetadata } from '../UNSTABLE_EmployeeWorkAddressForm/WorkAddressFields'
import type { WorkAddressSchema } from '../UNSTABLE_EmployeeWorkAddressForm/schema'
import type { HomeAddressFormData } from '../UNSTABLE_EmployeeHomeAddressForm'
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
import type { KnownErrors, OnEventType } from '@/components/Base/useBase'
import type { FormSchema } from '@/helpers/deriveFieldsFromSchema'
import {
  componentEvents,
  type EventType,
  EmployeeOnboardingStatus,
  EmployeeSelfOnboardingStatuses,
} from '@/shared/constants'
import { useI18n } from '@/i18n'

const I18N_NS = 'Employee.UNSTABLE_AdminProfile' as const

// --- Shared form types ---

type AdminProfileFormData = EmployeeDetailsFormData &
  WorkAddressFormData &
  Partial<HomeAddressFormData>

interface HookResult<TFields, TSchema extends FormSchema> {
  schema: TSchema
  fields: TFields
  defaultValues: Record<string, unknown>
  isPending: boolean
  errors: {
    error: KnownErrors | null
    fieldErrors: EntityErrorObject[] | null
  }
}

interface AdminProfileFormProps {
  employeeDetails: HookResult<EmployeeDetailsFieldsMetadata, EmployeeDetailsSchema>
  homeAddress: HookResult<HomeAddressFieldsMetadata, HomeAddressSchema>
  workAddress: HookResult<WorkAddressFieldsMetadata, WorkAddressSchema> & {
    data: { companyLocations: Location[] }
  }
  showHomeAddress: boolean
  showSelfOnboardingSwitch: boolean
  onSelfOnboardingChange: (value: boolean) => void
  onSubmit: (data: AdminProfileFormData) => Promise<void>
}

// --- Shared form layout ---

function AdminProfileForm({
  employeeDetails,
  homeAddress,
  workAddress,
  showHomeAddress,
  showSelfOnboardingSwitch,
  onSelfOnboardingChange,
  onSubmit,
}: AdminProfileFormProps) {
  useI18n(I18N_NS)
  const { t } = useTranslation(I18N_NS)
  const Components = useComponentContext()

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

  const watchedSelfOnboarding = formMethods.watch('selfOnboarding')
  if (watchedSelfOnboarding !== undefined) {
    onSelfOnboardingChange(watchedSelfOnboarding)
  }

  const isPending = employeeDetails.isPending || homeAddress.isPending || workAddress.isPending

  const apiError =
    employeeDetails.errors.error || homeAddress.errors.error || workAddress.errors.error
  const apiFieldErrors = [
    ...(employeeDetails.errors.fieldErrors ?? []),
    ...(homeAddress.errors.fieldErrors ?? []),
    ...(workAddress.errors.fieldErrors ?? []),
  ]

  return (
    <BaseLayout error={apiError} fieldErrors={apiFieldErrors.length > 0 ? apiFieldErrors : null}>
      <FormProvider {...formMethods}>
        <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Flex flexDirection="column" gap={32}>
            <header>
              <Components.Heading as="h2">{t('title')}</Components.Heading>
              <Components.Text>{t('description')}</Components.Text>
            </header>

            {showSelfOnboardingSwitch && (
              <SwitchField
                name="selfOnboarding"
                label={t('selfOnboardingLabel')}
                description={t('selfOnboardingDescription')}
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

// --- Public component ---

interface ExampleAdminProfileProps extends CommonComponentInterface {
  companyId: string
  employeeId?: string
  isSelfOnboardingEnabled?: boolean
}

export function ExampleAdminProfile({
  onEvent,
  FallbackComponent,
  LoaderComponent,
  ...props
}: ExampleAdminProfileProps & BaseComponentInterface) {
  return (
    <BaseBoundaries
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
      onErrorBoundaryError={error => {
        onEvent(componentEvents.ERROR, error)
      }}
    >
      {props.employeeId ? (
        <UpdateAdminProfile {...props} employeeId={props.employeeId} onEvent={onEvent} />
      ) : (
        <CreateAdminProfile {...props} onEvent={onEvent} />
      )}
    </BaseBoundaries>
  )
}

// --- Self-onboarding helpers ---

const checkHasCompletedSelfOnboarding = (employee?: Employee) =>
  employee?.onboarded ||
  employee?.onboardingStatus === EmployeeOnboardingStatus.ONBOARDING_COMPLETED ||
  employee?.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW ||
  employee?.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_COMPLETED_BY_EMPLOYEE

const getInitialSelfOnboarding = (employee?: Employee, isSelfOnboardingEnabled = true) => {
  if (!isSelfOnboardingEnabled) return false
  if (!employee) return false
  if (employee.onboarded) return true
  if (employee.onboardingStatus === EmployeeOnboardingStatus.ONBOARDING_COMPLETED) return true
  if (employee.onboardingStatus === undefined) return false
  // @ts-expect-error: onboarding_status during runtime can be one of self onboarding statuses
  return EmployeeSelfOnboardingStatuses.has(employee.onboarding_status)
}

// --- Create flow ---

function CreateAdminProfile({
  companyId,
  isSelfOnboardingEnabled = true,
  onEvent,
}: ExampleAdminProfileProps & { onEvent: OnEventType<EventType, unknown> }) {
  const [selfOnboarding, setSelfOnboarding] = useState(false)

  const showHomeAddress = !selfOnboarding
  const employeeFieldsToRequire: OptionalEmployeeField[] = !selfOnboarding
    ? ['email', 'ssn', 'dateOfBirth']
    : ['email']

  const employeeDetails = useCreateEmployeeDetails({
    companyId,
    optionalFieldsToRequire: employeeFieldsToRequire,
  })
  const homeAddress = useCreateEmployeeHomeAddress()
  const workAddress = useCreateEmployeeWorkAddress({
    companyId,
    optionalFieldsToRequire: ['effectiveDate'],
  })

  const handleSubmit = async (data: AdminProfileFormData) => {
    const employee = await employeeDetails.onSubmit(data)
    if (!employee) return

    onEvent(componentEvents.EMPLOYEE_CREATED, employee)

    if (showHomeAddress) {
      const address = await homeAddress.onSubmit(data as HomeAddressFormData, employee.uuid)
      if (!address) return
      onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_CREATED, address)
    }

    const work = await workAddress.onSubmit(data, employee.uuid)
    if (!work) return
    onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_CREATED, work)

    onEvent(componentEvents.EMPLOYEE_PROFILE_DONE, employee)
  }

  return (
    <AdminProfileForm
      employeeDetails={employeeDetails}
      homeAddress={homeAddress}
      workAddress={workAddress}
      showHomeAddress={showHomeAddress}
      showSelfOnboardingSwitch={isSelfOnboardingEnabled}
      onSelfOnboardingChange={setSelfOnboarding}
      onSubmit={handleSubmit}
    />
  )
}

// --- Update flow ---

function UpdateAdminProfile({
  companyId,
  employeeId,
  isSelfOnboardingEnabled = true,
  onEvent,
}: ExampleAdminProfileProps & { employeeId: string; onEvent: OnEventType<EventType, unknown> }) {
  const {
    data: { employee: fetchedEmployee },
  } = useEmployeesGetSuspense({ employeeId })
  const employee = fetchedEmployee!

  const hasCompletedSelfOnboarding = checkHasCompletedSelfOnboarding(employee)
  const [selfOnboarding, setSelfOnboarding] = useState(
    getInitialSelfOnboarding(employee, isSelfOnboardingEnabled),
  )

  const showHomeAddress = !selfOnboarding || hasCompletedSelfOnboarding
  const employeeFieldsToRequire: OptionalEmployeeField[] =
    !selfOnboarding || hasCompletedSelfOnboarding ? ['email', 'ssn', 'dateOfBirth'] : ['email']

  const employeeDetails = useUpdateEmployeeDetails({
    employeeId,
    optionalFieldsToRequire: employeeFieldsToRequire,
  })
  const homeAddress = useUpdateEmployeeHomeAddress({ employeeId })
  const workAddress = useUpdateEmployeeWorkAddress({
    companyId,
    employeeId,
    optionalFieldsToRequire: ['effectiveDate'],
  })

  const handleSubmit = async (data: AdminProfileFormData) => {
    const updated = await employeeDetails.onSubmit(data)
    if (!updated) return

    onEvent(componentEvents.EMPLOYEE_UPDATED, updated)

    if (showHomeAddress) {
      const address = await homeAddress.onSubmit(data as HomeAddressFormData)
      if (!address) return
      onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_UPDATED, address)
    }

    const work = await workAddress.onSubmit(data)
    if (!work) return
    onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_UPDATED, work)

    onEvent(componentEvents.EMPLOYEE_PROFILE_DONE, updated)
  }

  return (
    <AdminProfileForm
      employeeDetails={employeeDetails}
      homeAddress={homeAddress}
      workAddress={workAddress}
      showHomeAddress={showHomeAddress}
      showSelfOnboardingSwitch={isSelfOnboardingEnabled && !hasCompletedSelfOnboarding}
      onSelfOnboardingChange={setSelfOnboarding}
      onSubmit={handleSubmit}
    />
  )
}
