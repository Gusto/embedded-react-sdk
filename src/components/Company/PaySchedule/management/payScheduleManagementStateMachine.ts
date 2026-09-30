import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { PayScheduleManagementContextInterface } from './PayScheduleManagementComponents'
import {
  PayScheduleOverviewContextual,
  PayScheduleEditFormContextual,
  PayScheduleAssignmentContextual,
} from './PayScheduleManagementComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.PAY_SCHEDULE_UPDATE]: { uuid: string }
  [componentEvents.PAY_SCHEDULE_CREATED]: undefined
}

const toOverview = reduce(
  (ctx: PayScheduleManagementContextInterface): PayScheduleManagementContextInterface => ({
    ...ctx,
    component: PayScheduleOverviewContextual as ComponentType,
    payScheduleId: undefined,
    successAlert: null,
  }),
)

const toOverviewWithAlert = (alert: PayScheduleManagementContextInterface['successAlert']) =>
  reduce((ctx: PayScheduleManagementContextInterface): PayScheduleManagementContextInterface => ({
    ...ctx,
    component: PayScheduleOverviewContextual as ComponentType,
    payScheduleId: undefined,
    successAlert: alert,
  }))

/** @internal */
export const payScheduleManagementStateMachine = {
  overview: state<MachineTransition>(
    transition(
      componentEvents.PAY_SCHEDULE_UPDATE,
      'editSchedule',
      reduce(
        (
          ctx: PayScheduleManagementContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.PAY_SCHEDULE_UPDATE>,
        ): PayScheduleManagementContextInterface => ({
          ...ctx,
          component: PayScheduleEditFormContextual as ComponentType,
          payScheduleId: ev.payload.uuid,
        }),
      ),
    ),
    transition(
      componentEvents.PAY_SCHEDULE_MANAGE_ASSIGNMENT,
      'manageAssignment',
      reduce(
        (ctx: PayScheduleManagementContextInterface): PayScheduleManagementContextInterface => ({
          ...ctx,
          component: PayScheduleAssignmentContextual as ComponentType,
          successAlert: null,
        }),
      ),
    ),
    transition(componentEvents.PAY_SCHEDULE_MANAGEMENT_ALERT_DISMISSED, 'overview', toOverview),
  ),
  editSchedule: state<MachineTransition>(
    transition(componentEvents.PAY_SCHEDULE_UPDATED, 'overview', toOverview),
    transition(componentEvents.CANCEL, 'overview', toOverview),
  ),
  /**
   * Entered directly from PaySchedule.tsx's initial routing when the company has no pay
   * schedules yet — there's no overview to fall back to, so CANCEL isn't handled here; it
   * still bubbles to the host via Flow's onEvent re-emit.
   */
  createSchedule: state<MachineTransition>(
    transition(componentEvents.PAY_SCHEDULE_CREATED, 'overview', toOverview),
  ),
  manageAssignment: state<MachineTransition>(
    transition(componentEvents.PAY_SCHEDULE_ASSIGNMENT_CANCEL, 'overview', toOverview),
    transition(
      componentEvents.PAY_SCHEDULE_ASSIGNED,
      'overview',
      toOverviewWithAlert('assignmentUpdated'),
    ),
  ),
}
