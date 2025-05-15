import { createMachine } from 'robot3'
import { onboardingMachine } from './onboardingStateMachine'
import {
  OnboardingOverviewContextual,
  type OnboardingFlowContextInterface,
} from './OnboardingFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import type { RequireAtLeastOne } from '@/types/Helpers'
import type { FlowContextInterface } from '@/components/Flow/useFlow'

export type OnboardingFlowDefaultValues = RequireAtLeastOne<{
  //TODO: adjust
  profile?: unknown
  compensation?: unknown
}>
export interface OnboardingFlowProps extends BaseComponentInterface {
  companyId: string
  defaultValues?: RequireAtLeastOne<OnboardingFlowDefaultValues>
}
export interface OnboardingContextInterface extends FlowContextInterface {
  companyId: string
}

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
      currentStep: null, //Overview step does not show progress bar
    }),
  )
  return <Flow machine={onboardingFlow} onEvent={onEvent} />
}
