import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import {
  useContractorDetailsForm,
  type ContractorDetailsOptionalFieldsToRequire,
} from './shared/useContractorDetailsForm'
import type { ContractorSelfOnboardingProfileProps } from './SelfOnboardingContractorProfile'
import styles from './ContractorProfile.module.scss'
import { BaseLayout } from '@/components/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { Form } from '@/components/Common/Form'
import { Flex, Grid } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents } from '@/shared/constants'

const INDIVIDUAL_REQUIRED_FIELDS: ContractorDetailsOptionalFieldsToRequire = {
  update: ['firstName', 'lastName', 'ssn'],
}

/**
 * Self-onboarding profile for an individual contractor — collects legal name
 * and SSN.
 *
 * @internal
 */
export function IndividualSelfOnboardingProfile({
  contractorId,
  onEvent,
  className,
}: ContractorSelfOnboardingProfileProps) {
  const { t } = useTranslation('Contractor.Profile')
  const Components = useComponentContext()

  const contractor = useContractorDetailsForm({
    contractorId,
    withSelfOnboardingField: false,
    defaultValues: { selfOnboarding: true },
    optionalFieldsToRequire: INDIVIDUAL_REQUIRED_FIELDS,
  })

  if (contractor.isLoading) {
    return <BaseLayout isLoading error={contractor.errorHandling.errors} />
  }

  const { Fields } = contractor.form

  const handleSubmit = async () => {
    const result = await contractor.actions.onSubmit()
    if (!result) return

    onEvent(componentEvents.CONTRACTOR_UPDATED, result.data)
    onEvent(componentEvents.CONTRACTOR_PROFILE_DONE, {
      contractorId: result.data.uuid,
      selfOnboarding: true,
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
                  <Components.Heading as="h2">{t('selfOnboarding.title')}</Components.Heading>
                  <Components.Text variant="supporting">
                    {t('selfOnboarding.individualDescription')}
                  </Components.Text>
                </Flex>
              </header>

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
            </Flex>

            <Flex gap={12} justifyContent="flex-end">
              <Components.Button
                type="submit"
                variant="primary"
                isDisabled={contractor.status.isPending}
              >
                {contractor.status.isPending
                  ? t('selfOnboarding.submitting')
                  : t('selfOnboarding.continue')}
              </Components.Button>
            </Flex>
          </Form>
        </SDKFormProvider>
      </BaseLayout>
    </section>
  )
}
