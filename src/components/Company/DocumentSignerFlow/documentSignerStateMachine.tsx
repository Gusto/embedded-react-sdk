import { transition, reduce, state } from 'robot3'
import type { Form } from '@gusto/embedded-api/models/components/form'
import type { Signatory } from '@gusto/embedded-api/models/components/signatory'
import { companyEvents } from '@/shared/constants'
import * as Company from '@/components/Company'
import { useFlowParams, type UseFlowParamsProps } from '@/components/Flow/hooks/useFlowParams'
import type { FlowContextInterface } from '@/components/Flow'
import { type MachineEventType } from '@/types/Helpers'

type EventPayloads = {
  [companyEvents.COMPANY_VIEW_FORM_TO_SIGN]: Form
  [companyEvents.COMPANY_SIGNATORY_CREATED]: Signatory
  [companyEvents.COMPANY_SIGNATORY_UPDATED]: Signatory
}

export interface DocumentSignerContextInterface extends FlowContextInterface {
  companyId: string
  signatoryId?: string
  formId?: string
}

function useDocumentSignerFlowParams(props: UseFlowParamsProps<DocumentSignerContextInterface>) {
  return useFlowParams(props)
}

export function AssignSignatory() {
  const { companyId, signatoryId, onEvent } = useDocumentSignerFlowParams({
    component: 'AssignSignatory',
    requiredParams: ['companyId'],
  })
  return (
    <Company.AssignSignatory companyId={companyId} signatoryId={signatoryId} onEvent={onEvent} />
  )
}

export function DocumentList() {
  const { companyId, signatoryId, onEvent } = useDocumentSignerFlowParams({
    component: 'DocumentList',
    requiredParams: ['companyId'],
  })

  return <Company.DocumentList companyId={companyId} signatoryId={signatoryId} onEvent={onEvent} />
}

export function SignatureForm() {
  const { companyId, formId, onEvent } = useDocumentSignerFlowParams({
    component: 'SignatureForm',
    requiredParams: ['companyId', 'formId'],
  })

  return <Company.SignatureForm companyId={companyId} formId={formId} onEvent={onEvent} />
}

const assignSignatoryState = state(
  transition(
    companyEvents.COMPANY_SIGNATORY_INVITED,
    'documentList',
    reduce(
      (ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
        ...ctx,
        component: DocumentList,
      }),
    ),
  ),
  transition(
    companyEvents.COMPANY_SIGNATORY_CREATED,
    'documentList',
    reduce(
      (
        ctx: DocumentSignerContextInterface,
        ev: MachineEventType<EventPayloads, typeof companyEvents.COMPANY_SIGNATORY_CREATED>,
      ): DocumentSignerContextInterface => ({
        ...ctx,
        signatoryId: ev.payload.uuid,
        component: DocumentList,
      }),
    ),
  ),
  transition(
    companyEvents.COMPANY_SIGNATORY_UPDATED,
    'documentList',
    reduce(
      (
        ctx: DocumentSignerContextInterface,
        ev: MachineEventType<EventPayloads, typeof companyEvents.COMPANY_SIGNATORY_UPDATED>,
      ): DocumentSignerContextInterface => ({
        ...ctx,
        signatoryId: ev.payload.uuid,
        component: DocumentList,
      }),
    ),
  ),
)

export const documentSignerMachine = {
  index: assignSignatoryState,
  documentList: state(
    transition(
      companyEvents.COMPANY_VIEW_FORM_TO_SIGN,
      'signatureForm',
      reduce(
        (
          ctx: DocumentSignerContextInterface,
          ev: MachineEventType<EventPayloads, typeof companyEvents.COMPANY_VIEW_FORM_TO_SIGN>,
        ): DocumentSignerContextInterface => ({
          ...ctx,
          formId: ev.payload.uuid,
          component: SignatureForm,
        }),
      ),
    ),
    transition(
      companyEvents.COMPANY_FORM_EDIT_SIGNATORY,
      'assignSignatory',
      reduce(
        (ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
          ...ctx,
          component: AssignSignatory,
        }),
      ),
    ),
  ),
  assignSignatory: assignSignatoryState,
  signatureForm: state(
    transition(
      companyEvents.COMPANY_SIGN_FORM_DONE,
      'documentList',
      reduce(
        (ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
          ...ctx,
          component: DocumentList,
        }),
      ),
    ),
    transition(
      companyEvents.COMPANY_SIGN_FORM_BACK,
      'documentList',
      reduce(
        (ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
          ...ctx,
          component: DocumentList,
        }),
      ),
    ),
  ),
}
