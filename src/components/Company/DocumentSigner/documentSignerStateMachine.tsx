import { transition, reduce, state } from 'robot3'
import { companyEvents } from '@/shared/constants'
import * as Company from '@/components/Company'
import { useFlowParams, type UseFlowParamsProps } from '@/components/Flow/hooks/useFlowParams'
import { Schemas } from '@/types/schema'
import { FlowContextInterface } from '@/components/Flow'
import { type MachineEventType } from '@/types/Helpers'

type EventPayloads = {
  [companyEvents.COMPANY_VIEW_FORM_TO_SIGN]: Schemas['Form']
  [companyEvents.COMPANY_SIGNATORY_CREATED]: Schemas['Signatory']
  [companyEvents.COMPANY_SIGNATORY_UPDATED]: Schemas['Signatory']
}

export interface DocumentSignerContextInterface extends FlowContextInterface {
  companyId: string
  signatoryId?: string
  form?: Schemas['Form']
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
  const { companyId, form, onEvent } = useDocumentSignerFlowParams({
    component: 'SignatureForm',
    requiredParams: ['companyId', 'form'],
  })

  return <Company.SignatureForm companyId={companyId} form={form} onEvent={onEvent} />
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
          form: ev.payload,
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
