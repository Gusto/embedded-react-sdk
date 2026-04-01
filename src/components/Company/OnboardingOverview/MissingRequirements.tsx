import { useTranslation } from 'react-i18next'
import { useOnboardingOverview } from './context'
import { ActionsLayout, Flex } from '@/components/Common'
import { RequirementsList } from '@/components/Common/RequirementsList/RequirementsList'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import ArrowRightIcon from '@/assets/icons/icon-arrow-right.svg?react'

export const MissingRequirements = () => {
  const Components = useComponentContext()
  const { onboardingSteps, onboardingCompleted, handleContinue } = useOnboardingOverview()
  const { t } = useTranslation('Company.OnboardingOverview')

  if (onboardingCompleted) {
    return null
  }

  const isInitialSetup = !onboardingSteps?.some(step => step.required && step.completed)

  return (
    <Components.Box
      footer={
        <ActionsLayout>
          <Components.Button variant="secondary" onClick={handleContinue}>
            {t(isInitialSetup ? 'initialSetupCta' : 'missingRequirementsCta')}
            <ArrowRightIcon aria-hidden />
          </Components.Button>
        </ActionsLayout>
      }
    >
      <Flex flexDirection="column" alignItems="flex-start" gap={32}>
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as="h2">
            {t(isInitialSetup ? 'initialSetupTitle' : 'missingRequirementsTitle')}
          </Components.Heading>
          <Components.Text variant="supporting">
            {t(isInitialSetup ? 'initialSetupDescription' : 'missingRequirementsDescription')}
          </Components.Text>
        </Flex>
        {onboardingSteps && (
          <RequirementsList
            requirements={onboardingSteps.map(step => ({
              completed: step.completed!,
              title: t(`stepTitles.${step.id!}`),
              description: t(`stepDescriptions.${step.id!}`),
            }))}
          />
        )}
      </Flex>
    </Components.Box>
  )
}
