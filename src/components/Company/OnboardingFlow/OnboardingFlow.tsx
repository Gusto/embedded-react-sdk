import type { OnboardingFlowProps } from './OnboardingFlowComponents'
import { useCompanyOnboardingFlow } from './useCompanyOnboardingFlow'
import { Flow } from '@/components/Flow/Flow'

export const OnboardingFlow = ({ companyId, onEvent, defaultValues }: OnboardingFlowProps) => {
  const {
    meta: { machine },
  } = useCompanyOnboardingFlow({ companyId, defaultValues })

  return <Flow machine={machine} onEvent={onEvent} />
}
