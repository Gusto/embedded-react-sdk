import { transition, reduce, state } from 'robot3'
import {
  DashboardFlowContextual,
  OnboardingFlowContextual,
  TerminationFlowContextual,
  type EmployeeListFlowContextInterface,
} from './EmployeeListFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.EMPLOYEE_UPDATE]: { employeeId: string }
  [componentEvents.EMPLOYEE_DISMISS]: { employeeId: string }
}

export const employeeListStateMachine = {
  list: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_UPDATE,
      'dashboard',
      reduce(
        (
          ctx: EmployeeListFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_UPDATE>,
        ): EmployeeListFlowContextInterface => ({
          ...ctx,
          component: DashboardFlowContextual,
          employeeId: ev.payload.employeeId,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_DISMISS,
      'terminate',
      reduce(
        (
          ctx: EmployeeListFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_DISMISS>,
        ): EmployeeListFlowContextInterface => ({
          ...ctx,
          component: TerminationFlowContextual,
          employeeId: ev.payload.employeeId,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_CREATE,
      'onboard',
      reduce(
        (ctx: EmployeeListFlowContextInterface): EmployeeListFlowContextInterface => ({
          ...ctx,
          component: OnboardingFlowContextual,
        }),
      ),
    ),
  ),
  dashboard: state<MachineTransition>(),
  terminate: state<MachineTransition>(),
  onboard: state<MachineTransition>(),
}
