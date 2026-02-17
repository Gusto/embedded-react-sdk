import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { EmployeeListContextual } from '../EmployeeList/EmployeeList'
import { employeeOnboardingMachine } from './onboardingStateMachine'
import type {
  OnboardingDefaultValues,
  OnboardingContextInterface,
} from './OnboardingFlowComponents'
import type { RequireAtLeastOne } from '@/types/Helpers'

interface UseEmployeeOnboardingFlowProps {
  companyId: string
  defaultValues?: RequireAtLeastOne<OnboardingDefaultValues>
  isSelfOnboardingEnabled?: boolean
}

export function useEmployeeOnboardingFlow({
  companyId,
  defaultValues,
  isSelfOnboardingEnabled = true,
}: UseEmployeeOnboardingFlowProps) {
  const machine = useMemo(
    () =>
      createMachine(
        'index',
        employeeOnboardingMachine,
        (initialContext: OnboardingContextInterface) => ({
          ...initialContext,
          component: EmployeeListContextual,
          companyId,
          isAdmin: true,
          defaultValues,
          isSelfOnboardingEnabled,
        }),
      ),
    [companyId, defaultValues, isSelfOnboardingEnabled],
  )

  return {
    data: {},
    actions: {},
    meta: {
      machine,
    },
  }
}
