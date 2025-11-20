import { WireInstructions } from './WireInstructions'
import { ConfirmWireDetailsForm } from './ConfirmWireDetailsForm'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { FlowContextInterface } from '@/components/Flow/useFlow'
import type { CommonComponentInterface } from '@/components/Base'
import type { EventType } from '@/types/Helpers'
import type { OnEventType } from '@/components/Base/useBase'

export interface ConfirmWireDetailsContextInterface extends FlowContextInterface {
  companyId: string //TODO: is this needed?
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
      wireInId={ensureRequired(wireInId || 'a68ec264-69c3-485a-8fdd-da59260d86cf')}
      onEvent={onEvent}
    />
  )
}

ConfirmWireDetailsFormContextual.Footer = ConfirmWireDetailsForm.Footer
