import { transition, reduce, state } from 'robot3'
import {
  DashboardViewContextual,
  HomeAddressContextual,
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
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_HOME_ADDRESS_UPDATED,
      'index',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          component: DashboardViewContextual,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_HOME_ADDRESS_CREATED,
      'index',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          component: DashboardViewContextual,
        }),
      ),
    ),
  ),
}
