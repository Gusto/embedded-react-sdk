import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { DocumentsContextInterface, DocumentsSuccessAlertCode } from './DocumentsComponents'
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
    successAlert: null,
    formId: undefined,
  }),
)

const returnToCardWithAlert = (alert: DocumentsSuccessAlertCode) =>
  reduce(
    (ctx: DocumentsContextInterface): DocumentsContextInterface => ({
      ...ctx,
      component: DocumentsCardContextual as ComponentType,
      successAlert: alert,
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
          successAlert: null,
        }),
      ),
    ),
    transition(componentEvents.EMPLOYEE_MANAGEMENT_DOCUMENTS_ALERT_DISMISSED, 'card', returnToCard),
  ),
  viewForm: state<MachineTransition>(
    // After signing, return to the card with a success alert rather than
    // leaving the user on a read-only view that embeds a just-signed PDF the
    // backend may not have finished generating (SDK-946). Mirrors the dashboard
    // flow and the onboarding DocumentSigner, both of which return to the list
    // on sign.
    transition(componentEvents.EMPLOYEE_SIGN_FORM, 'card', returnToCardWithAlert('documentSigned')),
    transition(componentEvents.CANCEL, 'card', returnToCard),
  ),
}
