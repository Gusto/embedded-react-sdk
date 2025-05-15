import { useTranslation } from 'react-i18next'
import { useOnboardingOverview } from './context'
import { ActionsLayout, Flex } from '@/components/Common'
import { RequirementsList } from '@/components/Common/RequirementsList/RequirementsList'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const MissingRequirements = () => {
  const Components = useComponentContext()
  const { onboardingSteps, onboardingCompleted, handleContinue } = useOnboardingOverview()
  const { t } = useTranslation('Company.OnboardingOverview')

  if (onboardingCompleted) {
    return null
  }

  const isInitialSetup = !onboardingSteps?.some(step => step.required && step.completed)

  return (
    <Flex flexDirection="column" alignItems="flex-start" gap={8}>
      <Components.Heading as="h2">
        {t(isInitialSetup ? 'initialSetupTitle' : 'missingRequirementsTitle')}
      </Components.Heading>
      <p>{t(isInitialSetup ? 'initialSetupDescription' : 'missingRequirementsDescription')}</p>
      {onboardingSteps && (
        <RequirementsList
          requirements={onboardingSteps.map(step => ({
            completed: step.completed!,
            title: t(`stepTitles.${step.id!}`),
            description: t(`stepDescriptions.${step.id!}`),
          }))}
        />
      )}
      <ActionsLayout>
        <Components.Button variant="secondary" onClick={handleContinue}>
          {t(isInitialSetup ? 'initialSetupCta' : 'missingRequirementsCta')}
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
