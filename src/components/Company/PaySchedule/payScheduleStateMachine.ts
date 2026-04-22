import { reduce, state, state as final, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { PayScheduleContextInterface } from './PayScheduleComponents'
import { PayScheduleFormContextual, PayScheduleListContextual } from './PayScheduleComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.PAY_SCHEDULE_UPDATE]: { uuid: string }
  [componentEvents.PAY_SCHEDULE_CREATED]: undefined
  [componentEvents.PAY_SCHEDULE_UPDATED]: undefined
}

const toList = reduce(
  (ctx: PayScheduleContextInterface): PayScheduleContextInterface => ({
    ...ctx,
    component: PayScheduleListContextual as ComponentType,
    payScheduleId: undefined,
  }),
)

export const payScheduleStateMachine = {
  listSchedules: state<MachineTransition>(
    transition(
      componentEvents.PAY_SCHEDULE_CREATE,
      'addSchedule',
      reduce(
        (ctx: PayScheduleContextInterface): PayScheduleContextInterface => ({
          ...ctx,
          component: PayScheduleFormContextual as ComponentType,
          payScheduleId: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.PAY_SCHEDULE_UPDATE,
      'editSchedule',
      reduce(
        (
          ctx: PayScheduleContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.PAY_SCHEDULE_UPDATE>,
        ): PayScheduleContextInterface => ({
          ...ctx,
          component: PayScheduleFormContextual as ComponentType,
          payScheduleId: ev.payload.uuid,
        }),
      ),
    ),
    transition(componentEvents.PAY_SCHEDULE_DONE, 'done'),
  ),
  addSchedule: state<MachineTransition>(
    transition(componentEvents.PAY_SCHEDULE_CREATED, 'listSchedules', toList),
    transition(componentEvents.CANCEL, 'listSchedules', toList),
  ),
  editSchedule: state<MachineTransition>(
    transition(componentEvents.PAY_SCHEDULE_UPDATED, 'listSchedules', toList),
    transition(componentEvents.CANCEL, 'listSchedules', toList),
  ),
  done: final(),
}
