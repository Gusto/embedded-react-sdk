import { createMachine } from 'robot3'
import { onboardingMachine } from './onboardingStateMachine'
import type { OnboardingFlowProps } from './OnboardingFlowComponents'
import {
  ContractorListContextual,
  ProgressBarCta,
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
      progressBarCta: ProgressBarCta,
      companyId,
      defaultValues,
      totalSteps: 5,
      currentStep: 0,
      selfOnboarding: false,
    }),
  )
  return <Flow machine={onboardingFlow} onEvent={onEvent} />
}
