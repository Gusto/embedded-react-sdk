import { transition, reduce, state, guard } from 'robot3'
import {
  PolicyListContextual,
  PolicyTypeSelectorContextual,
  PolicyDetailsFormContextual,
  PolicySettingsContextual,
  AddEmployeesToPolicyContextual,
  ViewPolicyDetailsContextual,
  ViewPolicyEmployeesContextual,
  HolidaySelectionFormContextual,
  AddEmployeesHolidayContextual,
  ViewHolidayEmployeesContextual,
  ViewHolidayScheduleContextual,
  type TimeOffFlowContextInterface,
  type TimeOffFlowAlert,
} from './TimeOffFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

type PolicyTypePayload = { policyType: 'sick' | 'vacation' | 'holiday' }
type PolicyCreatedPayload = { policyId: string }
type ErrorPayload = { alert?: TimeOffFlowAlert }
type ViewPolicyPayload = { policyId: string; policyType: 'sick' | 'vacation' | 'holiday' }

function isSickOrVacation(_ctx: TimeOffFlowContextInterface, ev: { payload: PolicyTypePayload }) {
  return ev.payload.policyType === 'sick' || ev.payload.policyType === 'vacation'
}

function isHoliday(_ctx: TimeOffFlowContextInterface, ev: { payload: PolicyTypePayload }) {
  return ev.payload.policyType === 'holiday'
}

function isSickOrVacationView(
  _ctx: TimeOffFlowContextInterface,
  ev: { payload: ViewPolicyPayload },
) {
  return ev.payload.policyType === 'sick' || ev.payload.policyType === 'vacation'
}

function isHolidayView(_ctx: TimeOffFlowContextInterface, ev: { payload: ViewPolicyPayload }) {
  return ev.payload.policyType === 'holiday'
}

const cancelToPolicyList = transition(
  componentEvents.CANCEL,
  'policyList',
  reduce(
    (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
      ...ctx,
      component: PolicyListContextual,
      alerts: undefined,
    }),
  ),
)

const backToListTransition = transition(
  componentEvents.TIME_OFF_BACK_TO_LIST,
  'policyList',
  reduce(
    (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
      ...ctx,
      component: PolicyListContextual,
      alerts: undefined,
    }),
  ),
)

export const timeOffMachine = {
  policyList: state<MachineTransition>(
    transition(
      componentEvents.TIME_OFF_CREATE_POLICY,
      'policyTypeSelector',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: PolicyTypeSelectorContextual,
          alerts: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.TIME_OFF_VIEW_POLICY,
      'viewPolicyDetails',
      guard(isSickOrVacationView),
      reduce(
        (
          ctx: TimeOffFlowContextInterface,
          ev: { payload: ViewPolicyPayload },
        ): TimeOffFlowContextInterface => ({
          ...ctx,
          component: ViewPolicyDetailsContextual,
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

  policyTypeSelector: state<MachineTransition>(
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

  policyDetailsForm: state<MachineTransition>(
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
          component: PolicyTypeSelectorContextual,
          alerts: ev.payload.alert ? [ev.payload.alert] : undefined,
        }),
      ),
    ),
    cancelToPolicyList,
  ),

  policySettings: state<MachineTransition>(
    transition(
      componentEvents.TIME_OFF_POLICY_SETTINGS_DONE,
      'addEmployeesToPolicy',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: AddEmployeesToPolicyContextual,
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

  addEmployeesToPolicy: state<MachineTransition>(
    transition(
      componentEvents.TIME_OFF_ADD_EMPLOYEES_DONE,
      'viewPolicyDetails',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: ViewPolicyDetailsContextual,
          alerts: undefined,
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

  viewPolicyDetails: state<MachineTransition>(
    transition(
      componentEvents.TIME_OFF_VIEW_POLICY_EMPLOYEES,
      'viewPolicyEmployees',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: ViewPolicyEmployeesContextual,
        }),
      ),
    ),
    backToListTransition,
  ),

  viewPolicyEmployees: state<MachineTransition>(
    transition(
      componentEvents.TIME_OFF_VIEW_POLICY_DETAILS,
      'viewPolicyDetails',
      reduce(
        (ctx: TimeOffFlowContextInterface): TimeOffFlowContextInterface => ({
          ...ctx,
          component: ViewPolicyDetailsContextual,
        }),
      ),
    ),
    backToListTransition,
  ),

  holidaySelectionForm: state<MachineTransition>(
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
          component: PolicyTypeSelectorContextual,
          alerts: ev.payload.alert ? [ev.payload.alert] : undefined,
        }),
      ),
    ),
    cancelToPolicyList,
  ),

  addEmployeesHoliday: state<MachineTransition>(
    transition(
      componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE,
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
        }),
      ),
    ),
    cancelToPolicyList,
  ),

  viewHolidayEmployees: state<MachineTransition>(
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
    backToListTransition,
  ),

  viewHolidaySchedule: state<MachineTransition>(
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
    backToListTransition,
  ),

  final: state<MachineTransition>(),
}
