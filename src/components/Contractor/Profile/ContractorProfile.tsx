import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWatch } from 'react-hook-form'
import classNames from 'classnames'
import {
  useContractorDetailsForm,
  ContractorType,
  type ContractorDetailsFormData,
  type ContractorDetailsOptionalFieldsToRequire,
  type UseContractorDetailsFormReady,
} from './shared/useContractorDetailsForm'
import { SelfOnboardingContractorProfile } from './SelfOnboardingContractorProfile'
import styles from './ContractorProfile.module.scss'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { Form } from '@/components/Common/Form'
import { Flex, Grid } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'
import { componentEvents, ContractorOnboardingStatus } from '@/shared/constants'

// The admin form restores the contractor profile's product requiredness on top
// of the hook's API-aligned baseline (which leaves ssn/ein optional and
// create-only fields optional on update). When the admin invites the contractor
// to self-onboard, SSN/EIN are hidden and the contractor supplies them later, so
// they are dropped from the required set. An SSN/EIN already on file is still
// waived via redaction, so promoting them when not inviting is safe.
function computeRequiredFields(
  selfOnboardingActive: boolean,
): ContractorDetailsOptionalFieldsToRequire {
  const base: ContractorDetailsOptionalFieldsToRequire = {
    create: [],
    update: ['firstName', 'lastName', 'businessName', 'hourlyRate', 'workState'],
  }
  if (selfOnboardingActive) return base
  return {
    create: [...(base.create ?? []), 'ssn', 'ein'],
    update: [...(base.update ?? []), 'ssn', 'ein'],
  }
}

/**
 * Props for {@link ContractorProfile}.
 *
 * @remarks
 * Discriminated by `isAdmin`. In admin mode (the default) `contractorId` is
 * optional — omitting it creates a new contractor. In self-onboarding mode
 * (`isAdmin={false}`) `contractorId` is required, because the contractor must
 * already exist for its type (individual vs. business) to be resolved.
 *
 * @public
 */
export type ContractorProfileProps = BaseComponentInterface<'Contractor.Profile'> & {
  /** UUID of the company the contractor belongs to. */
  companyId: string
  /** Initial values for the contractor profile form fields. */
  defaultValues?: Partial<ContractorDetailsFormData>
} & (
    | {
        /** When `true` (the default), renders the admin create/edit form. */
        isAdmin?: true
        /** UUID of an existing contractor to edit. When omitted, the form creates a new contractor. */
        contractorId?: string
      }
    | {
        /** When `false`, renders the contractor self-onboarding profile. */
        isAdmin: false
        /** UUID of the existing contractor completing self-onboarding. Required in self-onboarding mode. */
        contractorId: string
      }
  )

/**
 * Form for creating or editing a contractor profile, supporting both individual and business contractor types.
 *
 * @remarks
 * In admin mode (the default), renders different field sets depending on the contractor type (individual
 * vs. business) and wage type (hourly vs. fixed), and exposes a self-onboarding toggle that invites the
 * contractor to complete their own setup. When `contractorId` is provided, the form fetches the existing
 * contractor and updates it on submit; otherwise it creates a new contractor under `companyId`.
 *
 * When `isAdmin` is `false`, renders the contractor self-onboarding profile instead: it resolves the
 * existing contractor's type and presents the individual (name + SSN) or business (business name + EIN)
 * fields for the contractor to complete.
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
export function ContractorProfile(props: ContractorProfileProps) {
  useComponentDictionary('Contractor.Profile', props.dictionary)
  return (
    <BaseBoundaries componentName="Contractor.Profile" FallbackComponent={props.FallbackComponent}>
      {props.isAdmin === false ? (
        <SelfOnboardingContractorProfile
          contractorId={props.contractorId}
          onEvent={props.onEvent}
          className={props.className}
        />
      ) : (
        <ContractorProfileRoot {...props} />
      )}
    </BaseBoundaries>
  )
}

function ContractorProfileRoot({
  companyId,
  contractorId,
  defaultValues,
  className,
  onEvent,
}: ContractorProfileProps) {
  useI18n('Contractor.Profile')

  const resolvedDefaults = useMemo<Partial<ContractorDetailsFormData>>(
    () => ({ type: ContractorType.Business, ...defaultValues }),
    [defaultValues],
  )

  // Mirrors the Employee AdminProfile loop: SSN/EIN requiredness depends on the
  // self-onboarding toggle, which lives in the form the hook creates. Seed from
  // the create-mode default, then sync from the watched value (see the ready child).
  const [selfOnboardingActive, setSelfOnboardingActive] = useState(
    !contractorId && (resolvedDefaults.selfOnboarding ?? false),
  )

  const optionalFieldsToRequire = useMemo(
    () => computeRequiredFields(selfOnboardingActive),
    [selfOnboardingActive],
  )

  const contractor = useContractorDetailsForm(
    contractorId
      ? {
          companyId,
          contractorId,
          defaultValues: resolvedDefaults,
          optionalFieldsToRequire,
        }
      : {
          companyId,
          defaultValues: resolvedDefaults,
          optionalFieldsToRequire,
        },
  )

  if (contractor.isLoading) {
    return <BaseLayout isLoading error={contractor.errorHandling.errors} />
  }

  return (
    <ContractorProfileReady
      contractor={contractor}
      onEvent={onEvent}
      className={className}
      setSelfOnboardingActive={setSelfOnboardingActive}
    />
  )
}

interface ContractorProfileReadyProps {
  contractor: UseContractorDetailsFormReady
  onEvent: ContractorProfileProps['onEvent']
  className?: string
  setSelfOnboardingActive: (value: boolean) => void
}

function ContractorProfileReady({
  contractor,
  onEvent,
  className,
  setSelfOnboardingActive,
}: ContractorProfileReadyProps) {
  const { t } = useTranslation('Contractor.Profile')
  const Components = useComponentContext()

  const watchedSelfOnboarding = useWatch({
    control: contractor.form.hookFormInternals.formMethods.control,
    name: 'selfOnboarding',
  })

  useEffect(() => {
    setSelfOnboardingActive(watchedSelfOnboarding)
  }, [watchedSelfOnboarding, setSelfOnboardingActive])

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
    <section className={classNames(styles.root, className)}>
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

              {(Fields.SelfOnboarding || Fields.Email) && (
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
              )}

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
                  {Fields.Ssn && !watchedSelfOnboarding && (
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
                  {Fields.Ein && !watchedSelfOnboarding && (
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
