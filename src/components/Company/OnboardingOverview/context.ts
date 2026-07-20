import type { OnboardingStep } from '@gusto/embedded-api/models/components/companyonboardingstatus'
import { createCompoundContext } from '@/components/Base'

type OnboardingOverviewContextType = {
  onboardingCompleted?: boolean
  onboardingSteps?: OnboardingStep[]
  handleDone: () => void
  handleContinue: () => void
}

const [useOnboardingOverview, OnboardingOverviewProvider] =
  createCompoundContext<OnboardingOverviewContextType>('OnboardingOverviewContext')

export { useOnboardingOverview, OnboardingOverviewProvider }
