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
    successAlert: null,
  }),
)

const returnToIndexWithAlert = (alert: DashboardContextInterface['successAlert']) =>
  reduce(
    (ctx: DashboardContextInterface): DashboardContextInterface => ({
      ...ctx,
      component: DashboardViewContextual,
      header: null,
      successAlert: alert,
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
          successAlert: null,
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
          successAlert: null,
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
          successAlert: null,
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
          successAlert: null,
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
          successAlert: null,
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
          successAlert: null,
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
          successAlert: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_BANK_ACCOUNT_DELETED,
      'index',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          successAlert: 'bankAccountDeleted',
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_DISMISS,
      'index',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          successAlert: null,
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
    transition(
      componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATED,
      'index',
      returnToIndexWithAlert('bankAccountAdded'),
    ),
    transition(componentEvents.CANCEL, 'index', returnToIndex),
  ),
  paymentSplitView: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED,
      'index',
      returnToIndexWithAlert('splitUpdated'),
    ),
    transition(componentEvents.CANCEL, 'index', returnToIndex),
  ),
}
