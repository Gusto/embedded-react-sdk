import { DocumentsCard } from './DocumentsCard'
import { DocumentManager } from './DocumentManager'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

/** @internal */
export interface DocumentsContextInterface extends FlowContextInterface {
  employeeId?: string
  /** Set when transitioning to `viewForm` via the VIEW_REQUESTED event;
   *  consumed by `DocumentManagerContextual` to load the selected form. */
  formId?: string
}

/** @internal */
export function DocumentsCardContextual() {
  const { employeeId, onEvent } = useFlow<DocumentsContextInterface>()
  return <DocumentsCard employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

/** @internal */
export function DocumentManagerContextual() {
  const { employeeId, formId, onEvent } = useFlow<DocumentsContextInterface>()
  return (
    <DocumentManager
      employeeId={ensureRequired(employeeId)}
      formId={ensureRequired(formId)}
      onEvent={onEvent}
    />
  )
}
