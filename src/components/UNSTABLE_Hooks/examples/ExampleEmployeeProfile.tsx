import { useTranslation } from 'react-i18next'
import { Form } from '../Form'
import { useEmployeeDetailsForm } from '../hooks/useEmployeeDetails'
import { useHomeAddressForm } from '../hooks/useHomeAddress'
import { useWorkAddressForm } from '../hooks/useWorkAddress'
import { composeSubmitHandler } from '../hooks/composeSubmitHandler'
import type { HookErrors } from '../helpers'
import { EmployeeDetailsFormFields } from './ExampleEmployeeDetails'
import { HomeAddressFormFields } from './ExampleHomeAddress'
import { WorkAddressFormFields } from './ExampleEmployeeWorkAddress'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { useI18n } from '@/i18n'

const I18N_EMPLOYEE_DETAILS = 'UNSTABLE_EmployeeDetails' as const
const I18N_HOME_ADDRESS = 'UNSTABLE_HomeAddress' as const
const I18N_WORK_ADDRESS = 'UNSTABLE_WorkAddress' as const

const exampleEmployeeProfileEvents = {
  EMPLOYEE_DETAILS_CREATED: 'employee_details_created',
  EMPLOYEE_DETAILS_UPDATED: 'employee_details_updated',
  HOME_ADDRESS_CREATED: 'home_address_created',
  HOME_ADDRESS_UPDATED: 'home_address_updated',
  WORK_ADDRESS_CREATED: 'work_address_created',
  WORK_ADDRESS_UPDATED: 'work_address_updated',
} as const

type ExampleEmployeeProfileEvent =
  (typeof exampleEmployeeProfileEvents)[keyof typeof exampleEmployeeProfileEvents]

interface ExampleEmployeeProfileProps {
  employeeId: string
  companyId: string
  isSelfOnboardingEnabled?: boolean
  onEvent?: (event: ExampleEmployeeProfileEvent, data: unknown) => void
}

export function ExampleEmployeeProfile({
  employeeId,
  companyId,
  isSelfOnboardingEnabled,
  onEvent,
}: ExampleEmployeeProfileProps) {
  return (
    <BaseBoundaries>
      <ExampleEmployeeProfileRoot
        employeeId={employeeId}
        companyId={companyId}
        isSelfOnboardingEnabled={isSelfOnboardingEnabled}
        onEvent={onEvent}
      />
    </BaseBoundaries>
  )
}

function combineErrors(...errorSources: HookErrors[]) {
  const firstError = errorSources.find(e => e.error !== null)?.error ?? null
  const allFieldErrors = errorSources.flatMap(e => e.fieldErrors ?? [])
  return {
    error: firstError,
    fieldErrors: allFieldErrors.length > 0 ? allFieldErrors : null,
  }
}

function ExampleEmployeeProfileRoot({
  employeeId,
  companyId,
  isSelfOnboardingEnabled = true,
  onEvent,
}: ExampleEmployeeProfileProps) {
  useI18n(I18N_EMPLOYEE_DETAILS)
  useI18n(I18N_HOME_ADDRESS)
  useI18n(I18N_WORK_ADDRESS)

  const { t: tDetails } = useTranslation(I18N_EMPLOYEE_DETAILS)
  const { t: tHomeAddress } = useTranslation(I18N_HOME_ADDRESS)
  const { t: tWorkAddress } = useTranslation(I18N_WORK_ADDRESS)

  const employeeDetailsForm = useEmployeeDetailsForm({
    employeeId,
    isSelfOnboardingEnabled,
    shouldFocusError: false,
  })
  const homeAddressForm = useHomeAddressForm({ employeeId, shouldFocusError: false })
  const workAddressForm = useWorkAddressForm({ employeeId, companyId, shouldFocusError: false })
  const Components = useComponentContext()

  const isLoading =
    employeeDetailsForm.isLoading || homeAddressForm.isLoading || workAddressForm.isLoading

  if (isLoading) {
    return <BaseLayout isLoading />
  }

  const isPending =
    employeeDetailsForm.isPending || homeAddressForm.isPending || workAddressForm.isPending

  const combinedErrors = combineErrors(
    employeeDetailsForm.errors,
    homeAddressForm.errors,
    workAddressForm.errors,
  )

  const handleSubmit = composeSubmitHandler(
    [employeeDetailsForm, homeAddressForm, workAddressForm],
    async () => {
      const detailsResult = await employeeDetailsForm.onSubmit()
      if (detailsResult) {
        const event =
          detailsResult.mode === 'create'
            ? exampleEmployeeProfileEvents.EMPLOYEE_DETAILS_CREATED
            : exampleEmployeeProfileEvents.EMPLOYEE_DETAILS_UPDATED
        onEvent?.(event, detailsResult.data)
      }

      const resolvedEmployeeId = detailsResult?.data.uuid ?? employeeId

      const homeAddressResult = await homeAddressForm.onSubmit(resolvedEmployeeId)
      if (homeAddressResult) {
        const event =
          homeAddressResult.mode === 'create'
            ? exampleEmployeeProfileEvents.HOME_ADDRESS_CREATED
            : exampleEmployeeProfileEvents.HOME_ADDRESS_UPDATED
        onEvent?.(event, homeAddressResult.data)
      }

      const workAddressResult = await workAddressForm.onSubmit(resolvedEmployeeId)
      if (workAddressResult) {
        const event =
          workAddressResult.mode === 'create'
            ? exampleEmployeeProfileEvents.WORK_ADDRESS_CREATED
            : exampleEmployeeProfileEvents.WORK_ADDRESS_UPDATED
        onEvent?.(event, workAddressResult.data)
      }
    },
  )

  return (
    <BaseLayout error={combinedErrors.error} fieldErrors={combinedErrors.fieldErrors}>
      <Form onSubmit={handleSubmit}>
        <Components.Heading as="h2">{tDetails('formTitle')}</Components.Heading>
        <EmployeeDetailsFormFields form={employeeDetailsForm} />
        <Components.Heading as="h2">{tHomeAddress('formTitle')}</Components.Heading>
        <HomeAddressFormFields form={homeAddressForm} />
        <Components.Heading as="h2">{tWorkAddress('formTitle')}</Components.Heading>
        <WorkAddressFormFields form={workAddressForm} />
        <ActionsLayout>
          <Components.Button type="submit" isLoading={isPending}>
            Save
          </Components.Button>
        </ActionsLayout>
      </Form>
    </BaseLayout>
  )
}
