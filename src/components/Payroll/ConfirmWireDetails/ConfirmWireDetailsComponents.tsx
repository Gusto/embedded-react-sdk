import { WireInstructions } from './WireInstructions'
import { ConfirmWireDetailsForm } from './ConfirmWireDetailsForm'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { FlowContextInterface } from '@/components/Flow/useFlow'
import type { CommonComponentInterface } from '@/components/Base'
import type { EventType } from '@/types/Helpers'
import type { OnEventType } from '@/components/Base/useBase'

export interface ConfirmWireDetailsContextInterface extends FlowContextInterface {
  companyId: string
  wireInId?: string
  component:
    | (React.ComponentType<CommonComponentInterface> & {
        Footer?: React.ComponentType<{ onEvent: OnEventType<EventType, unknown> }>
      })
    | null
}

export function WireInstructionsContextual() {
  const { companyId, wireInId, onEvent } = useFlow<ConfirmWireDetailsContextInterface>()

  return (
    <WireInstructions companyId={ensureRequired(companyId)} wireInId={wireInId} onEvent={onEvent} />
  )
}

export function ConfirmWireDetailsFormContextual() {
  const { wireInId, onEvent } = useFlow<ConfirmWireDetailsContextInterface>()

  return (
    <ConfirmWireDetailsForm
      wireInId={ensureRequired(wireInId || '7d9be066-c8bc-4fdb-941c-4c80204205a3')} //TODO: remove this default value
      onEvent={onEvent}
    />
  )
}

ConfirmWireDetailsFormContextual.Footer = ConfirmWireDetailsForm.Footer
