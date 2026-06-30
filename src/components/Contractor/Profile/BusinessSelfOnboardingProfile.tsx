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
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents } from '@/shared/constants'

const BUSINESS_REQUIRED_FIELDS: ContractorDetailsOptionalFieldsToRequire = {
  update: ['businessName', 'ein'],
}

/**
 * Self-onboarding profile for a business contractor — collects business name
 * and EIN.
 *
 * @internal
 */
export function BusinessSelfOnboardingProfile({
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
    optionalFieldsToRequire: BUSINESS_REQUIRED_FIELDS,
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
                    {t('selfOnboarding.businessDescription')}
                  </Components.Text>
                </Flex>
              </header>

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
