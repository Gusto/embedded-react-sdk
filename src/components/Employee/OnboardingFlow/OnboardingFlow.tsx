import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { EmployeeListContextual } from '../EmployeeList/EmployeeList'
import { employeeOnboardingMachine } from './onboardingStateMachine'
import type {
  OnboardingDefaultValues,
  OnboardingContextInterface,
} from './OnboardingFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import type { RequireAtLeastOne } from '@/types/Helpers'

export interface OnboardingFlowProps extends BaseComponentInterface {
  companyId: string
  defaultValues?: RequireAtLeastOne<OnboardingDefaultValues>
  isSelfOnboardingEnabled?: boolean
  withEmployeeI9?: boolean
}

export const OnboardingFlow = ({
  companyId,
  onEvent,
  defaultValues,
  isSelfOnboardingEnabled = true,
  withEmployeeI9 = false,
}: OnboardingFlowProps) => {
  const manageEmployees = useMemo(
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
          withEmployeeI9,
        }),
      ),
    [companyId, defaultValues, isSelfOnboardingEnabled, withEmployeeI9],
  )
  return <Flow machine={manageEmployees} onEvent={onEvent} />
}
