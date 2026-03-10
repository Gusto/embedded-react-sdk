import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEmployeeAddressesGetWorkAddressesSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import {
  useUpdateEmployeeDetails,
  type EmployeeDetailsFormData,
} from '../UNSTABLE_EmployeeDetailsForm'
import { EmployeeDetailsFields } from '../UNSTABLE_EmployeeDetailsForm/EmployeeDetailsFields'
import { useUpdateEmployeeHomeAddress } from '../UNSTABLE_EmployeeHomeAddressForm/useUpdateEmployeeHomeAddress'
import { HomeAddressFields } from '../UNSTABLE_EmployeeHomeAddressForm/HomeAddressFields'
import type { HomeAddressFormData } from '../UNSTABLE_EmployeeHomeAddressForm'
import { Form } from '@/components/Common/Form'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import {
  BaseLayout,
  BaseBoundaries,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { componentEvents, type EventType } from '@/shared/constants'
import { useI18n } from '@/i18n'
import { getStreet, getCityStateZip } from '@/helpers/formattedStrings'

const I18N_NS = 'Employee.UNSTABLE_EmployeeProfile' as const

interface ExampleEmployeeProfileProps extends CommonComponentInterface {
  companyId: string
  employeeId: string
}

export function ExampleEmployeeProfile({
  onEvent,
  FallbackComponent,
  LoaderComponent,
  ...props
}: ExampleEmployeeProfileProps & BaseComponentInterface) {
  return (
    <BaseBoundaries
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
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
  onEvent,
}: ExampleEmployeeProfileProps & { onEvent: OnEventType<EventType, unknown> }) {
  useI18n(I18N_NS)
  const { t } = useTranslation(I18N_NS)
  const Components = useComponentContext()

  const employeeDetails = useUpdateEmployeeDetails({
    employeeId,
    optionalFieldsToRequire: ['ssn', 'dateOfBirth'],
  })

  const homeAddress = useUpdateEmployeeHomeAddress({ employeeId })

  const {
    data: { employeeWorkAddressesList },
  } = useEmployeeAddressesGetWorkAddressesSuspense({ employeeId })
  const activeWorkAddress = employeeWorkAddressesList?.find(address => address.active)

  const combinedSchema = employeeDetails.schema.and(homeAddress.schema)

  const formMethods = useForm({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      ...employeeDetails.defaultValues,
      ...homeAddress.defaultValues,
    },
  })

  const isPending = employeeDetails.isPending || homeAddress.isPending

  const apiError = employeeDetails.errors.error || homeAddress.errors.error
  const apiFieldErrors = [
    ...(employeeDetails.errors.fieldErrors ?? []),
    ...(homeAddress.errors.fieldErrors ?? []),
  ]

  const handleSubmit = async (data: Record<string, unknown>) => {
    const updated = await employeeDetails.onSubmit(data as EmployeeDetailsFormData)
    if (!updated) return

    onEvent(componentEvents.EMPLOYEE_UPDATED, updated)

    const address = await homeAddress.onSubmit(data as HomeAddressFormData)
    if (!address) return
    onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_UPDATED, address)

    onEvent(componentEvents.EMPLOYEE_PROFILE_DONE, updated)
  }

  return (
    <BaseLayout error={apiError} fieldErrors={apiFieldErrors.length > 0 ? apiFieldErrors : null}>
      <FormProvider {...formMethods}>
        <Form onSubmit={formMethods.handleSubmit(handleSubmit as never)}>
          <Flex flexDirection="column" gap={32}>
            <header>
              <Components.Heading as="h2">{t('title')}</Components.Heading>
              <Components.Text>{t('description')}</Components.Text>
            </header>

            <Flex flexDirection="column" gap={12}>
              <Components.Heading as="h3">{t('personalDetails.title')}</Components.Heading>
              <EmployeeDetailsFields fields={employeeDetails.fields} showEmail={false} />
            </Flex>

            <Flex flexDirection="column" gap={12}>
              <header>
                <Components.Heading as="h3">{t('homeAddress.title')}</Components.Heading>
                <Components.Text>{t('homeAddress.description')}</Components.Text>
              </header>
              <HomeAddressFields fields={homeAddress.fields} />
            </Flex>

            {activeWorkAddress && (
              <Flex flexDirection="column" gap={12}>
                <header>
                  <Components.Heading as="h3">{t('workAddress.title')}</Components.Heading>
                  <Components.Text>{t('workAddress.description')}</Components.Text>
                </header>
                <address>
                  <Components.Text>{getStreet(activeWorkAddress)}</Components.Text>
                  <Components.Text>{getCityStateZip(activeWorkAddress)}</Components.Text>
                </address>
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
