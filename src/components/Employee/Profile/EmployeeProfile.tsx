import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import type { ProfileProps } from './Profile'
import styles from './EmployeeProfile.module.scss'
import { useEmployeeDetailsForm } from './shared/useEmployeeDetailsForm'
import type { EmployeeDetailsOptionalFieldsToRequire } from './shared/useEmployeeDetailsForm'
import { useCurrentHomeAddressForm } from './shared/useHomeAddressForm'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { composeSubmitHandler } from '@/partner-hook-utils/form/composeSubmitHandler'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { SelectField } from '@/components/Common'
import { Grid } from '@/components/Common/Grid/Grid'
import { ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { BaseLayout } from '@/components/Base'
import { useI18n } from '@/i18n'
import { componentEvents, STATES_ABBR } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary } from '@/i18n/I18n'
import { getStreet, getCityStateZip } from '@/helpers/formattedStrings'

const SELF_OPTIONAL_FIELDS: EmployeeDetailsOptionalFieldsToRequire = {
  create: ['dateOfBirth', 'ssn'],
  update: ['firstName', 'lastName', 'dateOfBirth', 'ssn'],
}

export function EmployeeProfile({
  companyId,
  employeeId,
  defaultValues,
  className = '',
  dictionary,
  onEvent,
}: ProfileProps) {
  useI18n('Employee.Profile')
  useI18n('Employee.HomeAddress')
  useComponentDictionary('Employee.Profile', dictionary)
  const { t } = useTranslation('Employee.Profile')
  const { t: tHome } = useTranslation('Employee.HomeAddress')
  const Components = useComponentContext()

  const [resolvedEmployeeId, setResolvedEmployeeId] = useState(employeeId)

  const employeeDetails = useEmployeeDetailsForm({
    companyId,
    employeeId: resolvedEmployeeId,
    withSelfOnboardingField: false,
    optionalFieldsToRequire: SELF_OPTIONAL_FIELDS,
    defaultValues: defaultValues?.employee,
    shouldFocusError: false,
  })

  const homeAddress = useCurrentHomeAddressForm({
    employeeId: resolvedEmployeeId ?? '',
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

  const workAddressesQuery = useEmployeeAddressesGetWorkAddresses(
    { employeeId: resolvedEmployeeId ?? '' },
    { enabled: !!resolvedEmployeeId },
  )
  const workAddresses = workAddressesQuery.data?.employeeWorkAddressesList
  const activeWorkAddress = workAddresses?.find(address => address.active)

  if (employeeDetails.isLoading || homeAddress.isLoading || workAddressesQuery.isLoading) {
    const loadingErrorHandling = composeErrorHandler([
      employeeDetails,
      homeAddress,
      workAddressesQuery,
    ])
    return <BaseLayout isLoading error={loadingErrorHandling.errors} />
  }

  const EmpFields = employeeDetails.form.Fields
  const HomeFields = homeAddress.form.Fields

  const submitResult = composeSubmitHandler([employeeDetails, homeAddress], async () => {
    const employeeResult = await employeeDetails.actions.onSubmit({
      onEmployeeCreated: emp => {
        onEvent(componentEvents.EMPLOYEE_CREATED, emp)
      },
      onEmployeeUpdated: emp => {
        onEvent(componentEvents.EMPLOYEE_UPDATED, emp)
      },
    })
    if (!employeeResult) return

    const newEmployeeId = employeeResult.data.uuid

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

    onEvent(componentEvents.EMPLOYEE_PROFILE_DONE, employeeResult.data)
  })

  const errorHandling = composeErrorHandler([
    submitResult,
    { errorHandling: homeAddress.errorHandling },
    workAddressesQuery,
  ])

  const isPending = employeeDetails.status.isPending || homeAddress.status.isPending

  return (
    <section className={classNames(styles.container, className)}>
      <BaseLayout error={errorHandling.errors}>
        <Form onSubmit={submitResult.handleSubmit}>
          <Grid gridTemplateColumns="1fr" gap={24}>
            <div>
              <Components.Heading as="h2">{t('title')}</Components.Heading>
              <Components.Text>{t('description')}</Components.Text>
            </div>

            <SDKFormProvider formHookResult={employeeDetails}>
              <Grid
                gap={{ base: 20, small: 8 }}
                gridTemplateColumns={{ base: '1fr', small: ['1fr', 200] }}
              >
                <EmpFields.FirstName
                  label={t('firstName')}
                  validationMessages={{
                    REQUIRED: t('validations.firstName'),
                    INVALID_NAME: t('validations.firstName'),
                  }}
                />
                <EmpFields.MiddleInitial label={t('middleInitial')} />
              </Grid>
              <EmpFields.LastName
                label={t('lastName')}
                validationMessages={{
                  REQUIRED: t('validations.lastName'),
                  INVALID_NAME: t('validations.lastName'),
                }}
              />
              <EmpFields.Ssn
                label={t('ssnLabel')}
                validationMessages={{
                  INVALID_SSN: t('validations.ssn', { ns: 'common' }),
                  REQUIRED: t('validations.ssnRequired', { ns: 'common' }),
                }}
              />
              <EmpFields.DateOfBirth
                label={t('dobLabel')}
                validationMessages={{ REQUIRED: t('validations.dob', { ns: 'common' }) }}
              />
            </SDKFormProvider>

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
                <HomeFields.Street1
                  label={tHome('street1')}
                  validationMessages={{ REQUIRED: tHome('validations.street1') }}
                />
                <HomeFields.Street2 label={tHome('street2')} />
                <HomeFields.City
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
                <HomeFields.Zip
                  label={tHome('zip')}
                  validationMessages={{
                    REQUIRED: tHome('validations.zip'),
                    INVALID_ZIP: tHome('validations.zip'),
                  }}
                />
              </Grid>
            </SDKFormProvider>

            {activeWorkAddress && (
              <section>
                <Components.Heading as="h2">{t('workAddressSectionTitle')}</Components.Heading>
                <Components.Text>{t('workAddressSectionDescription')}</Components.Text>
                <address className={styles.address}>
                  <Components.Text>{getStreet(activeWorkAddress)}</Components.Text>
                  <Components.Text>{getCityStateZip(activeWorkAddress)}</Components.Text>
                </address>
              </section>
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
