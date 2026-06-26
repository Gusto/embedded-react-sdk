import { createMachine } from 'robot3'
import { useMemo } from 'react'
import {
  DocumentsListContextual,
  type ContractorDocumentSignerContextInterface,
} from './documentSignerStateMachine'
import { contractorDocumentSignerMachine } from './stateMachine'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'

/**
 * Props for {@link ContractorDocumentSigner}.
 *
 * @public
 */
export interface ContractorDocumentSignerProps extends BaseComponentInterface {
  /** The associated contractor identifier. */
  contractorId: string
}

/**
 * Standalone flow for a contractor to review and sign their documents (W-9).
 *
 * @remarks
 * Lists the contractor's documents and routes through the signing UI for each
 * one, returning to the list after a document is signed or the user navigates
 * back. Composes {@link DocumentsList} and {@link SignatureForm}.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/documents/view` | Fired when a document's "Sign" action is selected from the list | `{ uuid: string; title?: string }` |
 * | `contractor/documents/sign` | Fired after a document is successfully signed | The signed document |
 * | `contractor/documents/done` | Fired when the contractor completes the documents step | — |
 * | `CANCEL` | Fired when the user navigates back from the signature form to the list | — |
 *
 * @components
 * - {@link DocumentsList}
 * - {@link SignatureForm}
 *
 * @param props - See {@link ContractorDocumentSignerProps}.
 * @returns The contractor document signing flow.
 * @public
 */
export function ContractorDocumentSigner(props: ContractorDocumentSignerProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ contractorId, onEvent }: ContractorDocumentSignerProps) {
  const machine = useMemo(
    () =>
      createMachine(
        'list',
        contractorDocumentSignerMachine,
        (initialContext: ContractorDocumentSignerContextInterface) => ({
          ...initialContext,
          component: DocumentsListContextual,
          contractorId,
        }),
      ),
    [contractorId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
