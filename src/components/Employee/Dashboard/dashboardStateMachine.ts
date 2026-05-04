import { transition, reduce, state } from 'robot3'
import {
  DashboardViewContextual,
  HomeAddressContextual,
  WorkAddressContextual,
  FederalTaxesContextual,
  type DashboardContextInterface,
} from './DashboardComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

const returnToIndex = reduce(
  (ctx: DashboardContextInterface): DashboardContextInterface => ({
    ...ctx,
    component: DashboardViewContextual,
    header: null,
  }),
)

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
    transition(
      componentEvents.EMPLOYEE_FEDERAL_TAXES_EDIT,
      'federalTaxes',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          component: FederalTaxesContextual,
          header: { type: 'minimal' },
        }),
      ),
    ),
  ),
  homeAddress: state<MachineTransition>(
    transition(componentEvents.CANCEL, 'index', returnToIndex),
  ),
  workAddress: state<MachineTransition>(
    transition(componentEvents.CANCEL, 'index', returnToIndex),
  ),
  federalTaxes: state<MachineTransition>(
    transition(componentEvents.CANCEL, 'index', returnToIndex),
    transition(componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE, 'index', returnToIndex),
  ),
}
