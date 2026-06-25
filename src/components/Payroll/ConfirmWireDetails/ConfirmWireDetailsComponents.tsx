import type { ConfirmationAlert } from './types'
import { WireInstructions } from './WireInstructions'
import { ConfirmWireDetailsForm } from './ConfirmWireDetailsForm'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { FlowContextInterface } from '@/components/Flow/useFlow'
import type { CommonComponentInterface } from '@/components/Base'
import type { EventType } from '@/types/Helpers'
import type { OnEventType } from '@/components/Base/useBase'

/**
 * Flow-machine context shared across the wire-confirmation states.
 *
 * @internal
 */
export interface ConfirmWireDetailsContextInterface extends FlowContextInterface {
  /** Company identifier. */
  companyId: string
  /** Specific wire-in request being acted on, if provided as a prop. */
  wireInId?: string
  /** Wire-in request currently selected within the flow. */
  selectedWireInId?: string
  /** Ref to the modal container element, used as the portal target. */
  modalContainerRef?: React.RefObject<HTMLDivElement | null>
  /** Whether the modal footer should hide the primary action and show only the close button. */
  showOnlyCloseButton?: boolean
  /** Confirmation alert displayed on the banner after a successful submission. */
  confirmationAlert?: ConfirmationAlert
  /** Component to render inside the modal for the current state, with an optional footer slot. */
  component:
    | (React.ComponentType<CommonComponentInterface> & {
        Footer?: React.ComponentType<{
          onEvent: OnEventType<EventType, unknown>
        }>
      })
    | null
}

/** @internal */
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

/** @internal */
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
