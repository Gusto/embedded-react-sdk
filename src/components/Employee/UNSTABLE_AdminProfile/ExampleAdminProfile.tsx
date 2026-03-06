import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeeAddressesGetSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGet'
import { useEmployeeAddressesGetWorkAddressesSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { useEmployeeDetails, type OptionalEmployeeField } from '../UNSTABLE_EmployeeDetailsForm'
import { useEmployeeHomeAddress } from '../UNSTABLE_EmployeeHomeAddressForm'
import { useEmployeeWorkAddress } from '../UNSTABLE_EmployeeWorkAddressForm'
import { Form } from '@/components/Common/Form'
import {
  TextInputField,
  DatePickerField,
  Grid,
  Flex,
  SelectField,
  ActionsLayout,
  SwitchField,
  CheckboxField,
} from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import {
  componentEvents,
  EmployeeOnboardingStatus,
  EmployeeSelfOnboardingStatuses,
} from '@/shared/constants'
import { useI18n } from '@/i18n'
import { normalizeSSN, usePlaceholderSSN } from '@/helpers/ssn'
import { addressInline } from '@/helpers/formattedStrings'
import type { WithRequired } from '@/types/Helpers'

const I18N_NS = 'Employee.UNSTABLE_AdminProfile' as const

interface ExampleAdminProfileProps extends CommonComponentInterface {
  companyId: string
  employeeId?: string
  isSelfOnboardingEnabled?: boolean
}

export function ExampleAdminProfile(props: ExampleAdminProfileProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      {props.employeeId ? (
        <RootWithEmployee {...props} employeeId={props.employeeId} />
      ) : (
        <Root {...props} />
      )}
    </BaseComponent>
  )
}

function RootWithEmployee({
  employeeId,
  ...props
}: WithRequired<ExampleAdminProfileProps, 'employeeId'>) {
  const {
    data: { employee },
  } = useEmployeesGetSuspense({ employeeId })
  const {
    data: { employeeAddressList },
  } = useEmployeeAddressesGetSuspense({ employeeId })
  const {
    data: { employeeWorkAddressesList },
  } = useEmployeeAddressesGetWorkAddressesSuspense({ employeeId })

  return (
    <Root
      {...props}
      employee={employee}
      homeAddresses={employeeAddressList}
      workAddresses={employeeWorkAddressesList}
    />
  )
}

interface RootInternalProps {
  employee?: Employee
  homeAddresses?: EmployeeAddress[]
  workAddresses?: EmployeeWorkAddress[]
}

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

function Root({
  companyId,
  isSelfOnboardingEnabled = true,
  employee,
  homeAddresses,
  workAddresses,
}: ExampleAdminProfileProps & RootInternalProps) {
  useI18n(I18N_NS)
  const { t } = useTranslation(I18N_NS)
  const { t: tCommon } = useTranslation('common')
  const Components = useComponentContext()
  const { onEvent } = useBase()

  const hasCompletedSelfOnboarding = checkHasCompletedSelfOnboarding(employee)
  const [selfOnboarding, setSelfOnboarding] = useState(
    getInitialSelfOnboarding(employee, isSelfOnboardingEnabled),
  )

  // When admin is handling everything (no self-onboarding), require all fields
  // needed to complete the personal_details onboarding step.
  // When self-onboarding, the admin only needs to provide email;
  // the employee handles SSN and DOB during their own flow.
  const employeeRequiredFields: OptionalEmployeeField[] =
    !selfOnboarding || hasCompletedSelfOnboarding ? ['email', 'ssn', 'dateOfBirth'] : ['email']

  const showHomeAddress = !selfOnboarding || hasCompletedSelfOnboarding

  const employeeDetails = useEmployeeDetails({
    companyId,
    employee,
    requiredFields: employeeRequiredFields,
  })

  const homeAddress = useEmployeeHomeAddress({ homeAddresses })

  const workAddress = useEmployeeWorkAddress({
    companyId,
    workAddresses,
    requiredFields: ['effectiveDate'],
  })

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Combined schema intersection creates complex union types
  const errors = formMethods.formState.errors as Record<string, any>

  const watchedSelfOnboarding = formMethods.watch('selfOnboarding' as never) as unknown as
    | boolean
    | undefined

  if (watchedSelfOnboarding !== undefined && watchedSelfOnboarding !== selfOnboarding) {
    setSelfOnboarding(watchedSelfOnboarding)
  }

  const placeholderSSN = usePlaceholderSSN(employeeDetails.fields.ssn.hasRedactedValue)

  const v: Record<string, string> = {
    REQUIRED: t('validations.REQUIRED'),
    INVALID_NAME_FORMAT: t('validations.INVALID_NAME_FORMAT'),
    INVALID_EMAIL_FORMAT: t('validations.INVALID_EMAIL_FORMAT'),
    INVALID_SSN_FORMAT: t('validations.INVALID_SSN_FORMAT'),
    INVALID_DATE_FORMAT: t('validations.INVALID_DATE_FORMAT'),
    INVALID_ZIP_FORMAT: t('validations.INVALID_ZIP_FORMAT'),
  }

  const isPending = employeeDetails.isPending || homeAddress.isPending || workAddress.isPending

  const handleSubmit = async (data: Record<string, unknown>) => {
    const employeeResult = await employeeDetails.onSubmit(data, {
      selfOnboarding,
      previousOnboardingStatus: employee?.onboardingStatus,
    })

    const empId = employeeResult.data.uuid

    if (employeeResult.mode === 'create') {
      onEvent(componentEvents.EMPLOYEE_CREATED, employeeResult.data)
    } else {
      onEvent(componentEvents.EMPLOYEE_UPDATED, employeeResult.data)
    }

    if (showHomeAddress) {
      const addressResult = await homeAddress.onSubmit(
        data as Parameters<typeof homeAddress.onSubmit>[0],
        empId,
      )
      if (addressResult.mode === 'create') {
        onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_CREATED, addressResult.data)
      } else {
        onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_UPDATED, addressResult.data)
      }
    }

    const workResult = await workAddress.onSubmit(
      data as Parameters<typeof workAddress.onSubmit>[0],
      empId,
    )
    if (workResult.mode === 'create') {
      onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_CREATED, workResult.data)
    } else {
      onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_UPDATED, workResult.data)
    }

    onEvent(componentEvents.EMPLOYEE_PROFILE_DONE, employeeResult.data)
  }

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={formMethods.handleSubmit(handleSubmit as never)}>
        <Flex flexDirection="column" gap={32}>
          <header>
            <Components.Heading as="h2">{t('title')}</Components.Heading>
            <Components.Text>{t('description')}</Components.Text>
          </header>

          {isSelfOnboardingEnabled && !hasCompletedSelfOnboarding && (
            <SwitchField
              name="selfOnboarding"
              label={t('selfOnboardingLabel')}
              description={t('selfOnboardingDescription')}
            />
          )}

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
              <TextInputField
                name="email"
                label={t('personalDetails.email')}
                description={t('personalDetails.emailDescription')}
                isRequired={employeeDetails.fields.email.isRequired}
                errorMessage={errors.email?.message && v[errors.email.message]}
                type="email"
              />
            </Grid>

            {employeeDetails.fields.ssn.isRequired && (
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
            )}
          </Flex>

          <Flex flexDirection="column" gap={12}>
            <Components.Heading as="h3">{t('workDetails.title')}</Components.Heading>
            <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={20}>
              <SelectField
                name="locationUuid"
                label={t('workDetails.workAddress')}
                description={t('workDetails.workAddressDescription')}
                placeholder={t('workDetails.workAddressPlaceholder')}
                isRequired={workAddress.fields.locationUuid.isRequired}
                options={workAddress.companyLocations.map(location => ({
                  value: location.uuid,
                  label: addressInline(location),
                }))}
                errorMessage={errors.locationUuid?.message && v[errors.locationUuid.message]}
              />
              <DatePickerField
                name="effectiveDate"
                label={t('workDetails.startDate')}
                description={t('workDetails.startDateDescription')}
                isRequired={workAddress.fields.effectiveDate.isRequired}
                errorMessage={errors.effectiveDate?.message && v[errors.effectiveDate.message]}
              />
            </Grid>
          </Flex>

          {showHomeAddress && (
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
          )}

          <ActionsLayout>
            <Components.Button type="submit" isLoading={isPending}>
              {t('buttons.save')}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </Form>
    </FormProvider>
  )
}
