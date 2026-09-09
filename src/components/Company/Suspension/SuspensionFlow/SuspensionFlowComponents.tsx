import type { FallbackProps } from 'react-error-boundary'
import type { JSX } from 'react'
import { SuspensionForm } from '../SuspensionForm'
import { SuspensionSummary } from '../SuspensionSummary'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'
import type { LoaderComponentType } from '@/components/Base/Base'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * Flow context shared across the company suspension flow steps.
 *
 * @internal
 */
export interface SuspensionFlowContextInterface extends FlowContextInterface {
  /** The associated company identifier. */
  companyId: string
}

/**
 * Props for {@link SuspensionFlow}.
 *
 * @alpha
 */
export interface SuspensionFlowProps {
  /** The associated company identifier. */
  companyId: string
  /** Callback invoked when the flow emits an event. See the events table on {@link SuspensionFlow}. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom error-boundary fallback rendered when an unhandled error is caught. */
  FallbackComponent?: (props: FallbackProps) => JSX.Element
  /** Custom loading indicator rendered while the flow's data is fetching. */
  LoaderComponent?: LoaderComponentType
}

/** @internal */
export function SuspensionFormContextual() {
  const { companyId, onEvent } = useFlow<SuspensionFlowContextInterface>()
  return <SuspensionForm companyId={ensureRequired(companyId)} onEvent={onEvent} />
}

/** @internal */
export function SuspensionSummaryContextual() {
  const { companyId, onEvent } = useFlow<SuspensionFlowContextInterface>()
  return <SuspensionSummary companyId={ensureRequired(companyId)} onEvent={onEvent} />
}
