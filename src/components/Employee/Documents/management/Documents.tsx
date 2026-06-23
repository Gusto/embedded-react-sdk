import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { DocumentsCardContextual, type DocumentsContextInterface } from './DocumentsComponents'
import { documentsStateMachine } from './documentsStateMachine'
import { Flow } from '@/components/Flow/Flow'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'

/**
 * Props for {@link Documents}.
 *
 * @public
 */
export interface DocumentsProps extends BaseComponentInterface<'Employee.Management.Documents'> {
  /** The associated employee identifier. */
  employeeId: string
}

function DocumentsFlow({ employeeId, onEvent }: DocumentsProps) {
  useI18n('Employee.Management.Documents')

  const machine = useMemo(
    () =>
      createMachine('card', documentsStateMachine, (ctx: DocumentsContextInterface) => ({
        ...ctx,
        component: DocumentsCardContextual,
        employeeId,
      })),
    [employeeId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

/**
 * Standalone employee documents management flow.
 *
 * @remarks
 * Orchestrates the documents card and the per-form document manager. The flow
 * starts on the documents card and routes to the document manager when a row's
 * View CTA is selected; cancelling from the document manager returns to the
 * card.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/documents/card/viewRequested` | Fired when a row's View CTA is clicked on the documents card | `{ employeeId: string; formId: string }` |
 *
 * @param props - See {@link DocumentsProps}.
 * @returns The documents management flow.
 * @public
 */
export function Documents({ dictionary, FallbackComponent, ...props }: DocumentsProps) {
  useComponentDictionary('Employee.Management.Documents', dictionary)
  return (
    <BaseBoundaries
      componentName="Employee.Management.Documents"
      FallbackComponent={FallbackComponent}
    >
      <DocumentsFlow {...props} />
    </BaseBoundaries>
  )
}
