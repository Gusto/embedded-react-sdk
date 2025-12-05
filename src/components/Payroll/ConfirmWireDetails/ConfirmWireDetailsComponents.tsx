import type { ConfirmationAlert } from './types'
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
  selectedWireInId?: string
  modalContainerRef?: React.RefObject<HTMLDivElement | null>
  showOnlyCloseButton?: boolean
  confirmationAlert?: ConfirmationAlert
  component:
    | (React.ComponentType<CommonComponentInterface> & {
        Footer?: React.ComponentType<{
          onEvent: OnEventType<EventType, unknown>
        }>
      })
    | null
}

export function WireInstructionsContextual() {
  const { companyId, wireInId, selectedWireInId, onEvent, modalContainerRef } =
    useFlow<ConfirmWireDetailsContextInterface>()

  return (
    <WireInstructions
      companyId={ensureRequired(companyId)}
      wireInId={wireInId}
      selectedWireInId={selectedWireInId}
      onEvent={onEvent}
      modalContainerRef={modalContainerRef}
    />
  )
}

WireInstructionsContextual.Footer = WireInstructions.Footer

export function ConfirmWireDetailsFormContextual() {
  const { selectedWireInId, companyId, onEvent, modalContainerRef } =
    useFlow<ConfirmWireDetailsContextInterface>()

  return (
    <ConfirmWireDetailsForm
      wireInId={ensureRequired(selectedWireInId)}
      companyId={ensureRequired(companyId)}
      onEvent={onEvent}
      modalContainerRef={modalContainerRef}
    />
  )
}

ConfirmWireDetailsFormContextual.Footer = ConfirmWireDetailsForm.Footer
