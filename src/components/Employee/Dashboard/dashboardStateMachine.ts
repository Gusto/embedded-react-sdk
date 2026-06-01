import { transition, reduce, state } from 'robot3'
import type { Garnishment } from '@gusto/embedded-api-v-2025-11-15/models/components/garnishment'
import type { Job } from '@gusto/embedded-api-v-2025-11-15/models/components/job'
import type { DashboardTab } from './Dashboard'
import {
  DashboardViewContextual,
  HomeAddressContextual,
  WorkAddressContextual,
  FederalTaxesContextual,
  StateTaxesContextual,
  ProfileContextual,
  PaymentBankFormContextual,
  PaymentSplitViewContextual,
  DocumentManagerContextual,
  DeductionFormContextual,
  AddJobContextual,
  EditCompensationContextual,
  AddAnotherJobContextual,
  type DashboardContextInterface,
} from './DashboardComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN]: { employeeId: string; formId: string }
  [componentEvents.EMPLOYEE_DEDUCTION_EDIT]: Garnishment
  [componentEvents.EMPLOYEE_COMPENSATION_CREATE]: { employeeId: string; job: Job }
  [componentEvents.EMPLOYEE_DASHBOARD_TAB_CHANGE]: { tab: DashboardTab }
}

const returnToIndex = reduce(
  (ctx: DashboardContextInterface): DashboardContextInterface => ({
    ...ctx,
    component: DashboardViewContextual,
    header: null,
    currentJob: null,
    successAlert: null,
  }),
)

const returnToIndexWithAlert = (alert: DashboardContextInterface['successAlert']) =>
  reduce(
    (ctx: DashboardContextInterface): DashboardContextInterface => ({
      ...ctx,
      component: DashboardViewContextual,
      header: null,
      currentJob: null,
      successAlert: alert,
    }),
  )

export const dashboardStateMachine = {
  index: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_PROFILE_MANAGEMENT_EDIT_REQUESTED,
      'profile',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          component: ProfileContextual,
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
          successAlert: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN,
      'documentManager',
      reduce(
        (
          ctx: DashboardContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN>,
        ): DashboardContextInterface => ({
          ...ctx,
          component: DocumentManagerContextual,
          formId: ev.payload.formId,
          successAlert: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_JOB_ADD,
      'addJob',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          component: AddJobContextual,
          currentJob: null,
          successAlert: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_CREATE,
      'editCompensation',
      reduce(
        (
          ctx: DashboardContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_COMPENSATION_CREATE>,
        ): DashboardContextInterface => ({
          ...ctx,
          component: EditCompensationContextual,
          currentJob: ev.payload.job,
          successAlert: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_JOB_ADD_ANOTHER,
      'addAnotherJob',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          component: AddAnotherJobContextual,
          currentJob: null,
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
      componentEvents.EMPLOYEE_DEDUCTION_ADD,
      'deductionForm',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          component: DeductionFormContextual,
          successAlert: null,
          editingDeductionId: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_EDIT,
      'deductionForm',
      reduce(
        (
          ctx: DashboardContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_DEDUCTION_EDIT>,
        ): DashboardContextInterface => ({
          ...ctx,
          component: DeductionFormContextual,
          successAlert: null,
          editingDeductionId: ev.payload.uuid,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_DELETED,
      'index',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          successAlert: 'deductionDeleted',
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
    transition(
      componentEvents.EMPLOYEE_DASHBOARD_TAB_CHANGE,
      'index',
      reduce(
        (
          ctx: DashboardContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_DASHBOARD_TAB_CHANGE>,
        ): DashboardContextInterface => ({
          ...ctx,
          selectedTab: ev.payload.tab,
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
  profile: state<MachineTransition>(
    transition(componentEvents.EMPLOYEE_PROFILE_MANAGEMENT_EDIT_CANCELLED, 'index', returnToIndex),
    transition(
      componentEvents.EMPLOYEE_PROFILE_MANAGEMENT_UPDATED,
      'index',
      returnToIndexWithAlert('profileUpdated'),
    ),
  ),
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
  documentManager: state<MachineTransition>(
    transition(componentEvents.CANCEL, 'index', returnToIndex),
  ),
  deductionForm: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_CREATED,
      'index',
      returnToIndexWithAlert('deductionAdded'),
    ),
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_UPDATED,
      'index',
      returnToIndexWithAlert('deductionUpdated'),
    ),
    transition(componentEvents.EMPLOYEE_DEDUCTION_CANCEL, 'index', returnToIndex),
    transition(componentEvents.CANCEL, 'index', returnToIndex),
  ),
  addJob: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_UPDATED,
      'index',
      returnToIndexWithAlert('jobAdded'),
    ),
    transition(componentEvents.CANCEL, 'index', returnToIndex),
  ),
  editCompensation: state<MachineTransition>(
    transition(componentEvents.EMPLOYEE_COMPENSATION_DONE, 'index', returnToIndex),
    transition(componentEvents.CANCEL, 'index', returnToIndex),
  ),
  addAnotherJob: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_UPDATED,
      'index',
      returnToIndexWithAlert('jobAdded'),
    ),
    transition(componentEvents.CANCEL, 'index', returnToIndex),
  ),
}
