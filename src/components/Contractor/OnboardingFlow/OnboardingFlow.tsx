import type { OnboardingFlowProps } from './OnboardingFlowComponents'
import { useContractorOnboardingFlow } from './useContractorOnboardingFlow'
import { Flow } from '@/components/Flow/Flow'

export const OnboardingFlow = ({ companyId, onEvent, defaultValues }: OnboardingFlowProps) => {
  const {
    meta: { machine },
  } = useContractorOnboardingFlow({ companyId, defaultValues })

  return <Flow machine={machine} onEvent={onEvent} />
}
