import { transition, reduce, state } from 'robot3'
import type { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import type { AssignmentData } from '../ManagePayScheduleAssignment/ManagePayScheduleAssignment'
import type { ManagePayScheduleFlowContextInterface } from './ManagePayScheduleFlowComponents'
import {
  ManagePayScheduleLandingContextual,
  ManagePayScheduleTypeSelectionContextual,
  ManagePayScheduleAssignmentContextual,
  ManagePayScheduleReviewContextual,
  ManagePayScheduleCreateEditContextual,
} from './ManagePayScheduleFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type PayScheduleType =
  (typeof PayScheduleAssignmentBodyType)[keyof typeof PayScheduleAssignmentBodyType]

type EventPayloads = {
  [componentEvents.MANAGE_PAY_SCHEDULE_MANAGE]: {
    currentType: PayScheduleType | null
  }
  [componentEvents.MANAGE_PAY_SCHEDULE_TYPE_SELECTED]: {
    type: PayScheduleType
  }
  [componentEvents.MANAGE_PAY_SCHEDULE_ASSIGNMENT_CONTINUE]: AssignmentData
  [componentEvents.MANAGE_PAY_SCHEDULE_CREATE_NEW]: {
    returnContext?: string
  }
  [componentEvents.MANAGE_PAY_SCHEDULE_SCHEDULE_CREATED]: undefined
  [componentEvents.MANAGE_PAY_SCHEDULE_CONFIRMED]: AssignmentData
  [componentEvents.MANAGE_PAY_SCHEDULE_EDIT]: {
    payScheduleUuid: string
  }
  [componentEvents.MANAGE_PAY_SCHEDULE_CANCEL]: undefined
  [componentEvents.MANAGE_PAY_SCHEDULE_BACK]: undefined
  [componentEvents.PAY_SCHEDULE_CREATED]: undefined
  [componentEvents.PAY_SCHEDULE_UPDATED]: undefined
  [componentEvents.PAY_SCHEDULE_DONE]: undefined
}

const createReducer = (props: Partial<ManagePayScheduleFlowContextInterface>) => {
  return (ctx: ManagePayScheduleFlowContextInterface): ManagePayScheduleFlowContextInterface => ({
    ...ctx,
    ...props,
  })
}

const exitFlowTransition = transition(
  componentEvents.MANAGE_PAY_SCHEDULE_EXIT_FLOW,
  'landing',
  reduce(
    createReducer({
      component: ManagePayScheduleLandingContextual,
      successAlert: undefined,
      selectedType: undefined,
      assignmentData: undefined,
      editPayScheduleUuid: undefined,
      returnContext: undefined,
    }),
  ),
)

export const payScheduleMachine = {
  landing: state<MachineTransition>(
    transition(
      componentEvents.MANAGE_PAY_SCHEDULE_MANAGE,
      'typeSelection',
      reduce(
        (
          ctx: ManagePayScheduleFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.MANAGE_PAY_SCHEDULE_MANAGE>,
        ): ManagePayScheduleFlowContextInterface => {
          return {
            ...ctx,
            component: ManagePayScheduleTypeSelectionContextual,
            selectedType: ev.payload.currentType ?? undefined,
          }
        },
      ),
    ),
    transition(
      componentEvents.MANAGE_PAY_SCHEDULE_EDIT,
      'editSchedule',
      reduce(
        (
          ctx: ManagePayScheduleFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.MANAGE_PAY_SCHEDULE_EDIT>,
        ): ManagePayScheduleFlowContextInterface => {
          return {
            ...ctx,
            component: ManagePayScheduleCreateEditContextual,
            editPayScheduleUuid: ev.payload.payScheduleUuid,
          }
        },
      ),
    ),
  ),

  typeSelection: state<MachineTransition>(
    transition(
      componentEvents.MANAGE_PAY_SCHEDULE_TYPE_SELECTED,
      'assignment',
      reduce(
        (
          ctx: ManagePayScheduleFlowContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.MANAGE_PAY_SCHEDULE_TYPE_SELECTED
          >,
        ): ManagePayScheduleFlowContextInterface => {
          return {
            ...ctx,
            component: ManagePayScheduleAssignmentContextual,
            selectedType: ev.payload.type,
          }
        },
      ),
    ),
    transition(
      componentEvents.MANAGE_PAY_SCHEDULE_CANCEL,
      'landing',
      reduce(
        createReducer({
          component: ManagePayScheduleLandingContextual,
          selectedType: undefined,
        }),
      ),
    ),
    exitFlowTransition,
  ),

  assignment: state<MachineTransition>(
    transition(
      componentEvents.MANAGE_PAY_SCHEDULE_ASSIGNMENT_CONTINUE,
      'review',
      reduce(
        (
          ctx: ManagePayScheduleFlowContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.MANAGE_PAY_SCHEDULE_ASSIGNMENT_CONTINUE
          >,
        ): ManagePayScheduleFlowContextInterface => {
          return {
            ...ctx,
            component: ManagePayScheduleReviewContextual,
            assignmentData: ev.payload,
          }
        },
      ),
    ),
    transition(
      componentEvents.MANAGE_PAY_SCHEDULE_CREATE_NEW,
      'createSchedule',
      reduce(
        (
          ctx: ManagePayScheduleFlowContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.MANAGE_PAY_SCHEDULE_CREATE_NEW
          >,
        ): ManagePayScheduleFlowContextInterface => {
          return {
            ...ctx,
            component: ManagePayScheduleCreateEditContextual,
            returnContext: ev.payload.returnContext,
            editPayScheduleUuid: undefined,
          }
        },
      ),
    ),
    transition(
      componentEvents.MANAGE_PAY_SCHEDULE_BACK,
      'typeSelection',
      reduce(
        createReducer({
          component: ManagePayScheduleTypeSelectionContextual,
        }),
      ),
    ),
    exitFlowTransition,
  ),

  createSchedule: state<MachineTransition>(
    transition(
      componentEvents.PAY_SCHEDULE_CREATED,
      'assignment',
      reduce(
        createReducer({
          component: ManagePayScheduleAssignmentContextual,
          editPayScheduleUuid: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.MANAGE_PAY_SCHEDULE_CANCEL,
      'assignment',
      reduce(
        createReducer({
          component: ManagePayScheduleAssignmentContextual,
          editPayScheduleUuid: undefined,
          returnContext: undefined,
        }),
      ),
    ),
    exitFlowTransition,
  ),

  review: state<MachineTransition>(
    transition(
      componentEvents.MANAGE_PAY_SCHEDULE_CONFIRMED,
      'landing',
      reduce(
        (ctx: ManagePayScheduleFlowContextInterface): ManagePayScheduleFlowContextInterface => {
          return {
            ...ctx,
            component: ManagePayScheduleLandingContextual,
            successAlert: { messageKey: 'assignmentsUpdated' },
            assignmentData: undefined,
            selectedType: undefined,
          }
        },
      ),
    ),
    transition(
      componentEvents.MANAGE_PAY_SCHEDULE_BACK,
      'assignment',
      reduce(
        createReducer({
          component: ManagePayScheduleAssignmentContextual,
        }),
      ),
    ),
    exitFlowTransition,
  ),

  editSchedule: state<MachineTransition>(
    transition(
      componentEvents.PAY_SCHEDULE_UPDATED,
      'landing',
      reduce(
        createReducer({
          component: ManagePayScheduleLandingContextual,
          successAlert: { messageKey: 'scheduleUpdated' },
          editPayScheduleUuid: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.MANAGE_PAY_SCHEDULE_CANCEL,
      'landing',
      reduce(
        createReducer({
          component: ManagePayScheduleLandingContextual,
          editPayScheduleUuid: undefined,
        }),
      ),
    ),
    exitFlowTransition,
  ),
}
