import { transition, state } from 'robot3'
// import { companyEvents } from '@/shared/constants'
import { LocationsList } from './LocationsList/LocationsList'
import { useFlowParams, type UseFlowParamsProps } from '@/components/Flow/hooks/useFlowParams'
// import { Schemas } from '@/types/schema'
import { FlowContextInterface } from '@/components/Flow'

// type EventPayloads = {
//   [companyEvents.COMPANY_VIEW_FORM_TO_SIGN]: Schemas['Form']
//   [companyEvents.COMPANY_SIGNATORY_CREATED]: Schemas['Signatory']
//   [companyEvents.COMPANY_SIGNATORY_UPDATED]: Schemas['Signatory']
// }

export interface LocationsContextInterface extends FlowContextInterface {
  companyId: string
}

function useLocationsFlowParams(props: UseFlowParamsProps<LocationsContextInterface>) {
  return useFlowParams(props)
}

export function LocationsListContextual() {
  const { companyId, onEvent } = useLocationsFlowParams({
    component: 'LocationsList',
    requiredParams: ['companyId'],
  })
  return <LocationsList companyId={companyId} onEvent={onEvent} />
  
}

// export function DocumentList() {
//   const { companyId, signatoryId, onEvent } = useDocumentSignerFlowParams({
//     component: 'DocumentList',
//     requiredParams: ['companyId'],
//   })

//   return <Company.DocumentList companyId={companyId} signatoryId={signatoryId} onEvent={onEvent} />
// }

// export function SignatureForm() {
//   const { companyId, form, onEvent } = useDocumentSignerFlowParams({
//     component: 'SignatureForm',
//     requiredParams: ['companyId', 'form'],
//   })

//   return <Company.SignatureForm companyId={companyId} form={form} onEvent={onEvent} />
// }

// const assignSignatoryState = state(
//   transition(
//     companyEvents.COMPANY_SIGNATORY_INVITED,
//     'documentList',
//     reduce(
//       (ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
//         ...ctx,
//         component: DocumentList,
//       }),
//     ),
//   ),
//   transition(
//     companyEvents.COMPANY_SIGNATORY_CREATED,
//     'documentList',
//     reduce(
//       (
//         ctx: DocumentSignerContextInterface,
//         ev: MachineEventType<EventPayloads, typeof companyEvents.COMPANY_SIGNATORY_CREATED>,
//       ): DocumentSignerContextInterface => ({
//         ...ctx,
//         signatoryId: ev.payload.uuid,
//         component: DocumentList,
//       }),
//     ),
//   ),
//   transition(
//     companyEvents.COMPANY_SIGNATORY_UPDATED,
//     'documentList',
//     reduce(
//       (
//         ctx: DocumentSignerContextInterface,
//         ev: MachineEventType<EventPayloads, typeof companyEvents.COMPANY_SIGNATORY_UPDATED>,
//       ): DocumentSignerContextInterface => ({
//         ...ctx,
//         signatoryId: ev.payload.uuid,
//         component: DocumentList,
//       }),
//     ),
//   ),
// )

export const locationsStateMachine = {
  index: state(transition("ff",'next')),
  // documentList: state(
  //   transition(
  //     companyEvents.COMPANY_VIEW_FORM_TO_SIGN,
  //     'signatureForm',
  //     reduce(
  //       (
  //         ctx: DocumentSignerContextInterface,
  //         ev: MachineEventType<EventPayloads, typeof companyEvents.COMPANY_VIEW_FORM_TO_SIGN>,
  //       ): DocumentSignerContextInterface => ({
  //         ...ctx,
  //         form: ev.payload,
  //         component: SignatureForm,
  //       }),
  //     ),
  //   ),
  //   transition(
  //     companyEvents.COMPANY_FORM_EDIT_SIGNATORY,
  //     'assignSignatory',
  //     reduce(
  //       (ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
  //         ...ctx,
  //         component: AssignSignatory,
  //       }),
  //     ),
  //   ),
  // ),
  // assignSignatory: assignSignatoryState,
  // signatureForm: state(
  //   transition(
  //     companyEvents.COMPANY_SIGN_FORM_DONE,
  //     'documentList',
  //     reduce(
  //       (ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
  //         ...ctx,
  //         component: DocumentList,
  //       }),
  //     ),
  //   ),
  //   transition(
  //     companyEvents.COMPANY_SIGN_FORM_BACK,
  //     'documentList',
  //     reduce(
  //       (ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
  //         ...ctx,
  //         component: DocumentList,
  //       }),
  //     ),
  //   ),
  // ),
}
