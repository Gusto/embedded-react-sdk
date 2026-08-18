import { PrintChecksForm } from './PrintChecksForm'
import { PrintChecksFailure } from './PrintChecksFailure'
import { PrintChecksSummary } from './PrintChecksSummary'
import { useFlow } from '@/components/Flow/useFlow'
import type { FlowContextInterface } from '@/components/Flow/useFlow'
import type { CommonComponentInterface } from '@/components/Base'
import type { EventType } from '@/types/Helpers'
import type { OnEventType } from '@/components/Base/useBase'

/**
 * Flow-machine context shared across the print-checks states.
 *
 * @internal
 */
export interface PrintChecksContextInterface extends FlowContextInterface {
  /** Company identifier. */
  companyId: string
  /** Payroll being printed. */
  payrollId: string
  /** URL of the generated checks PDF, once generation succeeds. */
  documentUrl?: string
  /** Error message surfaced on the failure screen. */
  errorMessage?: string
  /** Whether a generate-and-poll cycle is in flight, shared between the form body and its footer. */
  isGenerating?: boolean
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
export function PrintChecksFormContextual() {
  const { payrollId, isGenerating, onEvent } = useFlow<PrintChecksContextInterface>()

  return <PrintChecksForm payrollId={payrollId} isGenerating={isGenerating} onEvent={onEvent} />
}

PrintChecksFormContextual.Footer = PrintChecksForm.Footer

/** @internal */
export function PrintChecksFailureContextual() {
  const { errorMessage, onEvent } = useFlow<PrintChecksContextInterface>()

  return <PrintChecksFailure errorMessage={errorMessage} onEvent={onEvent} />
}

PrintChecksFailureContextual.Footer = PrintChecksFailure.Footer

/** @internal */
export function PrintChecksSummaryContextual() {
  const { documentUrl, onEvent } = useFlow<PrintChecksContextInterface>()

  return <PrintChecksSummary documentUrl={documentUrl} onEvent={onEvent} />
}

PrintChecksSummaryContextual.Footer = PrintChecksSummary.Footer
