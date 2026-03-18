import { useState, useCallback } from 'react'
import { APIError } from '@gusto/embedded-api/models/errors/apierror'
import { GustoEmbeddedError } from '@gusto/embedded-api/models/errors/gustoembeddederror'
import { SDKValidationError } from '@gusto/embedded-api/models/errors/sdkvalidationerror'
import { UnprocessableEntityErrorObject } from '@gusto/embedded-api/models/errors/unprocessableentityerrorobject'
import { useAsyncError } from '@/hooks/useAsyncError'
import { useObservability } from '@/contexts/ObservabilityProvider/useObservability'
import { type SDKError, normalizeToSDKError } from '@/types/sdkError'

type SubmitHandler<T> = (data: T) => Promise<void>

export const useBaseSubmit = (componentName?: string) => {
  const [error, setError] = useState<SDKError | null>(null)
  const throwError = useAsyncError()
  const { observability } = useObservability()

  const processError = useCallback(
    (caughtError: GustoEmbeddedError | SDKValidationError) => {
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
        await componentHandler(data)
        success = true
      } catch (err) {
        if (
          err instanceof APIError ||
          err instanceof SDKValidationError ||
          err instanceof UnprocessableEntityErrorObject ||
          err instanceof GustoEmbeddedError
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
    [setError, throwError, observability, componentName, processError],
  )

  return {
    baseSubmitHandler,
    error,
    setError,
  }
}
