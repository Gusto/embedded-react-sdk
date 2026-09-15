import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { PayScheduleManagementContextInterface } from './PayScheduleManagementComponents'
import {
  PayScheduleOverviewContextual,
  PayScheduleEditFormContextual,
} from './PayScheduleManagementComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.PAY_SCHEDULE_UPDATE]: { uuid: string }
}

const toOverview = reduce(
  (ctx: PayScheduleManagementContextInterface): PayScheduleManagementContextInterface => ({
    ...ctx,
    component: PayScheduleOverviewContextual as ComponentType,
    payScheduleId: undefined,
  }),
)

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
  ),
  editSchedule: state<MachineTransition>(
    transition(componentEvents.PAY_SCHEDULE_UPDATED, 'overview', toOverview),
    transition(componentEvents.CANCEL, 'overview', toOverview),
  ),
}
