import { useState, useCallback } from 'react'
import { APIError } from '@gusto/embedded-api-v-2025-11-15/models/errors/apierror'
import { GustoEmbeddedError } from '@gusto/embedded-api-v-2025-11-15/models/errors/gustoembeddederror'
import { SDKValidationError } from '@gusto/embedded-api-v-2025-11-15/models/errors/sdkvalidationerror'
import { UnprocessableEntityError } from '@gusto/embedded-api-v-2025-11-15/models/errors/unprocessableentityerror'
import { useAsyncError } from '@/hooks/useAsyncError'
import { useObservability } from '@/contexts/ObservabilityProvider/useObservability'
import { useReadOnly } from '@/contexts/ReadOnlyProvider/useReadOnly'
import { type SDKError, SDKInternalError, normalizeToSDKError } from '@/types/sdkError'

type SubmitHandler<T> = (data: T) => Promise<void>
const READ_ONLY_BLOCKED_MESSAGE =
  'This SDK instance is in read-only mode and cannot perform write actions.'

/**
 * Provides the standard SDK form-submit wrapper with normalized error state and observability instrumentation.
 *
 * @remarks
 * The returned `baseSubmitHandler` clears prior error state, awaits the caller's handler, normalizes
 * any caught `APIError`, `SDKValidationError`, `UnprocessableEntityError`, `GustoEmbeddedError`, or
 * `SDKInternalError` into an {@link SDKError}, and surfaces it on the `error` field. Any other thrown
 * value is re-thrown asynchronously so the nearest React error boundary catches it. An
 * `sdk.form.submit_duration` observability metric is emitted on every attempt, tagged with success or
 * error status.
 *
 * @param componentName - Optional component identifier used to tag observability errors and metrics.
 * @returns An object containing `baseSubmitHandler`, the current `error`, and `setError`.
 * @internal
 */
export const useBaseSubmit = (componentName?: string) => {
  const [error, setError] = useState<SDKError | null>(null)
  const throwError = useAsyncError()
  const { observability } = useObservability()
  const { readOnly } = useReadOnly()

  const processError = useCallback(
    (caughtError: GustoEmbeddedError | SDKValidationError | SDKInternalError) => {
      const sdkError = normalizeToSDKError(caughtError)

      setError(sdkError)

      observability?.onError?.({ ...sdkError, timestamp: Date.now(), componentName })
    },
    [observability, componentName],
  )

  const baseSubmitHandler = useCallback(
    async <T>(data: T, componentHandler: SubmitHandler<T>) => {
      const startTime = Date.now()
      setError(null)

      let success = false

      try {
        if (readOnly) {
          processError(new SDKInternalError(READ_ONLY_BLOCKED_MESSAGE))
          return
        }
        await componentHandler(data)
        success = true
      } catch (err) {
        if (
          err instanceof APIError ||
          err instanceof SDKValidationError ||
          err instanceof UnprocessableEntityError ||
          err instanceof GustoEmbeddedError ||
          err instanceof SDKInternalError
        ) {
          processError(err)
        } else throwError(err)
      } finally {
        const duration = Date.now() - startTime
        observability?.onMetric?.({
          name: 'sdk.form.submit_duration',
          value: duration,
          unit: 'ms',
          tags: {
            status: success ? 'success' : 'error',
            ...(componentName && { component: componentName }),
          },
          timestamp: Date.now(),
        })
      }
    },
    [setError, throwError, observability, componentName, processError, readOnly],
  )

  return {
    baseSubmitHandler,
    error,
    setError,
  }
}
