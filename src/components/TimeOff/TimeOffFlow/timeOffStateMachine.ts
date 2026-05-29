import { transition, reduce, state, guard } from 'robot3'
import {
  PolicyListContextual,
  SelectPolicyTypeContextual,
  PolicyDetailsFormContextual,
  PolicySettingsContextual,
  EditPolicySettingsContextual,
  AddEmployeesToPolicyContextual,
  TimeOffPolicyDetailContextual,
  HolidaySelectionFormContextual,
  EditHolidaySelectionFormContextual,
  AddEmployeesHolidayContextual,
  ViewHolidayEmployeesContextual,
  ViewHolidayScheduleContextual,
  type TimeOffFlowContextInterface,
  type TimeOffFlowAlert,
  type AddEmployeesSource,
} from './TimeOffFlowComponents'
import type { TimeOffPolicyType } from './timeOffPolicyTypes'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

type PolicyTypePayload = { policyType: 'sick' | 'vacation' | 'holiday' }
type PolicyCreatedPayload = { policyId: string; accrualMethod?: string }
type ErrorPayload = { alert?: TimeOffFlowAlert }
type ViewPolicyPayload = { policyId: string; policyType: TimeOffPolicyType }
type PolicyIdPayload = { policyId: string }

function isSickOrVacation(_ctx: TimeOffFlowContextInterface, ev: { payload: PolicyTypePayload }) {
  return ev.payload.policyType === 'sick' || ev.payload.policyType === 'vacation'
}

function isHoliday(_ctx: TimeOffFlowContextInterface, ev: { payload: PolicyTypePayload }) {
  return ev.payload.policyType === 'holiday'
}

function isNonHolidayView(_ctx: TimeOffFlowContextInterface, ev: { payload: ViewPolicyPayload }) {
  return ev.payload.policyType !== 'holiday'
}

function isHolidayView(_ctx: TimeOffFlowContextInterface, ev: { payload: ViewPolicyPayload }) {
  return ev.payload.policyType === 'holiday'
}

function isUnlimitedPolicy(
  _ctx: TimeOffFlowContextInterface,
  ev: { payload: PolicyCreatedPayload },
) {
  return ev.payload.accrualMethod === 'unlimited'
}

function addEmployeesSourceIs(source: AddEmployeesSource) {
  return (ctx: TimeOffFlowContextInterface) => ctx.addEmployeesSource === source
}

const cancelToPolicyList = transition(
  componentEvents.CANCEL,
  'policyList',
  reduce(
    (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
      ...ctx,
      component: PolicyListContextual,
      policyId: undefined,
      policyType: undefined,
      alerts: undefined,
    }),
  ),
)

// Browser back/forward integration: each state below appends a set of
// `GOTO_STEP` transitions so that popstate-driven navigation can jump the
// machine to any synced step. The hash format is `#step=<stateName>`, mirroring
// these keys exactly. Edit-mode states are intentionally not synced because
// entering them requires a `policyId` the URL does not carry.
const SYNCED_STEPS = {
  policyList: PolicyListContextual,
  policyTypeSelector: SelectPolicyTypeContextual,
  policyDetailsForm: PolicyDetailsFormContextual,
  policySettings: PolicySettingsContextual,
  addEmployeesToPolicy: AddEmployeesToPolicyContextual,
  holidaySelectionForm: HolidaySelectionFormContextual,
  addEmployeesHoliday: AddEmployeesHolidayContextual,
  viewTimeOffPolicyDetail: TimeOffPolicyDetailContextual,
  viewHolidayEmployees: ViewHolidayEmployeesContextual,
  viewHolidaySchedule: ViewHolidayScheduleContextual,
} as const

type SyncedStepName = keyof typeof SYNCED_STEPS

export const TIME_OFF_SYNCED_STEP_NAMES: readonly SyncedStepName[] = Object.keys(
  SYNCED_STEPS,
) as SyncedStepName[]

type GotoPayload = { target: SyncedStepName }

function isGotoTarget(name: SyncedStepName) {
  return (_ctx: TimeOffFlowContextInterface, ev: { payload: GotoPayload }) =>
    ev.payload.target === name
}

const gotoStepTransitions: MachineTransition[] = TIME_OFF_SYNCED_STEP_NAMES.map(name => {
  const Component = SYNCED_STEPS[name]
  // Returning to the list clears policy context so the list view never inherits
  // a stale selection from the user's deeper navigation.
  if (name === 'policyList') {
    return transition(
      componentEvents.GOTO_STEP,
      name,
      guard(isGotoTarget(name)),
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: Component,
          policyId: undefined,
          policyType: undefined,
          alerts: undefined,
        }),
      ),
    )
  }
  return transition(
    componentEvents.GOTO_STEP,
    name,
    guard(isGotoTarget(name)),
    reduce(
      (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
        ...ctx,
        component: Component,
        alerts: undefined,
      }),
    ),
  )
})

function stepState(...transitions: MachineTransition[]) {
  const s = state
  return s<MachineTransition>(...transitions, ...gotoStepTransitions)
}

const backToListTransition = transition(
  componentEvents.TIME_OFF_BACK_TO_LIST,
  'policyList',
  reduce(
    (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
      ...ctx,
      component: PolicyListContextual,
      policyId: undefined,
      policyType: undefined,
      alerts: undefined,
    }),
  ),
)

export const timeOffMachine = {
  policyList: stepState(
    transition(
      componentEvents.TIME_OFF_CREATE_POLICY,
      'policyTypeSelector',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: SelectPolicyTypeContextual,
          policyId: undefined,
          policyType: undefined,
          alerts: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_VIEW_POLICY,
      'viewTimeOffPolicyDetail',
      guard(isNonHolidayView),
      reduce(
        (
          ctx: TimeOffFlowContextInterface,
          ev: { payload: ViewPolicyPayload },
        ): TimeOffFlowContextInterface => ({
          ...ctx,
          component: TimeOffPolicyDetailContextual,
          policyId: ev.payload.policyId,
          policyType: ev.payload.policyType,
          alerts: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_VIEW_POLICY,
      'viewHolidayEmployees',
      guard(isHolidayView),
      reduce(
        (
          ctx: TimeOffFlowContextInterface,
          ev: { payload: ViewPolicyPayload },
        ): TimeOffFlowContextInterface => ({
          ...ctx,
          component: ViewHolidayEmployeesContextual,
          policyId: ev.payload.policyId,
          policyType: ev.payload.policyType,
          alerts: undefined,
        }),
      ),
    ),
  ),

  policyTypeSelector: stepState(
    transition(
      componentEvents.TIME_OFF_POLICY_TYPE_SELECTED,
      'policyDetailsForm',
      guard(isSickOrVacation),
      reduce(
        (
          ctx: TimeOffFlowContextInterface,
          ev: { payload: PolicyTypePayload },
        ): TimeOffFlowContextInterface => ({
          ...ctx,
          component: PolicyDetailsFormContextual,
          policyType: ev.payload.policyType,
          alerts: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_POLICY_TYPE_SELECTED,
      'holidaySelectionForm',
      guard(isHoliday),
      reduce(
        (
          ctx: TimeOffFlowContextInterface,
          ev: { payload: PolicyTypePayload },
        ): TimeOffFlowContextInterface => ({
          ...ctx,
          component: HolidaySelectionFormContextual,
          policyType: ev.payload.policyType,
          alerts: undefined,
        }),
      ),
    ),
    cancelToPolicyList,
  ),

  policyDetailsForm: stepState(
    transition(
      componentEvents.TIME_OFF_POLICY_DETAILS_DONE,
      'addEmployeesToPolicy',
      guard(isUnlimitedPolicy),
      reduce(
        (
          ctx: TimeOffFlowContextInterface,
          ev: { payload: PolicyCreatedPayload },
        ): TimeOffFlowContextInterface => ({
          ...ctx,
          component: AddEmployeesToPolicyContextual,
          policyId: ev.payload.policyId,
          alerts: undefined,
          addEmployeesSource: 'policyDetailsForm',
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_POLICY_DETAILS_DONE,
      'policySettings',
      reduce(
        (
          ctx: TimeOffFlowContextInterface,
          ev: { payload: PolicyCreatedPayload },
        ): TimeOffFlowContextInterface => ({
          ...ctx,
          component: PolicySettingsContextual,
          policyId: ev.payload.policyId,
          alerts: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_POLICY_CREATE_ERROR,
      'policyTypeSelector',
      reduce(
        (
          ctx: TimeOffFlowContextInterface,
          ev: { payload: ErrorPayload },
        ): TimeOffFlowContextInterface => ({
          ...ctx,
          component: SelectPolicyTypeContextual,
          alerts: ev.payload.alert ? [ev.payload.alert] : undefined,
        }),
      ),
    ),
    cancelToPolicyList,
  ),

  policySettings: stepState(
    transition(
      componentEvents.TIME_OFF_POLICY_SETTINGS_DONE,
      'addEmployeesToPolicy',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: AddEmployeesToPolicyContextual,
          alerts: undefined,
          addEmployeesSource: 'policySettings',
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_POLICY_SETTINGS_BACK,
      'policyDetailsForm',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: PolicyDetailsFormContextual,
          alerts: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_POLICY_SETTINGS_ERROR,
      'policyDetailsForm',
      reduce(
        (
          ctx: TimeOffFlowContextInterface,
          ev: { payload: ErrorPayload },
        ): TimeOffFlowContextInterface => ({
          ...ctx,
          component: PolicyDetailsFormContextual,
          alerts: ev.payload.alert ? [ev.payload.alert] : undefined,
        }),
      ),
    ),
    cancelToPolicyList,
  ),

  addEmployeesToPolicy: stepState(
    transition(
      componentEvents.TIME_OFF_ADD_EMPLOYEES_DONE,
      'viewTimeOffPolicyDetail',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: TimeOffPolicyDetailContextual,
          alerts: undefined,
          addEmployeesSource: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_ADD_EMPLOYEES_BACK,
      'viewTimeOffPolicyDetail',
      guard(addEmployeesSourceIs('viewTimeOffPolicyDetail')),
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: TimeOffPolicyDetailContextual,
          alerts: undefined,
          addEmployeesSource: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_ADD_EMPLOYEES_BACK,
      'policyDetailsForm',
      guard(addEmployeesSourceIs('policyDetailsForm')),
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: PolicyDetailsFormContextual,
          alerts: undefined,
          addEmployeesSource: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_ADD_EMPLOYEES_BACK,
      'policySettings',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: PolicySettingsContextual,
          alerts: undefined,
          addEmployeesSource: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_ADD_EMPLOYEES_ERROR,
      'policyDetailsForm',
      guard(addEmployeesSourceIs('policyDetailsForm')),
      reduce(
        (
          ctx: TimeOffFlowContextInterface,
          ev: { payload: ErrorPayload },
        ): TimeOffFlowContextInterface => ({
          ...ctx,
          component: PolicyDetailsFormContextual,
          alerts: ev.payload.alert ? [ev.payload.alert] : undefined,
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_ADD_EMPLOYEES_ERROR,
      'policySettings',
      reduce(
        (
          ctx: TimeOffFlowContextInterface,
          ev: { payload: ErrorPayload },
        ): TimeOffFlowContextInterface => ({
          ...ctx,
          component: PolicySettingsContextual,
          alerts: ev.payload.alert ? [ev.payload.alert] : undefined,
        }),
      ),
    ),
    cancelToPolicyList,
  ),

  viewTimeOffPolicyDetail: stepState(
    transition(
      componentEvents.TIME_OFF_ADD_EMPLOYEES_TO_POLICY,
      'addEmployeesToPolicy',
      reduce(
        (
          ctx: TimeOffFlowContextInterface,
          ev: { payload: PolicyIdPayload },
        ): TimeOffFlowContextInterface => ({
          ...ctx,
          component: AddEmployeesToPolicyContextual,
          policyId: ev.payload.policyId,
          alerts: undefined,
          addEmployeesSource: 'viewTimeOffPolicyDetail',
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_EDIT_POLICY,
      'editPolicyDetailsForm',
      reduce(
        (
          ctx: TimeOffFlowContextInterface,
          ev: { payload: PolicyIdPayload },
        ): TimeOffFlowContextInterface => ({
          ...ctx,
          component: PolicyDetailsFormContextual,
          policyId: ev.payload.policyId,
          alerts: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_CHANGE_SETTINGS,
      'editPolicySettings',
      reduce(
        (
          ctx: TimeOffFlowContextInterface,
          ev: { payload: PolicyIdPayload },
        ): TimeOffFlowContextInterface => ({
          ...ctx,
          component: EditPolicySettingsContextual,
          policyId: ev.payload.policyId,
          alerts: undefined,
        }),
      ),
    ),
    backToListTransition,
  ),

  // Distinct from `policyDetailsForm` (the create-flow step) so that DONE
  // returns to the policy detail view rather than continuing into the
  // create flow's settings step.
  editPolicyDetailsForm: stepState(
    transition(
      componentEvents.TIME_OFF_POLICY_DETAILS_DONE,
      'viewTimeOffPolicyDetail',
      reduce(
        (
          ctx: TimeOffFlowContextInterface,
          ev: { payload: PolicyCreatedPayload },
        ): TimeOffFlowContextInterface => ({
          ...ctx,
          component: TimeOffPolicyDetailContextual,
          policyId: ev.payload.policyId,
          alerts: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.CANCEL,
      'viewTimeOffPolicyDetail',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: TimeOffPolicyDetailContextual,
          alerts: undefined,
        }),
      ),
    ),
  ),

  // Distinct from `policySettings` (the create-flow step) so that DONE/BACK
  // return to the policy detail view instead of routing into the create
  // flow's add-employees / details-form steps.
  editPolicySettings: stepState(
    transition(
      componentEvents.TIME_OFF_POLICY_SETTINGS_DONE,
      'viewTimeOffPolicyDetail',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: TimeOffPolicyDetailContextual,
          alerts: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_POLICY_SETTINGS_BACK,
      'viewTimeOffPolicyDetail',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: TimeOffPolicyDetailContextual,
          alerts: undefined,
        }),
      ),
    ),
    cancelToPolicyList,
  ),

  holidaySelectionForm: stepState(
    transition(
      componentEvents.TIME_OFF_HOLIDAY_SELECTION_DONE,
      'addEmployeesHoliday',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: AddEmployeesHolidayContextual,
          alerts: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_HOLIDAY_CREATE_ERROR,
      'policyTypeSelector',
      reduce(
        (
          ctx: TimeOffFlowContextInterface,
          ev: { payload: ErrorPayload },
        ): TimeOffFlowContextInterface => ({
          ...ctx,
          component: SelectPolicyTypeContextual,
          alerts: ev.payload.alert ? [ev.payload.alert] : undefined,
        }),
      ),
    ),
    cancelToPolicyList,
  ),

  addEmployeesHoliday: stepState(
    transition(
      componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE,
      'viewHolidayEmployees',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: ViewHolidayEmployeesContextual,
          alerts: undefined,
          addEmployeesSource: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES_ERROR,
      'holidaySelectionForm',
      reduce(
        (
          ctx: TimeOffFlowContextInterface,
          ev: { payload: ErrorPayload },
        ): TimeOffFlowContextInterface => ({
          ...ctx,
          component: HolidaySelectionFormContextual,
          alerts: ev.payload.alert ? [ev.payload.alert] : undefined,
          addEmployeesSource: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.CANCEL,
      'viewHolidayEmployees',
      guard(addEmployeesSourceIs('viewHolidayEmployees')),
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: ViewHolidayEmployeesContextual,
          alerts: undefined,
          addEmployeesSource: undefined,
        }),
      ),
    ),
    cancelToPolicyList,
  ),

  viewHolidayEmployees: stepState(
    transition(
      componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES,
      'addEmployeesHoliday',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: AddEmployeesHolidayContextual,
          alerts: undefined,
          addEmployeesSource: 'viewHolidayEmployees',
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_VIEW_HOLIDAY_SCHEDULE,
      'viewHolidaySchedule',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: ViewHolidayScheduleContextual,
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_EDIT_HOLIDAY_POLICY,
      'editHolidaySelectionForm',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: EditHolidaySelectionFormContextual,
          alerts: undefined,
        }),
      ),
    ),
    backToListTransition,
  ),

  viewHolidaySchedule: stepState(
    transition(
      componentEvents.TIME_OFF_VIEW_HOLIDAY_EMPLOYEES,
      'viewHolidayEmployees',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: ViewHolidayEmployeesContextual,
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES,
      'addEmployeesHoliday',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: AddEmployeesHolidayContextual,
          alerts: undefined,
          addEmployeesSource: 'viewHolidayEmployees',
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_EDIT_HOLIDAY_POLICY,
      'editHolidaySelectionForm',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: EditHolidaySelectionFormContextual,
          alerts: undefined,
        }),
      ),
    ),
    backToListTransition,
  ),

  // Distinct from `holidaySelectionForm` (the create-flow step) so that
  // DONE returns to the holiday detail view instead of routing into
  // `addEmployeesHoliday`.
  editHolidaySelectionForm: stepState(
    transition(
      componentEvents.TIME_OFF_HOLIDAY_SELECTION_EDIT_DONE,
      'viewHolidayEmployees',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: ViewHolidayEmployeesContextual,
          alerts: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_HOLIDAY_CREATE_ERROR,
      'viewHolidayEmployees',
      reduce(
        (
          ctx: TimeOffFlowContextInterface,
          ev: { payload: ErrorPayload },
        ): TimeOffFlowContextInterface => ({
          ...ctx,
          component: ViewHolidayEmployeesContextual,
          alerts: ev.payload.alert ? [ev.payload.alert] : undefined,
        }),
      ),
    ),
    transition(
      componentEvents.CANCEL,
      'viewHolidayEmployees',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: ViewHolidayEmployeesContextual,
          alerts: undefined,
        }),
      ),
    ),
  ),

  final: state<MachineTransition>(),
}
