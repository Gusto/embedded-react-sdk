import { RecoveryCasesResubmit } from './RecoveryCasesResubmit'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { FlowContextInterface } from '@/components/Flow/useFlow'
import type { CommonComponentInterface } from '@/components/Base'
import type { EventType } from '@/types/Helpers'
import type { OnEventType } from '@/components/Base/useBase'

export interface RecoveryCasesContextInterface extends FlowContextInterface {
  companyId: string
  selectedRecoveryCaseId?: string
  component:
    | (React.ComponentType<CommonComponentInterface> & {
        Footer?: React.ComponentType<{
          onEvent: OnEventType<EventType, unknown>
        }>
      })
    | null
}

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
