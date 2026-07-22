import { transition, reduce, state } from 'robot3'
import {
  DashboardFlowContextual,
  EmployeeListContextual,
  OnboardingExecutionFlowContextual,
  RehireEmployeeContextual,
  TerminationFlowContextual,
  type EmployeeListFlowContextInterface,
} from './EmployeeListFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import type { FlowHeaderConfig } from '@/components/Flow/useFlow'

type EventPayloads = {
  [componentEvents.EMPLOYEE_UPDATE]: { employeeId: string }
  [componentEvents.EMPLOYEE_DISMISS]: { employeeId: string }
  [componentEvents.EMPLOYEE_REHIRE]: { employeeId: string }
}

const backToListHeader: FlowHeaderConfig = {
  type: 'minimal',
  back: {
    labelKey: 'backToListCta',
    namespace: 'Employee.ManagementEmployeeList',
    event: componentEvents.EMPLOYEE_RETURN_TO_LIST,
  },
}

const returnToList = reduce(
  (ctx: EmployeeListFlowContextInterface): EmployeeListFlowContextInterface => ({
    ...ctx,
    component: EmployeeListContextual,
    header: null,
    employeeId: undefined,
  }),
)

/** @internal */
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
          header: backToListHeader,
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
          header: backToListHeader,
          employeeId: ev.payload.employeeId,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_REHIRE,
      'rehire',
      reduce(
        (
          ctx: EmployeeListFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_REHIRE>,
        ): EmployeeListFlowContextInterface => ({
          ...ctx,
          component: RehireEmployeeContextual,
          header: backToListHeader,
          employeeId: ev.payload.employeeId,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_CREATE,
      'onboard',
      reduce((ctx: EmployeeListFlowContextInterface): EmployeeListFlowContextInterface => ({
        ...ctx,
        component: OnboardingExecutionFlowContextual,
        header: backToListHeader,
      })),
    ),
  ),
  dashboard: state<MachineTransition>(
    transition(componentEvents.EMPLOYEE_RETURN_TO_LIST, 'list', returnToList),
  ),
  terminate: state<MachineTransition>(
    transition(componentEvents.EMPLOYEE_RETURN_TO_LIST, 'list', returnToList),
  ),
  rehire: state<MachineTransition>(
    transition(componentEvents.EMPLOYEE_RETURN_TO_LIST, 'list', returnToList),
    transition(componentEvents.EMPLOYEE_REHIRE_SCHEDULED, 'list', returnToList),
    transition(componentEvents.EMPLOYEE_REHIRE_CANCELLED, 'list', returnToList),
  ),
  onboard: state<MachineTransition>(
    transition(componentEvents.EMPLOYEE_RETURN_TO_LIST, 'list', returnToList),
    transition(componentEvents.EMPLOYEES_LIST, 'list', returnToList),
    transition(componentEvents.CANCEL, 'list', returnToList),
  ),
}
