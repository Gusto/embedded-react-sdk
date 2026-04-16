import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { useContractorDocumentsGetAllSuspense } from '@gusto/embedded-api/react-query/contractorDocumentsGetAll'
import {
  DocumentListContextual,
  type DocumentSignerContextInterface,
} from './documentSignerStateMachine'
import { documentSignerMachine } from './stateMachine'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

export interface DocumentSignerProps extends BaseComponentInterface<'Contractor.DocumentSigner'> {
  contractorId: string
}

export function DocumentSigner(props: DocumentSignerProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ contractorId, onEvent, dictionary }: DocumentSignerProps) {
  useComponentDictionary('Contractor.DocumentSigner', dictionary)

  // Pre-fetch documents to check if any need signing
  useContractorDocumentsGetAllSuspense({ contractorUuid: contractorId })

  const machine = useMemo(
    () =>
      createMachine(
        'index',
        documentSignerMachine,
        (initialContext: DocumentSignerContextInterface) => ({
          ...initialContext,
          component: DocumentListContextual,
          contractorId,
        }),
      ),
    [contractorId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
