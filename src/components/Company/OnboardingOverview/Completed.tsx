import { useTranslation } from 'react-i18next'
import { useOnboardingOverview } from './context'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const Completed = () => {
  const Components = useComponentContext()
  const { onboardingCompleted, handleDone } = useOnboardingOverview()
  const { t } = useTranslation('Company.OnboardingOverview')
  if (!onboardingCompleted) {
    return null
  }
  return (
    <Flex alignItems="center" flexDirection="column" gap={8}>
      <Components.Heading as="h2" textAlign="center">
        {t('onboardingCompletedTitle')}
      </Components.Heading>
      <p>{t('onboardingCompletedDescription')}</p>
      <Components.Button variant="secondary" onClick={handleDone}>
        {t('onboardingCompletedCta')}
      </Components.Button>
    </Flex>
  )
}
