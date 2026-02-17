import { useMemo } from 'react'
import { createMachine } from 'robot3'
import type { SelfOnboardingContextInterface } from './SelfOnboardingComponents'
import { Landing } from './SelfOnboardingComponents'
import { employeeSelfOnboardingMachine } from './selfOnboardingMachine'

interface UseEmployeeSelfOnboardingFlowProps {
  companyId: string
  employeeId: string
}

export function useEmployeeSelfOnboardingFlow({
  companyId,
  employeeId,
}: UseEmployeeSelfOnboardingFlowProps) {
  const machine = useMemo(
    () =>
      createMachine(
        'index',
        employeeSelfOnboardingMachine,
        (initialContext: SelfOnboardingContextInterface) => ({
          ...initialContext,
          component: Landing,
          companyId,
          employeeId,
        }),
      ),
    [companyId, employeeId],
  )

  return {
    data: {},
    actions: {},
    meta: {
      machine,
    },
  }
}
