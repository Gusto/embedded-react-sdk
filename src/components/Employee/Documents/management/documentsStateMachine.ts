import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { DocumentsContextInterface } from './DocumentsComponents'
import { DocumentsCardContextual, DocumentManagerContextual } from './DocumentsComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.EMPLOYEE_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED]: {
    employeeId: string
    formId: string
  }
}

const returnToCard = reduce(
  (ctx: DocumentsContextInterface): DocumentsContextInterface => ({
    ...ctx,
    component: DocumentsCardContextual as ComponentType,
    formId: undefined,
  }),
)

export const documentsStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED,
      'viewForm',
      reduce(
        (
          ctx: DocumentsContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.EMPLOYEE_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED
          >,
        ): DocumentsContextInterface => ({
          ...ctx,
          component: DocumentManagerContextual as ComponentType,
          formId: ev.payload.formId,
        }),
      ),
    ),
  ),
  viewForm: state<MachineTransition>(transition(componentEvents.CANCEL, 'card', returnToCard)),
}
