import { InformationRequestForm } from './InformationRequestForm'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { FlowContextInterface } from '@/components/Flow/useFlow'
import type { CommonComponentInterface } from '@/components/Base'
import type { EventType } from '@/types/Helpers'
import type { OnEventType } from '@/components/Base/useBase'

export interface InformationRequestsContextInterface extends FlowContextInterface {
  companyId: string
  selectedRequestId?: string
  component:
    | (React.ComponentType<CommonComponentInterface> & {
        Footer?: React.ComponentType<{
          onEvent: OnEventType<EventType, unknown>
        }>
      })
    | null
}

export function InformationRequestFormContextual() {
  const { companyId, selectedRequestId, onEvent } = useFlow<InformationRequestsContextInterface>()

  return (
    <InformationRequestForm
      companyId={companyId}
      requestId={ensureRequired(selectedRequestId)}
      onEvent={onEvent}
    />
  )
}

InformationRequestFormContextual.Footer = InformationRequestForm.Footer
