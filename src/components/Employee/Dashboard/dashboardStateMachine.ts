import { transition, reduce, state } from 'robot3'
import type { Garnishment } from '@gusto/embedded-api-v-2025-11-15/models/components/garnishment'
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
  DeductionsEditFormContextual,
  AddJobContextual,
  EditCompensationContextual,
  AddAnotherJobContextual,
  type DashboardContextInterface,
} from './DashboardComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.EMPLOYEE_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED]: {
    employeeId: string
    formId: string
  }
  [componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED]: Garnishment
  [componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_EDIT_REQUESTED]: {
    employeeId: string
    jobId: string
  }
  [componentEvents.EMPLOYEE_DASHBOARD_TAB_CHANGE]: { tab: DashboardTab }
}

const returnToIndex = reduce(
  (ctx: DashboardContextInterface): DashboardContextInterface => ({
    ...ctx,
    component: DashboardViewContextual,
    header: null,
    currentJobId: null,
    successAlert: null,
  }),
)

const returnToIndexWithAlert = (alert: DashboardContextInterface['successAlert']) =>
  reduce(
    (ctx: DashboardContextInterface): DashboardContextInterface => ({
      ...ctx,
      component: DashboardViewContextual,
      header: null,
      currentJobId: null,
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
      componentEvents.EMPLOYEE_HOME_ADDRESS_MANAGEMENT_EDIT_REQUESTED,
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
      componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_REQUESTED,
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
      componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_CARD_EDIT_REQUESTED,
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
      componentEvents.EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_REQUESTED,
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
      componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED,
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
      componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_SPLIT_REQUESTED,
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
      componentEvents.EMPLOYEE_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED,
      'documentManager',
      reduce(
        (
          ctx: DashboardContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.EMPLOYEE_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED
          >,
        ): DashboardContextInterface => ({
          ...ctx,
          component: DocumentManagerContextual,
          formId: ev.payload.formId,
          successAlert: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_ADD_REQUESTED,
      'addJob',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          component: AddJobContextual,
          currentJobId: null,
          successAlert: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_EDIT_REQUESTED,
      'editCompensation',
      reduce(
        (
          ctx: DashboardContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_EDIT_REQUESTED
          >,
        ): DashboardContextInterface => ({
          ...ctx,
          component: EditCompensationContextual,
          currentJobId: ev.payload.jobId,
          successAlert: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_ADD_ANOTHER_REQUESTED,
      'addAnotherJob',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          component: AddAnotherJobContextual,
          currentJobId: null,
          successAlert: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_BANK_ACCOUNT_DELETED,
      'index',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          successAlert: 'bankAccountDeleted',
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_ADD_REQUESTED,
      'editDeduction',
      reduce(
        (ctx: DashboardContextInterface): DashboardContextInterface => ({
          ...ctx,
          component: DeductionsEditFormContextual,
          successAlert: null,
          editingDeductionId: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED,
      'editDeduction',
      reduce(
        (
          ctx: DashboardContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED
          >,
        ): DashboardContextInterface => ({
          ...ctx,
          component: DeductionsEditFormContextual,
          successAlert: null,
          editingDeductionId: ev.payload.uuid,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_DELETED,
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
  homeAddress: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_HOME_ADDRESS_MANAGEMENT_EDIT_CANCELLED,
      'index',
      returnToIndex,
    ),
  ),
  workAddress: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_CANCELLED,
      'index',
      returnToIndex,
    ),
  ),
  federalTaxes: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_EDIT_FORM_CANCELLED,
      'index',
      returnToIndex,
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_EDIT_FORM_SUBMITTED,
      'index',
      returnToIndexWithAlert('federalTaxesUpdated'),
    ),
  ),
  stateTaxes: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_STATE_TAXES_UPDATED,
      'index',
      returnToIndexWithAlert('stateTaxesUpdated'),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_CANCELLED,
      'index',
      returnToIndex,
    ),
  ),
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
      componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED,
      'index',
      returnToIndexWithAlert('bankAccountAdded'),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_CANCELLED,
      'index',
      returnToIndex,
    ),
  ),
  paymentSplitView: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_SUBMITTED,
      'index',
      returnToIndexWithAlert('splitUpdated'),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_CANCELLED,
      'index',
      returnToIndex,
    ),
  ),
  documentManager: state<MachineTransition>(
    // Admin-facing dashboard: documents are read-only here, so the viewer only
    // returns to the dashboard on Back. Signing happens in the employee
    // onboarding DocumentSigner flow, not from this surface.
    transition(componentEvents.CANCEL, 'index', returnToIndex),
  ),
  editDeduction: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_CREATED,
      'index',
      returnToIndexWithAlert('deductionAdded'),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_UPDATED,
      'index',
      returnToIndexWithAlert('deductionUpdated'),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_CANCELLED,
      'index',
      returnToIndex,
    ),
  ),
  addJob: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_JOB_FORM_SUBMITTED,
      'index',
      returnToIndexWithAlert('jobAdded'),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_JOB_FORM_CANCELLED,
      'index',
      returnToIndex,
    ),
  ),
  editCompensation: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_SUBMITTED,
      'index',
      returnToIndex,
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_CANCELLED,
      'index',
      returnToIndex,
    ),
  ),
  addAnotherJob: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_ANOTHER_JOB_FORM_SUBMITTED,
      'index',
      returnToIndexWithAlert('jobAdded'),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_ANOTHER_JOB_FORM_CANCELLED,
      'index',
      returnToIndex,
    ),
  ),
}
