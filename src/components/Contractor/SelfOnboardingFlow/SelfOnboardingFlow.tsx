import { createMachine } from 'robot3'
import { useMemo } from 'react'
import type {
  SelfOnboardingContextInterface,
  SelfOnboardingFlowProps,
} from './SelfOnboardingComponents'
import { LandingContextual } from './SelfOnboardingComponents'
import { contractorSelfOnboardingMachine } from './selfOnboardingMachine'
import { Flow } from '@/components/Flow/Flow'

export const SelfOnboardingFlow = ({
  companyId,
  contractorId,
  onEvent,
}: SelfOnboardingFlowProps) => {
  const machine = useMemo(
    () =>
      createMachine(
        'index',
        contractorSelfOnboardingMachine,
        (initialContext: SelfOnboardingContextInterface) => ({
          ...initialContext,
          component: LandingContextual,
          companyId,
          contractorId,
        }),
      ),
    [companyId, contractorId],
  )
  return <Flow machine={machine} onEvent={onEvent} />
}
