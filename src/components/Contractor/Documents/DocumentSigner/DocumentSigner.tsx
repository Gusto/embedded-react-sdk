import { createMachine } from 'robot3'
import { useMemo } from 'react'
import {
  DocumentsListContextual,
  type DocumentSignerContextInterface,
} from './documentSignerStateMachine'
import { documentSignerMachine } from './stateMachine'
import type { DocumentsListProps } from '../DocumentsList'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

/**
 * Props for {@link DocumentSigner}.
 *
 * @public
 */
export interface DocumentSignerProps
  extends Omit<BaseComponentInterface<'Contractor.DocumentsList'>, 'dictionary'> {
  /** The associated contractor identifier. */
  contractorId: string
  /** Overrides for the document list copy shown by the signing flow. */
  dictionary?: DocumentsListProps['dictionary']
}

function DocumentSignerFlow({ contractorId, onEvent, dictionary }: DocumentSignerProps) {
  useComponentDictionary('Contractor.DocumentsList', dictionary)

  const machine = useMemo(
    () =>
      createMachine(
        'index',
        documentSignerMachine,
        (initialContext: DocumentSignerContextInterface) => ({
          ...initialContext,
          component: DocumentsListContextual,
          contractorId,
        }),
      ),
    [contractorId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

/**
 * Contractor onboarding step for reading and signing required contractor documents.
 *
 * @remarks
 * Composes the contractor {@link DocumentsList} and {@link SignatureForm} into a
 * single signing workflow: the document list is shown first, selecting a
 * document routes to its signature form, and signing (or navigating back)
 * returns to the list. The list refetches automatically once a document is
 * signed. The flow completes when every document that requires signing has been
 * signed and the user continues.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/documents/view` | Fired when a document's "Sign" action is selected from the document list | `{ uuid: string; title?: string }` |
 * | `contractor/documents/sign` | Fired after a document is successfully signed | The signed document |
 * | `contractor/documents/done` | Fired when all required documents have been signed and the parent flow can advance | — |
 * | `cancel` | Fired when the user navigates back from the signature form to the document list | — |
 *
 * @components
 * - {@link DocumentsList}
 * - {@link SignatureForm}
 *
 * @param props - See {@link DocumentSignerProps}.
 * @returns The document signer flow.
 * @public
 */
export function DocumentSigner(props: DocumentSignerProps) {
  return (
    <BaseComponent {...props}>
      <DocumentSignerFlow {...props} />
    </BaseComponent>
  )
}
