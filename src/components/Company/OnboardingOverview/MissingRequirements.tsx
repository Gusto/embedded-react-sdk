import { useTranslation } from 'react-i18next'
import { useOnboardingOverview } from './context'
import { ActionsLayout, Flex } from '@/components/Common'
import { RequirementsList } from '@/components/Common/RequirementsList/RequirementsList'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import ArrowRightIcon from '@/assets/icons/icon-arrow-right.svg?react'

/** @internal */
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
      header={
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as="h2">
            {t(isInitialSetup ? 'initialSetupTitle' : 'missingRequirementsTitle')}
          </Components.Heading>
          <Components.Text variant="supporting">
            {t(isInitialSetup ? 'initialSetupDescription' : 'missingRequirementsDescription')}
          </Components.Text>
        </Flex>
      }
      footer={
        <ActionsLayout>
          <Components.Button variant="secondary" onClick={handleContinue}>
            {t(isInitialSetup ? 'initialSetupCta' : 'missingRequirementsCta')}
            <ArrowRightIcon aria-hidden />
          </Components.Button>
        </ActionsLayout>
      }
    >
      {onboardingSteps && (
        <RequirementsList
          requirements={onboardingSteps
            .filter(
              (
                step,
              ): step is typeof step & {
                id: NonNullable<typeof step.id>
                completed: boolean
              } => step.id !== undefined && step.completed !== undefined,
            )
            .map(step => ({
              completed: step.completed,
              title: t(`stepTitles.${step.id}`),
              description: t(`stepDescriptions.${step.id}`),
            }))}
        />
      )}
    </Components.Box>
  )
}
