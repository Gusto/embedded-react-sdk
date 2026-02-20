import { createMachine } from 'robot3'
import { useMemo } from 'react'
import type {
  SelfOnboardingContextInterface,
  SelfOnboardingFlowProps,
} from './SelfOnboardingComponents'
import { Landing } from './SelfOnboardingComponents'
import { employeeSelfOnboardingMachine } from './selfOnboardingMachine'
import { Flow } from '@/components/Flow/Flow'

export const SelfOnboardingFlow = ({
  companyId,
  employeeId,
  withEmployeeI9 = false,
  onEvent,
}: SelfOnboardingFlowProps) => {
  const manageEmployees = useMemo(
    () =>
      createMachine(
        'index',
        employeeSelfOnboardingMachine,
        (initialContext: SelfOnboardingContextInterface) => ({
          ...initialContext,
          component: Landing,
          companyId,
          employeeId,
          withEmployeeI9,
        }),
      ),
    [companyId, employeeId, withEmployeeI9],
  )
  return <Flow machine={manageEmployees} onEvent={onEvent} />
}
