import { state, transition, reduce } from 'robot3'
import type { InformationRequestsContextInterface } from './InformationRequestsComponents'
import { InformationRequestFormContextual } from './InformationRequestsComponents'
import { informationRequestEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

export type EventPayloads = {
  [informationRequestEvents.INFORMATION_REQUEST_RESPOND]: {
    requestId: string
  }
  [informationRequestEvents.INFORMATION_REQUEST_FORM_CANCEL]: undefined
  [informationRequestEvents.INFORMATION_REQUEST_FORM_DONE]: undefined
}

export const informationRequestsMachine = {
  list: state<MachineTransition>(
    transition(
      informationRequestEvents.INFORMATION_REQUEST_RESPOND,
      'form',
      reduce(
        (
          ctx: InformationRequestsContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof informationRequestEvents.INFORMATION_REQUEST_RESPOND
          >,
        ): InformationRequestsContextInterface => ({
          ...ctx,
          component: InformationRequestFormContextual,
          selectedRequestId: ev.payload.requestId,
        }),
      ),
    ),
  ),
  form: state<MachineTransition>(
    transition(
      informationRequestEvents.INFORMATION_REQUEST_FORM_DONE,
      'list',
      reduce(
        (ctx: InformationRequestsContextInterface): InformationRequestsContextInterface => ({
          ...ctx,
          component: null,
          selectedRequestId: undefined,
        }),
      ),
    ),
    transition(
      informationRequestEvents.INFORMATION_REQUEST_FORM_CANCEL,
      'list',
      reduce(
        (ctx: InformationRequestsContextInterface): InformationRequestsContextInterface => ({
          ...ctx,
          component: null,
          selectedRequestId: undefined,
        }),
      ),
    ),
  ),
  final: state<MachineTransition>(),
}
