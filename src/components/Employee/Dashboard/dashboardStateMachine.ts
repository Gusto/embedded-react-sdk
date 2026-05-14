import { transition, reduce, state } from 'robot3'
import {
  DashboardViewContextual,
  HomeAddressContextual,
  WorkAddressContextual,
  FederalTaxesContextual,
  StateTaxesContextual,
  ProfileContextual,
  PaymentBankFormContextual,
  PaymentSplitViewContextual,
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
      componentEvents.EMPLOYEE_UPDATE,
      'profile',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          component: ProfileContextual,
          header: { type: 'minimal' },
        }),
      ),
    ),
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
    transition(
      componentEvents.EMPLOYEE_STATE_TAXES_EDIT,
      'stateTaxes',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          component: StateTaxesContextual,
          header: { type: 'minimal' },
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATE,
      'paymentBankForm',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          component: PaymentBankFormContextual,
          header: { type: 'minimal' },
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_SPLIT_PAYCHECK,
      'paymentSplitView',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          component: PaymentSplitViewContextual,
          header: { type: 'minimal' },
        }),
      ),
    ),
  ),
  homeAddress: state<MachineTransition>(transition(componentEvents.CANCEL, 'index', returnToIndex)),
  workAddress: state<MachineTransition>(transition(componentEvents.CANCEL, 'index', returnToIndex)),
  federalTaxes: state<MachineTransition>(
    transition(componentEvents.CANCEL, 'index', returnToIndex),
    transition(componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE, 'index', returnToIndex),
  ),
  stateTaxes: state<MachineTransition>(transition(componentEvents.CANCEL, 'index', returnToIndex)),
  profile: state<MachineTransition>(transition(componentEvents.CANCEL, 'index', returnToIndex)),
  paymentBankForm: state<MachineTransition>(
    transition(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATED, 'index', returnToIndex),
    transition(componentEvents.CANCEL, 'index', returnToIndex),
  ),
  paymentSplitView: state<MachineTransition>(
    transition(componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED, 'index', returnToIndex),
    transition(componentEvents.CANCEL, 'index', returnToIndex),
  ),
}
