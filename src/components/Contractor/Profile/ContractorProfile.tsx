import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useWatch } from 'react-hook-form'
import {
  useContractorDetailsForm,
  ContractorType,
  type ContractorDetailsFormData,
  type ContractorDetailsOptionalFieldsToRequire,
  type UseContractorDetailsFormReady,
} from './shared/useContractorDetailsForm'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base/Base'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { Form } from '@/components/Common/Form'
import { Flex, Grid } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'
import { componentEvents, ContractorOnboardingStatus } from '@/shared/constants'

// Restores the contractor profile's product requiredness on top of the hook's
// API-aligned baseline (which leaves ssn/ein optional and create-only fields
// optional on update). Promoting an excluded field is a no-op, and an SSN/EIN
// already on file is still waived via redaction, so this static superset is safe.
const CONTRACTOR_PROFILE_REQUIRED_FIELDS: ContractorDetailsOptionalFieldsToRequire = {
  create: ['ssn', 'ein'],
  update: ['firstName', 'lastName', 'businessName', 'hourlyRate', 'workState', 'ssn', 'ein'],
}

/**
 * Props for {@link ContractorProfile}.
 *
 * @public
 */
export interface ContractorProfileProps extends CommonComponentInterface<'Contractor.Profile'> {
  /** UUID of the company the contractor belongs to. */
  companyId: string
  /** UUID of an existing contractor to edit. When omitted, the form creates a new contractor. */
  contractorId?: string
  /** Initial values for the contractor profile form fields. */
  defaultValues?: Partial<ContractorDetailsFormData>
}

/**
 * Form for creating or editing a contractor profile, supporting both individual and business contractor types.
 *
 * @remarks
 * Renders different field sets depending on the contractor type (individual vs. business) and wage type
 * (hourly vs. fixed), and exposes a self-onboarding toggle that invites the contractor to complete their
 * own setup. When `contractorId` is provided, the form fetches the existing contractor and updates it on
 * submit; otherwise it creates a new contractor under `companyId`.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/created` | A new contractor was created successfully. | The created contractor entity |
 * | `contractor/updated` | An existing contractor was updated successfully. | The updated contractor entity |
 * | `contractor/profile/done` | The contractor profile step finished. | `{ contractorId: string, selfOnboarding: boolean }` |
 *
 * @param props - See {@link ContractorProfileProps}.
 * @returns The rendered contractor profile form.
 * @public
 */
export function ContractorProfile(props: ContractorProfileProps & BaseComponentInterface) {
  useComponentDictionary('Contractor.Profile', props.dictionary)
  return (
    <BaseBoundaries componentName="Contractor.Profile" FallbackComponent={props.FallbackComponent}>
      <ContractorProfileRoot {...props} />
    </BaseBoundaries>
  )
}

function ContractorProfileRoot({
  companyId,
  contractorId,
  defaultValues,
  className,
  onEvent,
}: ContractorProfileProps & BaseComponentInterface) {
  useI18n('Contractor.Profile')

  const resolvedDefaults = useMemo<Partial<ContractorDetailsFormData>>(
    () => ({ type: ContractorType.Business, ...defaultValues }),
    [defaultValues],
  )

  const contractor = useContractorDetailsForm(
    contractorId
      ? {
          companyId,
          contractorId,
          defaultValues: resolvedDefaults,
          optionalFieldsToRequire: CONTRACTOR_PROFILE_REQUIRED_FIELDS,
        }
      : {
          companyId,
          defaultValues: resolvedDefaults,
          optionalFieldsToRequire: CONTRACTOR_PROFILE_REQUIRED_FIELDS,
        },
  )

  if (contractor.isLoading) {
    return <BaseLayout isLoading error={contractor.errorHandling.errors} />
  }

  return <ContractorProfileReady contractor={contractor} onEvent={onEvent} className={className} />
}

interface ContractorProfileReadyProps {
  contractor: UseContractorDetailsFormReady
  onEvent: BaseComponentInterface['onEvent']
  className?: string
}

function ContractorProfileReady({ contractor, onEvent, className }: ContractorProfileReadyProps) {
  const { t } = useTranslation('Contractor.Profile')
  const Components = useComponentContext()

  const watchedSelfOnboarding = useWatch({
    control: contractor.form.hookFormInternals.formMethods.control,
    name: 'selfOnboarding',
  })

  const { Fields } = contractor.form
  const mode = contractor.status.mode

  const handleSubmit = async () => {
    const onboardingStatus = contractor.data.contractor?.onboardingStatus
    const result = await contractor.actions.onSubmit()
    if (!result) return

    onEvent(
      result.mode === 'create'
        ? componentEvents.CONTRACTOR_CREATED
        : componentEvents.CONTRACTOR_UPDATED,
      result.data,
    )

    onEvent(componentEvents.CONTRACTOR_PROFILE_DONE, {
      contractorId: result.data.uuid,
      selfOnboarding:
        watchedSelfOnboarding &&
        onboardingStatus !== ContractorOnboardingStatus.ADMIN_ONBOARDING_REVIEW,
    })
  }

  return (
    <section className={className}>
      <BaseLayout error={contractor.errorHandling.errors}>
        <SDKFormProvider formHookResult={contractor}>
          <Form onSubmit={() => void handleSubmit()}>
            <Flex flexDirection="column" gap={20} alignItems="stretch">
              <header>
                <Flex flexDirection="column" gap={4}>
                  <Components.Heading as="h2">{t('title')}</Components.Heading>
                  <Components.Text variant="supporting">{t('subtitle')}</Components.Text>
                </Flex>
              </header>

              <Components.Box>
                <Grid gap={16}>
                  {Fields.SelfOnboarding && (
                    <Fields.SelfOnboarding
                      label={t('fields.selfOnboarding.label')}
                      description={t('fields.selfOnboarding.description')}
                    />
                  )}

                  {Fields.Email && (
                    <Fields.Email
                      label={t('fields.email.label')}
                      validationMessages={{
                        REQUIRED: t('validations.email'),
                        INVALID_EMAIL: t('validations.emailFormat'),
                      }}
                    />
                  )}
                </Grid>
              </Components.Box>

              <Fields.Type label={t('fields.contractorType.label')} />

              {Fields.FirstName && Fields.LastName && (
                <>
                  <Grid gridTemplateColumns={{ base: '1fr', medium: '1fr 1fr' }} gap={16}>
                    <Fields.FirstName
                      label={t('fields.firstName.label')}
                      validationMessages={{
                        REQUIRED: t('validations.firstName'),
                        INVALID_NAME: t('validations.firstNameFormat'),
                      }}
                    />
                    {Fields.MiddleInitial && (
                      <Fields.MiddleInitial label={t('fields.middleInitial.label')} />
                    )}
                  </Grid>
                  <Fields.LastName
                    label={t('fields.lastName.label')}
                    validationMessages={{
                      REQUIRED: t('validations.lastName'),
                      INVALID_NAME: t('validations.lastNameFormat'),
                    }}
                  />
                  {Fields.Ssn && (
                    <Fields.Ssn
                      label={t('fields.ssn.label')}
                      validationMessages={{
                        INVALID_SSN: t('validations.ssnFormat'),
                        REQUIRED: t('validations.ssn'),
                      }}
                    />
                  )}
                </>
              )}

              {Fields.BusinessName && (
                <>
                  <Fields.BusinessName
                    label={t('fields.businessName.label')}
                    validationMessages={{ REQUIRED: t('validations.businessName') }}
                  />
                  {Fields.Ein && (
                    <Fields.Ein
                      label={t('fields.ein.label')}
                      validationMessages={{
                        INVALID_EIN: t('validations.einFormat'),
                        REQUIRED: t('validations.ein'),
                      }}
                    />
                  )}
                </>
              )}

              <Fields.WageType label={t('fields.wageType.label')} />

              {Fields.HourlyRate && (
                <Fields.HourlyRate
                  label={t('fields.hourlyRate.label')}
                  min={0}
                  format="currency"
                  validationMessages={{ REQUIRED: t('validations.hourlyRate') }}
                />
              )}

              <Fields.StartDate
                label={t('fields.startDate.label')}
                description={t('fields.startDate.description')}
                validationMessages={{ REQUIRED: t('validations.startDate') }}
              />
            </Flex>

            <Flex gap={12} justifyContent="flex-end">
              <Components.Button
                type="submit"
                variant="primary"
                isDisabled={contractor.status.isPending}
              >
                {contractor.status.isPending
                  ? mode === 'create'
                    ? t('buttons.creating')
                    : t('buttons.updating')
                  : mode === 'create'
                    ? t('buttons.create')
                    : t('buttons.update')}
              </Components.Button>
            </Flex>
          </Form>
        </SDKFormProvider>
      </BaseLayout>
    </section>
  )
}
