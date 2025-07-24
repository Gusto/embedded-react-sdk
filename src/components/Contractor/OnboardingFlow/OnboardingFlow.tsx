import { createMachine } from 'robot3'
import { onboardingMachine } from './onboardingStateMachine'
import type { OnboardingFlowProps } from './OnboardingFlowComponents'
import {
  ContractorListContextual,
  type OnboardingFlowContextInterface,
} from './OnboardingFlowComponents'
import { Flow } from '@/components/Flow/Flow'

export const OnboardingFlow = ({ companyId, onEvent, defaultValues }: OnboardingFlowProps) => {
  const onboardingFlow = createMachine(
    'list',
    onboardingMachine,
    (initialContext: OnboardingFlowContextInterface) => ({
      ...initialContext,
      component: ContractorListContextual,
      companyId,
      // defaultValues,
      totalSteps: 8,
      currentStep: 1,
    }),
  )
  return <Flow machine={onboardingFlow} onEvent={onEvent} />
}
