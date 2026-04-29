import { transition, reduce, state } from 'robot3'
import {
  DashboardViewContextual,
  HomeAddressContextual,
  WorkAddressContextual,
  type DashboardContextInterface,
} from './DashboardComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

export const dashboardStateMachine = {
  index: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_HOME_ADDRESS,
      'homeAddress',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          component: HomeAddressContextual,
          header: { type: 'minimal' },
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_WORK_ADDRESS,
      'workAddress',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          component: WorkAddressContextual,
          header: { type: 'minimal' },
        }),
      ),
    ),
  ),
  homeAddress: state<MachineTransition>(
    transition(
      componentEvents.CANCEL,
      'index',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          component: DashboardViewContextual,
          header: null,
        }),
      ),
    ),
  ),
  workAddress: state<MachineTransition>(
    transition(
      componentEvents.CANCEL,
      'index',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          component: DashboardViewContextual,
          header: null,
        }),
      ),
    ),
  ),
}
