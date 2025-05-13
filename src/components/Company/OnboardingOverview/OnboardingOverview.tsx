import { useCompaniesGetOnboardingStatusSuspense } from '@gusto/embedded-api/react-query/companiesGetOnboardingStatus'
import { useTranslation } from 'react-i18next'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { Flex } from '@/components/Common'
import { componentEvents } from '@/shared/constants'
import { RequirementsList } from '@/components/Common/RequirementsList/RequirementsList'

interface OnboardingOverviewProps extends CommonComponentInterface {
  companyId: string
}

export function OnboardingOverview(props: OnboardingOverviewProps & BaseComponentInterface) {
  useI18n('Company.OnboardingOverview')

  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ companyId, className }: OnboardingOverviewProps) => {
  const { onEvent } = useBase()
  const { t } = useTranslation('Company.OnboardingOverview')
  const Components = useComponentContext()

  const { data } = useCompaniesGetOnboardingStatusSuspense({ companyUuid: companyId })
  const { onboardingCompleted, onboardingSteps } = data.companyOnboardingStatus!

  const handleDone = () => {
    onEvent(componentEvents.COMPANY_OVERVIEW_DONE)
  }

  return (
    <section className={className}>
      <Flex flexDirection="column" gap={32}>
        {onboardingCompleted ? (
          <Flex alignItems="center" flexDirection="column" gap={8}>
            <Components.Heading as="h2" textAlign="center">
              {t('onboardingCompletedTitle')}
            </Components.Heading>
            <p>{t('onboardingCompletedDescription')}</p>
            <Components.Button variant="secondary" onClick={handleDone}>
              {t('onboardingCompletedCta')}
            </Components.Button>
          </Flex>
        ) : (
          <Flex flexDirection="column" alignItems="flex-start" gap={8}>
            <Components.Heading as="h2">{t('missingRequirementsTitle')}</Components.Heading>
            <p>{t('missingRequirementsDescription')}</p>
            {onboardingSteps && (
              <RequirementsList
                requirements={onboardingSteps.map(step => ({
                  completed: step.completed!,
                  title: step.title!, //TODO: I18n
                  description: 'placeholder', // TODO: I18n
                }))}
              />
            )}
          </Flex>
        )}
      </Flex>
    </section>
  )
}
