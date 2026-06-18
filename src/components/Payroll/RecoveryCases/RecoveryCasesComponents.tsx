import { RecoveryCasesResubmit } from './RecoveryCasesResubmit'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { FlowContextInterface } from '@/components/Flow/useFlow'
import type { CommonComponentInterface } from '@/components/Base'
import type { EventType } from '@/types/Helpers'
import type { OnEventType } from '@/components/Base/useBase'

/** @internal */
export interface RecoveryCasesContextInterface extends FlowContextInterface {
  /** Identifier of the company whose recovery cases are being managed. */
  companyId: string
  /** Identifier of the recovery case the user is currently resolving, if any. */
  selectedRecoveryCaseId?: string
  /** Component to render inside the modal for the current state, or `null` when no modal step is active. */
  component:
    | (React.ComponentType<CommonComponentInterface> & {
        Footer?: React.ComponentType<{
          onEvent: OnEventType<EventType, unknown>
        }>
      })
    | null
}

/** @internal */
export function RecoveryCasesResubmitContextual() {
  const { selectedRecoveryCaseId, onEvent } = useFlow<RecoveryCasesContextInterface>()

  return (
    <RecoveryCasesResubmit
      recoveryCaseId={ensureRequired(selectedRecoveryCaseId)}
      onEvent={onEvent}
    />
  )
}

RecoveryCasesResubmitContextual.Footer = RecoveryCasesResubmit.Footer
