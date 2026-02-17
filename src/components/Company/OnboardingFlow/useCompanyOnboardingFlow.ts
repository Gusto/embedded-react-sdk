import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { onboardingMachine } from './onboardingStateMachine'
import type { OnboardingFlowProps } from './OnboardingFlowComponents'
import {
  OnboardingOverviewContextual,
  type OnboardingFlowContextInterface,
} from './OnboardingFlowComponents'

type UseCompanyOnboardingFlowProps = Pick<OnboardingFlowProps, 'companyId' | 'defaultValues'>

export function useCompanyOnboardingFlow({
  companyId,
  defaultValues,
}: UseCompanyOnboardingFlowProps) {
  const machine = useMemo(
    () =>
      createMachine(
        'overview',
        onboardingMachine,
        (initialContext: OnboardingFlowContextInterface) => ({
          ...initialContext,
          component: OnboardingOverviewContextual,
          companyId,
          defaultValues,
          totalSteps: 8,
          currentStep: 1,
          progressBarType: null,
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
