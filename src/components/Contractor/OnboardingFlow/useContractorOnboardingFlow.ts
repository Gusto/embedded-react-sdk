import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { onboardingMachine } from './onboardingStateMachine'
import type { OnboardingFlowProps } from './OnboardingFlowComponents'
import {
  ContractorListContextual,
  ProgressBarCta,
  type OnboardingFlowContextInterface,
} from './OnboardingFlowComponents'

type UseContractorOnboardingFlowProps = Pick<OnboardingFlowProps, 'companyId' | 'defaultValues'>

export function useContractorOnboardingFlow({
  companyId,
  defaultValues,
}: UseContractorOnboardingFlowProps) {
  const machine = useMemo(
    () =>
      createMachine(
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
      ),
    [companyId, defaultValues],
  )

  return {
    data: {},
    actions: {},
    meta: {
      machine,
    },
  }
}
