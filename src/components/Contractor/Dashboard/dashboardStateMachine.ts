import type { DashboardTab } from './Dashboard'
import {
  DashboardViewContextual,
  ProfileContextual,
  AddressContextual,
  PaymentMethodEditFormContextual,
  CompensationEditFormContextual,
  type DashboardContextInterface,
} from './DashboardComponents'
import { transition, reduce, state } from '@/lib/state-machine'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.CONTRACTOR_DASHBOARD_TAB_CHANGE]: { tab: DashboardTab }
}

const returnToIndex = reduce((ctx: DashboardContextInterface): DashboardContextInterface => ({
  ...ctx,
  component: DashboardViewContextual,
  successAlert: null,
}))

const returnToIndexWithAlert = (alert: DashboardContextInterface['successAlert']) =>
  reduce((ctx: DashboardContextInterface): DashboardContextInterface => ({
    ...ctx,
    component: DashboardViewContextual,
    successAlert: alert,
  }))

/** @internal */
export const dashboardStateMachine = {
  index: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_PROFILE_EDIT_REQUESTED,
      'profile',
      reduce((ctx: DashboardContextInterface): DashboardContextInterface => ({
        ...ctx,
        component: ProfileContextual,
        successAlert: null,
      })),
    ),
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_EDIT_REQUESTED,
      'address',
      reduce((ctx: DashboardContextInterface): DashboardContextInterface => ({
        ...ctx,
        component: AddressContextual,
        successAlert: null,
      })),
    ),
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED,
      'paymentMethodEdit',
      reduce((ctx: DashboardContextInterface): DashboardContextInterface => ({
        ...ctx,
        component: PaymentMethodEditFormContextual,
        successAlert: null,
      })),
    ),
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_CARD_EDIT_REQUESTED,
      'paymentMethodEdit',
      reduce((ctx: DashboardContextInterface): DashboardContextInterface => ({
        ...ctx,
        component: PaymentMethodEditFormContextual,
        successAlert: null,
      })),
    ),
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_CARD_REMOVED,
      'index',
      reduce((ctx: DashboardContextInterface): DashboardContextInterface => ({
        ...ctx,
        successAlert: 'bankAccountRemoved',
      })),
    ),
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_EDIT_REQUESTED,
      'compensationEdit',
      reduce((ctx: DashboardContextInterface): DashboardContextInterface => ({
        ...ctx,
        component: CompensationEditFormContextual,
        successAlert: null,
      })),
    ),
    transition(
      componentEvents.CONTRACTOR_DASHBOARD_ALERT_DISMISSED,
      'index',
      reduce((ctx: DashboardContextInterface): DashboardContextInterface => ({
        ...ctx,
        successAlert: null,
      })),
    ),
    transition(
      componentEvents.CONTRACTOR_DASHBOARD_TAB_CHANGE,
      'index',
      reduce(
        (
          ctx: DashboardContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.CONTRACTOR_DASHBOARD_TAB_CHANGE
          >,
        ): DashboardContextInterface => ({
          ...ctx,
          selectedTab: ev.payload.tab,
        }),
      ),
    ),
  ),
  profile: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_PROFILE_EDIT_CANCELLED,
      'index',
      returnToIndex,
    ),
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_PROFILE_UPDATED,
      'index',
      returnToIndexWithAlert('profileUpdated'),
    ),
  ),
  address: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_EDIT_CANCELLED,
      'index',
      returnToIndex,
    ),
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_UPDATED,
      'index',
      returnToIndexWithAlert('addressUpdated'),
    ),
  ),
  paymentMethodEdit: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED,
      'index',
      returnToIndexWithAlert('bankAccountAdded'),
    ),
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_CANCELLED,
      'index',
      returnToIndex,
    ),
  ),
  compensationEdit: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_UPDATED,
      'index',
      returnToIndexWithAlert('compensationUpdated'),
    ),
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_EDIT_CANCELLED,
      'index',
      returnToIndex,
    ),
  ),
}
