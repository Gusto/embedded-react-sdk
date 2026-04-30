import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { onboardingMachine } from './onboardingStateMachine'
import type { OnboardingFlowProps } from './OnboardingFlowComponents'
import {
  ContractorListContextual,
  type OnboardingFlowContextInterface,
} from './OnboardingFlowComponents'
import { Flow } from '@/components/Flow/Flow'

export const OnboardingFlow = ({ companyId, onEvent, defaultValues }: OnboardingFlowProps) => {
  const onboardingFlow = useMemo(
    () =>
      createMachine(
        'list',
        onboardingMachine,
        (initialContext: OnboardingFlowContextInterface) => ({
          ...initialContext,
          component: ContractorListContextual,
          companyId,
          defaultValues,
          selfOnboarding: false,
        }),
      ),
    [companyId, defaultValues],
  )
  return <Flow machine={onboardingFlow} onEvent={onEvent} />
}
