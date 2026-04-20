import { useState, useMemo, useEffect } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { type Employee } from '@gusto/embedded-api/models/components/employee'
import type { ProfileProps } from './Profile'
import styles from './AdminProfile.module.scss'
import { useEmployeeDetailsForm } from './shared/useEmployeeDetailsForm'
import type { EmployeeDetailsOptionalFieldsToRequire } from './shared/useEmployeeDetailsForm'
import { useHomeAddressForm } from './shared/useHomeAddressForm'
import { useWorkAddressForm } from './shared/useWorkAddressForm'
import type { UseEmployeeDetailsFormReady } from './shared/useEmployeeDetailsForm'
import type { UseHomeAddressFormReady } from './shared/useHomeAddressForm'
import type { UseWorkAddressFormReady } from './shared/useWorkAddressForm'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { composeSubmitHandler } from '@/partner-hook-utils/form/composeSubmitHandler'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { Grid } from '@/components/Common/Grid/Grid'
import { ActionsLayout, DatePickerField } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { BaseLayout } from '@/components/Base'
import { SelectField } from '@/components/Common'
import { useI18n } from '@/i18n'
import {
  componentEvents,
  EmployeeOnboardingStatus,
  STATES_ABBR,
  type EventType,
} from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary } from '@/i18n/I18n'

const checkHasCompletedSelfOnboarding = (employee?: Employee) => {
  return (
    employee?.onboarded === true ||
    employee?.onboardingStatus === EmployeeOnboardingStatus.ONBOARDING_COMPLETED ||
    employee?.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW ||
    employee?.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_COMPLETED_BY_EMPLOYEE
  )
}

function computeOptionalFieldsToRequire(
  selfOnboardingActive: boolean,
): EmployeeDetailsOptionalFieldsToRequire {
  if (selfOnboardingActive) {
    return {
      create: ['email'],
      update: ['firstName', 'lastName', 'email'],
    }
  }
  return {
    create: ['email', 'dateOfBirth', 'ssn'],
    update: ['firstName', 'lastName', 'email', 'dateOfBirth', 'ssn'],
  }
}

export function AdminProfile({
  companyId,
  employeeId,
  defaultValues,
  isSelfOnboardingEnabled = true,
  className = '',
  dictionary,
  onEvent,
}: ProfileProps) {
  useI18n('Employee.Profile')
  useI18n('Employee.HomeAddress')
  useComponentDictionary('Employee.Profile', dictionary)

  const [resolvedEmployeeId, setResolvedEmployeeId] = useState(employeeId)
  const isCreateMode = !resolvedEmployeeId

  const createModeSelfOnboarding =
    isCreateMode && isSelfOnboardingEnabled && (defaultValues?.inviteEmployeeDefault ?? false)

  const [selfOnboardingActive, setSelfOnboardingActive] = useState(createModeSelfOnboarding)

  const optionalFieldsToRequire = useMemo(
    () => computeOptionalFieldsToRequire(selfOnboardingActive),
    [selfOnboardingActive],
  )

  const employeeDetailsDefaults = useMemo(
    () => ({
      ...defaultValues?.employee,
      ...(isCreateMode && { selfOnboarding: createModeSelfOnboarding }),
    }),
    [defaultValues, isCreateMode, createModeSelfOnboarding],
  )

  const employeeDetails = useEmployeeDetailsForm({
    companyId,
    employeeId: resolvedEmployeeId,
    withSelfOnboardingField: true,
    optionalFieldsToRequire,
    defaultValues: employeeDetailsDefaults,
    shouldFocusError: false,
  })

  const homeAddress = useHomeAddressForm({
    employeeId: resolvedEmployeeId,
    withEffectiveDateField: false,
    defaultValues: {
      street1: defaultValues?.homeAddress?.street1,
      street2: defaultValues?.homeAddress?.street2,
      city: defaultValues?.homeAddress?.city,
      state: defaultValues?.homeAddress?.state,
      zip: defaultValues?.homeAddress?.zip,
    },
    shouldFocusError: false,
  })

  const workAddress = useWorkAddressForm({
    companyId,
    employeeId: resolvedEmployeeId,
    withEffectiveDateField: false,
    shouldFocusError: false,
  })

  const startDateForm = useForm<{ startDate: string }>({
    defaultValues: { startDate: '' },
    mode: 'onSubmit',
    shouldFocusError: false,
  })

  if (employeeDetails.isLoading || homeAddress.isLoading || workAddress.isLoading) {
    const loadingErrorHandling = composeErrorHandler([employeeDetails, homeAddress, workAddress])
    return <BaseLayout isLoading error={loadingErrorHandling.errors} />
  }

  return (
    <AdminProfileReady
      employeeDetails={employeeDetails}
      homeAddress={homeAddress}
      workAddress={workAddress}
      startDateForm={startDateForm}
      isSelfOnboardingEnabled={isSelfOnboardingEnabled}
      isCreateMode={isCreateMode}
      employeeId={employeeId}
      setResolvedEmployeeId={setResolvedEmployeeId}
      setSelfOnboardingActive={setSelfOnboardingActive}
      onEvent={onEvent}
      className={className}
    />
  )
}

interface AdminProfileReadyProps {
  employeeDetails: UseEmployeeDetailsFormReady
  homeAddress: UseHomeAddressFormReady
  workAddress: UseWorkAddressFormReady
  startDateForm: ReturnType<typeof useForm<{ startDate: string }>>
  isSelfOnboardingEnabled: boolean
  isCreateMode: boolean
  employeeId?: string
  setResolvedEmployeeId: (id: string) => void
  setSelfOnboardingActive: (active: boolean) => void
  onEvent: (event: EventType, data?: unknown) => void
  className: string
}

function AdminProfileReady({
  employeeDetails,
  homeAddress,
  workAddress,
  startDateForm,
  isSelfOnboardingEnabled,
  isCreateMode,
  employeeId,
  setResolvedEmployeeId,
  setSelfOnboardingActive,
  onEvent,
  className,
}: AdminProfileReadyProps) {
  const { t } = useTranslation('Employee.Profile')
  const { t: tHome } = useTranslation('Employee.HomeAddress')
  const Components = useComponentContext()

  const employee = employeeDetails.data.employee ?? undefined
  const completedSelfOnboarding = checkHasCompletedSelfOnboarding(employee)

  const EmployeeFields = employeeDetails.form.Fields
  const HomeAddressFields = homeAddress.form.Fields
  const WorkAddressFields = workAddress.form.Fields

  const watchedSelfOnboarding = useWatch({
    control: employeeDetails.form.hookFormInternals.formMethods.control,
    name: 'selfOnboarding',
  })

  useEffect(() => {
    setSelfOnboardingActive(watchedSelfOnboarding)
  }, [watchedSelfOnboarding, setSelfOnboardingActive])

  const shouldShowHomeAddress = !watchedSelfOnboarding || completedSelfOnboarding
  const shouldShowSsnDob = !watchedSelfOnboarding || completedSelfOnboarding

  const activeForms = [
    employeeDetails,
    ...(shouldShowHomeAddress ? [homeAddress] : []),
    workAddress,
    startDateForm,
  ]

  const { handleSubmit, errorHandling } = composeSubmitHandler(activeForms, async () => {
    const employeeResult = await employeeDetails.actions.onSubmit({
      onEmployeeCreated: emp => {
        onEvent(componentEvents.EMPLOYEE_CREATED, emp)
      },
      onEmployeeUpdated: emp => {
        onEvent(componentEvents.EMPLOYEE_UPDATED, emp)
      },
      onOnboardingStatusUpdated: status => {
        onEvent(componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED, status)
      },
    })
    if (!employeeResult) return

    const newEmployeeId = employeeResult.data.uuid
    const enteredStartDate = startDateForm.getValues('startDate')

    if (shouldShowHomeAddress) {
      const homeResult = await homeAddress.actions.onSubmit({
        employeeId: newEmployeeId,
      })
      if (!homeResult) {
        if (!employeeId) setResolvedEmployeeId(newEmployeeId)
        return
      }
      if (homeResult.mode === 'create') {
        onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_CREATED, homeResult.data)
      } else {
        onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_UPDATED, homeResult.data)
      }
    }

    const workResult = await workAddress.actions.onSubmit(
      {
        onWorkAddressCreated: wa => {
          onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_CREATED, wa)
        },
        onWorkAddressUpdated: wa => {
          onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_UPDATED, wa)
        },
      },
      {
        employeeId: newEmployeeId,
        effectiveDate: isCreateMode ? enteredStartDate || undefined : undefined,
      },
    )
    if (!workResult) {
      if (!employeeId) setResolvedEmployeeId(newEmployeeId)
      return
    }

    onEvent(componentEvents.EMPLOYEE_PROFILE_DONE, {
      ...employeeResult.data,
      startDate: enteredStartDate,
    })
  })

  const isPending =
    employeeDetails.status.isPending || homeAddress.status.isPending || workAddress.status.isPending

  const watchedCourtesyWithholding =
    homeAddress.form.hookFormInternals.formMethods.watch('courtesyWithholding')

  return (
    <section className={className}>
      <BaseLayout error={errorHandling.errors}>
        <Form onSubmit={handleSubmit}>
          <Grid gridTemplateColumns="1fr" gap={24}>
            <div>
              <Components.Heading as="h2">{t('title')}</Components.Heading>
              <Components.Text>{t('description')}</Components.Text>
            </div>

            {isSelfOnboardingEnabled && EmployeeFields.SelfOnboarding && (
              <div className={styles.switchFieldContainer}>
                <EmployeeFields.SelfOnboarding
                  label={t('selfOnboardingLabel')}
                  description={t('selfOnboardingDescription')}
                  formHookResult={employeeDetails}
                />
              </div>
            )}
            <Grid
              gap={{ base: 20, small: 8 }}
              gridTemplateColumns={{ base: '1fr', small: ['1fr', 200] }}
            >
              <EmployeeFields.FirstName
                label={t('firstName')}
                formHookResult={employeeDetails}
                validationMessages={{
                  REQUIRED: t('validations.firstName'),
                  INVALID_NAME: t('validations.firstName'),
                }}
              />
              <EmployeeFields.MiddleInitial
                label={t('middleInitial')}
                formHookResult={employeeDetails}
              />
            </Grid>
            <EmployeeFields.LastName
              label={t('lastName')}
              formHookResult={employeeDetails}
              validationMessages={{
                REQUIRED: t('validations.lastName'),
                INVALID_NAME: t('validations.lastName'),
              }}
            />

            <SDKFormProvider formHookResult={workAddress}>
              <WorkAddressFields.Location
                label={t('workAddress')}
                description={t('workAddressDescription')}
                validationMessages={{ REQUIRED: t('validations.location', { ns: 'common' }) }}
              />
            </SDKFormProvider>

            <FormProvider {...startDateForm}>
              <DatePickerField
                name="startDate"
                label={t('startDateLabel')}
                description={t('startDateDescription')}
                isRequired
                errorMessage={t('validations.startDate')}
              />
            </FormProvider>

            <EmployeeFields.Email
              label={t('email')}
              description={t('emailDescription')}
              formHookResult={employeeDetails}
              validationMessages={{
                REQUIRED: t('validations.email'),
                INVALID_EMAIL: t('validations.email'),
                EMAIL_REQUIRED_FOR_SELF_ONBOARDING: t('validations.email'),
              }}
            />

            {shouldShowSsnDob && (
              <>
                <EmployeeFields.Ssn
                  label={t('ssnLabel')}
                  formHookResult={employeeDetails}
                  validationMessages={{
                    INVALID_SSN: t('validations.ssn', { ns: 'common' }),
                    REQUIRED: t('validations.ssnRequired', { ns: 'common' }),
                  }}
                />
                <EmployeeFields.DateOfBirth
                  label={t('dobLabel')}
                  formHookResult={employeeDetails}
                  validationMessages={{ REQUIRED: t('validations.dob', { ns: 'common' }) }}
                />
              </>
            )}

            {shouldShowHomeAddress && (
              <SDKFormProvider formHookResult={homeAddress}>
                <div>
                  <Components.Heading as="h2">{tHome('formTitle')}</Components.Heading>
                  <Components.Text>{tHome('desc')}</Components.Text>
                </div>
                <Grid
                  gridTemplateColumns={{
                    base: '1fr',
                    small: ['1fr', '1fr'],
                  }}
                  gap={20}
                >
                  <HomeAddressFields.Street1
                    label={tHome('street1')}
                    validationMessages={{ REQUIRED: tHome('validations.street1') }}
                  />
                  <HomeAddressFields.Street2 label={tHome('street2')} />
                  <HomeAddressFields.City
                    label={tHome('city')}
                    validationMessages={{ REQUIRED: tHome('validations.city') }}
                  />
                  <SelectField
                    name="state"
                    options={STATES_ABBR.map((stateAbbr: (typeof STATES_ABBR)[number]) => ({
                      label: tHome(`statesHash.${stateAbbr}`, { ns: 'common' }),
                      value: stateAbbr,
                    }))}
                    label={tHome('state')}
                    placeholder={tHome('statePlaceholder')}
                    errorMessage={tHome('validations.state')}
                    isRequired
                  />
                  <HomeAddressFields.Zip
                    label={tHome('zip')}
                    validationMessages={{
                      REQUIRED: tHome('validations.zip'),
                      INVALID_ZIP: tHome('validations.zip'),
                    }}
                  />
                </Grid>
                <HomeAddressFields.CourtesyWithholding
                  label={tHome('courtesyWithholdingLabel')}
                  description={
                    <>
                      {tHome('courtesyWithholdingDescription')}
                      <Trans
                        t={tHome}
                        i18nKey="learnMoreCta"
                        components={{
                          LearnMoreLink: <Components.Link />,
                        }}
                      />
                    </>
                  }
                />
                {watchedCourtesyWithholding && (
                  <Components.Alert label={tHome('withholdingTitle')} status="warning">
                    <Trans t={tHome} i18nKey="withholdingNote" />
                  </Components.Alert>
                )}
              </SDKFormProvider>
            )}
          </Grid>
          <ActionsLayout>
            <Components.Button type="submit" isLoading={isPending}>
              {t('submitCta')}
            </Components.Button>
          </ActionsLayout>
        </Form>
      </BaseLayout>
    </section>
  )
}
