import { useMemo } from 'react'
import { createMachine } from 'robot3'
import {
  DocumentListContextual,
  type DocumentSignerContextInterface,
} from './documentSignerStateMachine'
import { documentSignerMachine } from './stateMachine'

interface UseEmployeeDocumentSignerProps {
  employeeId: string
}

export function useEmployeeDocumentSigner({ employeeId }: UseEmployeeDocumentSignerProps) {
  const machine = useMemo(
    () =>
      createMachine(
        'index',
        documentSignerMachine,
        (initialContext: DocumentSignerContextInterface) => ({
          ...initialContext,
          component: DocumentListContextual,
          employeeId,
        }),
      ),
    [employeeId],
  )

  return {
    data: {},
    actions: {},
    meta: {
      machine,
    },
  }
}
