import { useContext } from 'react'
import { ObservabilityContext } from './ObservabilityContext'
import type { ObservabilityContextValue } from './ObservabilityContext'
import { useSanitizedObservability } from './useSanitizedObservability'

/**
 * Returns the partner-supplied observability hook with PII sanitization applied to its callbacks.
 *
 * @remarks
 * SDK components call this hook to report errors and metrics. Each `onError` and `onMetric`
 * payload is run through the configured sanitization (PII pattern redaction plus sensitive-field
 * removal) before being passed to the partner's hook, so partner-side telemetry never receives
 * raw form values or other sensitive data unless explicitly opted in via `sanitization` config.
 * When no {@link ObservabilityProvider} is present, `observability` is `undefined` and reports
 * are dropped.
 *
 * @returns A context value whose `observability` is either the sanitized hook or `undefined`.
 * @public
 */
export const useObservability = (): ObservabilityContextValue => {
  const context = useContext(ObservabilityContext)
  const sanitizedObservability = useSanitizedObservability(context?.observability)

  if (context === undefined) {
    return { observability: undefined }
  }

  return { observability: sanitizedObservability }
}
