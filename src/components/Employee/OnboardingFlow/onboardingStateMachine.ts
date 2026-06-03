import { transition, reduce, state } from 'robot3'
import {
  EmployeeListContextual,
  OnboardingExecutionFlowContextual,
  type OnboardingContextInterface,
} from './OnboardingFlowComponents'
import { componentEvents, type EmployeeOnboardingStatus } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.EMPLOYEE_UPDATE]: {
    employeeId: string
    onboardingStatus: (typeof EmployeeOnboardingStatus)[keyof typeof EmployeeOnboardingStatus]
  }
}

const returnToIndex = reduce(
  (ctx: OnboardingContextInterface): OnboardingContextInterface => ({
    ...ctx,
    component: EmployeeListContextual,
    employeeId: undefined,
    onboardingStatus: undefined,
  }),
)

export const employeeOnboardingMachine = {
  index: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_CREATE,
      'executing',
      reduce(
        (ctx: OnboardingContextInterface): OnboardingContextInterface => ({
          ...ctx,
          component: OnboardingExecutionFlowContextual,
          employeeId: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_UPDATE,
      'executing',
      reduce(
        (
          ctx: OnboardingContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_UPDATE>,
        ): OnboardingContextInterface => ({
          ...ctx,
          component: OnboardingExecutionFlowContextual,
          employeeId: ev.payload.employeeId,
          onboardingStatus: ev.payload.onboardingStatus,
        }),
      ),
    ),
    transition(componentEvents.EMPLOYEE_ONBOARDING_DONE, 'final'),
  ),
  executing: state<MachineTransition>(
    transition(componentEvents.EMPLOYEES_LIST, 'index', returnToIndex),
    transition(componentEvents.CANCEL, 'index', returnToIndex),
  ),
  final: state<MachineTransition>(),
}
