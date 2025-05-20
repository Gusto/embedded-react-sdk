import { createMachine } from 'robot3'
import { onboardingMachine } from './onboardingStateMachine'
import type { OnboardingFlowProps } from './OnboardingFlowComponents'
import {
  OnboardingOverviewContextual,
  type OnboardingFlowContextInterface,
} from './OnboardingFlowComponents'
import { Flow } from '@/components/Flow/Flow'

export const OnboardingFlow = ({ companyId, onEvent, defaultValues }: OnboardingFlowProps) => {
  const onboardingFlow = createMachine(
    'overview',
    onboardingMachine,
    (initialContext: OnboardingFlowContextInterface) => ({
      ...initialContext,
      component: OnboardingOverviewContextual,
      companyId,
      defaultValues,
      totalSteps: 8,
      currentStep: 1,
      showProgress: false, //Overview step does not show progress bar
    }),
  )
  return <Flow machine={onboardingFlow} onEvent={onEvent} />
}
