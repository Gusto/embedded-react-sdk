import { state, transition, reduce } from 'robot3'
import type { ComponentType } from 'react'
import {
  AssignmentTypeStep,
  AssignmentScheduleStep,
  AssignmentCreateScheduleStep,
  AssignmentReviewStep,
} from './PayScheduleAssignmentComponents'
import type { EventPayloads } from './PayScheduleAssignmentComponents'
import type { PayScheduleAssignmentContextInterface } from './usePayScheduleAssignment'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

const toAssignmentSchedule = reduce(
  (ctx: PayScheduleAssignmentContextInterface): PayScheduleAssignmentContextInterface => ({
    ...ctx,
    component: AssignmentScheduleStep as ComponentType,
  }),
)

/** @internal */
export const payScheduleAssignmentStateMachine = {
  assignmentType: state<MachineTransition>(
    transition(
      componentEvents.PAY_SCHEDULE_ASSIGNMENT_TYPE_SELECTED,
      'assignmentSchedule',
      reduce(
        (
          ctx: PayScheduleAssignmentContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.PAY_SCHEDULE_ASSIGNMENT_TYPE_SELECTED
          >,
        ): PayScheduleAssignmentContextInterface => {
          // Switching type invalidates every schedule already picked under the old one, so a
          // Single → HourlySalaried → Back → Single round trip can't resurrect a stale uuid.
          const isSameType = ctx.assignmentType === ev.payload.type

          return {
            ...ctx,
            component: AssignmentScheduleStep as ComponentType,
            assignmentType: ev.payload.type,
            defaultPayScheduleUuid: isSameType ? ctx.defaultPayScheduleUuid : undefined,
            hourlyPayScheduleUuid: isSameType ? ctx.hourlyPayScheduleUuid : undefined,
            salariedPayScheduleUuid: isSameType ? ctx.salariedPayScheduleUuid : undefined,
          }
        },
      ),
    ),
  ),
  assignmentSchedule: state<MachineTransition>(
    transition(
      componentEvents.PAY_SCHEDULE_ASSIGNMENT_BACK,
      'assignmentType',
      reduce(
        (ctx: PayScheduleAssignmentContextInterface): PayScheduleAssignmentContextInterface => ({
          ...ctx,
          component: AssignmentTypeStep as ComponentType,
        }),
      ),
    ),
    transition(
      componentEvents.PAY_SCHEDULE_CREATE,
      'assignmentCreateSchedule',
      reduce(
        (ctx: PayScheduleAssignmentContextInterface): PayScheduleAssignmentContextInterface => ({
          ...ctx,
          component: AssignmentCreateScheduleStep as ComponentType,
        }),
      ),
    ),
    transition(
      componentEvents.PAY_SCHEDULE_ASSIGNMENT_SCHEDULE_SELECTED,
      'assignmentReview',
      reduce(
        (
          ctx: PayScheduleAssignmentContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.PAY_SCHEDULE_ASSIGNMENT_SCHEDULE_SELECTED
          >,
        ): PayScheduleAssignmentContextInterface => ({
          ...ctx,
          component: AssignmentReviewStep as ComponentType,
          ...ev.payload,
        }),
      ),
    ),
  ),
  assignmentCreateSchedule: state<MachineTransition>(
    transition(
      componentEvents.PAY_SCHEDULE_CREATED,
      'assignmentSchedule',
      reduce(
        (
          ctx: PayScheduleAssignmentContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.PAY_SCHEDULE_CREATED>,
        ): PayScheduleAssignmentContextInterface => ({
          ...ctx,
          component: AssignmentScheduleStep as ComponentType,
          defaultPayScheduleUuid: ev.payload.paySchedule.uuid,
        }),
      ),
    ),
    transition(componentEvents.CANCEL, 'assignmentSchedule', toAssignmentSchedule),
  ),
  assignmentReview: state<MachineTransition>(
    transition(
      componentEvents.PAY_SCHEDULE_ASSIGNMENT_BACK,
      'assignmentSchedule',
      toAssignmentSchedule,
    ),
  ),
}
