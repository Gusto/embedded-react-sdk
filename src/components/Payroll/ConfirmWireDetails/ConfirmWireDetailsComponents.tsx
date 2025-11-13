import { WireInstructions } from './WireInstructions'
import { ConfirmWireDetailsForm } from './ConfirmWireDetailsForm'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { FlowContextInterface } from '@/components/Flow/useFlow'

export interface ConfirmWireDetailsContextInterface extends FlowContextInterface {
  companyId: string
  wireInId?: string
}

export function WireInstructionsContextual() {
  const { companyId, wireInId, onEvent } = useFlow<ConfirmWireDetailsContextInterface>()

  return (
    <WireInstructions companyId={ensureRequired(companyId)} wireInId={wireInId} onEvent={onEvent} />
  )
}

export function ConfirmWireDetailsFormContextual() {
  const { companyId, wireInId, onEvent } = useFlow<ConfirmWireDetailsContextInterface>()

  return (
    <ConfirmWireDetailsForm
      companyId={ensureRequired(companyId)}
      wireInId={wireInId}
      onEvent={onEvent}
    />
  )
}
