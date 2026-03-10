import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeeAddressesGetSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGet'
import { useEmployeeAddressesGetWorkAddressesSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { useEmployeeDetails, type EmployeeDetailsFormData } from '../UNSTABLE_EmployeeDetailsForm'
import { useEmployeeHomeAddress } from '../UNSTABLE_EmployeeHomeAddressForm'
import { assertResponseData } from '@/helpers/assertResponseData'
import { Form } from '@/components/Common/Form'
import {
  TextInputField,
  DatePickerField,
  Grid,
  Flex,
  SelectField,
  ActionsLayout,
  CheckboxField,
} from '@/components/Common'
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
import { normalizeSSN, usePlaceholderSSN } from '@/helpers/ssn'
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
      <RootWithEmployee {...props} onEvent={onEvent} />
    </BaseBoundaries>
  )
}

function RootWithEmployee({
  employeeId,
  ...props
}: ExampleEmployeeProfileProps & { onEvent: OnEventType<EventType, unknown> }) {
  const {
    data: { employee },
  } = useEmployeesGetSuspense({ employeeId })
  const {
    data: { employeeAddressList },
  } = useEmployeeAddressesGetSuspense({ employeeId })
  const {
    data: { employeeWorkAddressesList },
  } = useEmployeeAddressesGetWorkAddressesSuspense({ employeeId })

  assertResponseData(employee, 'employee')

  return (
    <Root
      {...props}
      onEvent={props.onEvent}
      employeeId={employeeId}
      employee={employee}
      homeAddresses={employeeAddressList}
      workAddresses={employeeWorkAddressesList}
    />
  )
}

interface RootInternalProps {
  onEvent: OnEventType<EventType, unknown>
  employee: Employee
  homeAddresses?: EmployeeAddress[]
  workAddresses?: EmployeeWorkAddress[]
}

function Root({
  companyId,
  employeeId,
  onEvent,
  employee,
  homeAddresses,
  workAddresses,
}: ExampleEmployeeProfileProps & RootInternalProps) {
  useI18n(I18N_NS)
  const { t } = useTranslation(I18N_NS)
  const { t: tCommon } = useTranslation('common')
  const Components = useComponentContext()

  // Employee self-service: require SSN and DOB to complete personal_details step.
  // Email is not required here because the admin already provided it.
  const employeeDetails = useEmployeeDetails({
    companyId,
    employee,
    optionalFieldsToRequire: ['ssn', 'dateOfBirth'],
  })

  const homeAddress = useEmployeeHomeAddress({ homeAddresses })

  const combinedSchema = employeeDetails.schema.and(homeAddress.schema)

  const formMethods = useForm({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      ...employeeDetails.defaultValues,
      ...homeAddress.defaultValues,
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Combined schema intersection creates complex union types
  const errors = formMethods.formState.errors as Record<string, any>

  const placeholderSSN = usePlaceholderSSN(employeeDetails.fields.ssn.hasRedactedValue)

  const v: Record<string, string> = {
    REQUIRED: t('validations.REQUIRED'),
    INVALID_NAME_FORMAT: t('validations.INVALID_NAME_FORMAT'),
    INVALID_SSN_FORMAT: t('validations.INVALID_SSN_FORMAT'),
    INVALID_DATE_FORMAT: t('validations.INVALID_DATE_FORMAT'),
    INVALID_ZIP_FORMAT: t('validations.INVALID_ZIP_FORMAT'),
  }

  const isPending = employeeDetails.isPending || homeAddress.isPending

  const apiError = employeeDetails.errors.error || homeAddress.errors.error
  const apiFieldErrors = [
    ...(employeeDetails.errors.fieldErrors ?? []),
    ...(homeAddress.errors.fieldErrors ?? []),
  ]

  const activeWorkAddress = workAddresses?.find(address => address.active)

  const handleSubmit = async (data: Record<string, unknown>) => {
    const employeeResult = await employeeDetails.onSubmit(data as EmployeeDetailsFormData)
    if (!employeeResult) return

    const empId = employeeResult.data.uuid

    onEvent(componentEvents.EMPLOYEE_UPDATED, employeeResult.data)

    const addressResult = await homeAddress.onSubmit(
      data as Parameters<typeof homeAddress.onSubmit>[0],
      empId,
    )
    if (!addressResult) return

    if (addressResult.mode === 'create') {
      onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_CREATED, addressResult.data)
    } else {
      onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_UPDATED, addressResult.data)
    }

    onEvent(componentEvents.EMPLOYEE_PROFILE_DONE, employeeResult.data)
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

              <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
                <TextInputField
                  name="firstName"
                  label={t('personalDetails.firstName')}
                  isRequired={employeeDetails.fields.firstName.isRequired}
                  errorMessage={errors.firstName?.message && v[errors.firstName.message]}
                />
                <TextInputField name="middleInitial" label={t('personalDetails.middleInitial')} />
                <TextInputField
                  name="lastName"
                  label={t('personalDetails.lastName')}
                  isRequired={employeeDetails.fields.lastName.isRequired}
                  errorMessage={errors.lastName?.message && v[errors.lastName.message]}
                />
              </Grid>

              <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
                <TextInputField
                  name="ssn"
                  label={t('personalDetails.ssn')}
                  isRequired={employeeDetails.fields.ssn.isRequired}
                  transform={normalizeSSN}
                  placeholder={placeholderSSN}
                  errorMessage={errors.ssn?.message && v[errors.ssn.message]}
                />
                <DatePickerField
                  name="dateOfBirth"
                  label={t('personalDetails.dateOfBirth')}
                  isRequired={employeeDetails.fields.dateOfBirth.isRequired}
                  errorMessage={errors.dateOfBirth?.message && v[errors.dateOfBirth.message]}
                />
              </Grid>
            </Flex>

            <Flex flexDirection="column" gap={12}>
              <header>
                <Components.Heading as="h3">{t('homeAddress.title')}</Components.Heading>
                <Components.Text>{t('homeAddress.description')}</Components.Text>
              </header>

              <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
                <TextInputField
                  name="street1"
                  label={t('homeAddress.street1')}
                  isRequired={homeAddress.fields.street1.isRequired}
                  errorMessage={errors.street1?.message && v[errors.street1.message]}
                />
                <TextInputField name="street2" label={t('homeAddress.street2')} />
                <TextInputField
                  name="city"
                  label={t('homeAddress.city')}
                  isRequired={homeAddress.fields.city.isRequired}
                  errorMessage={errors.city?.message && v[errors.city.message]}
                />
                <SelectField
                  name="state"
                  label={t('homeAddress.state')}
                  placeholder={t('homeAddress.statePlaceholder')}
                  isRequired={homeAddress.fields.state.isRequired}
                  options={homeAddress.fields.state.options.map(value => ({
                    value,
                    label: tCommon(`statesHash.${value}`),
                  }))}
                  errorMessage={errors.state?.message && v[errors.state.message]}
                />
                <TextInputField
                  name="zip"
                  label={t('homeAddress.zip')}
                  isRequired={homeAddress.fields.zip.isRequired}
                  errorMessage={errors.zip?.message && v[errors.zip.message]}
                />
              </Grid>
              <CheckboxField
                name="courtesyWithholding"
                label={t('homeAddress.courtesyWithholdingLabel')}
                description={t('homeAddress.courtesyWithholdingDescription')}
              />
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
