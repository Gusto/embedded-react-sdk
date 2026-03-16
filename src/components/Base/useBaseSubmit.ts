import { useState, useCallback } from 'react'
import type { EntityErrorObject } from '@gusto/embedded-api/models/components/entityerrorobject'
import { APIError } from '@gusto/embedded-api/models/errors/apierror'
import { GustoEmbeddedError } from '@gusto/embedded-api/models/errors/gustoembeddederror'
import { SDKValidationError } from '@gusto/embedded-api/models/errors/sdkvalidationerror'
import { UnprocessableEntityErrorObject } from '@gusto/embedded-api/models/errors/unprocessableentityerrorobject'
import type { KnownErrors } from './useBase'
import { useAsyncError } from '@/hooks/useAsyncError'
import { useObservability } from '@/contexts/ObservabilityProvider/useObservability'
import { createObservabilityError } from '@/contexts/ObservabilityProvider/observabilityUtils'
import { getFieldErrors } from '@/helpers/apiErrorToList'

type SubmitHandler<T> = (data: T) => Promise<void>

export const useBaseSubmit = (componentName?: string) => {
  const [error, setError] = useState<KnownErrors | null>(null)
  const [fieldErrors, setFieldErrors] = useState<EntityErrorObject[] | null>(null)
  const throwError = useAsyncError()
  const { observability } = useObservability()

  // Enhanced setError that also clears fieldErrors when error is cleared
  const setErrorWithFieldsClear = useCallback((error: KnownErrors | null) => {
    setError(error)
    if (!error) {
      setFieldErrors(null)
    }
  }, [])

  const processError = useCallback(
    (error: KnownErrors) => {
      setError(error)

      // Report error to observability
      const observabilityError = createObservabilityError(error)
      if (observabilityError) {
        observability?.onError?.({
          ...observabilityError,
          context: {
            ...observabilityError.context,
            componentName,
          },
        })
      }

      if (error instanceof UnprocessableEntityErrorObject && Array.isArray(error.errors)) {
        const parsed = error.errors.flatMap(err => getFieldErrors(err))
        if (parsed.length > 0) {
          setFieldErrors(parsed)
        } else {
          const fallbackErrors: EntityErrorObject[] = error.errors
            .filter(err => err.message)
            .map(err => ({
              errorKey: err.errorKey,
              message: err.message ?? '',
              category: err.category,
            }))
          if (fallbackErrors.length > 0) {
            setFieldErrors(fallbackErrors)
          }
        }
      }
    },
    [observability, componentName],
  )

  const baseSubmitHandler = useCallback(
    async <T>(data: T, componentHandler: SubmitHandler<T>) => {
      const startTime = Date.now()
      setError(null)
      setFieldErrors(null)

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
    fieldErrors,
    setError: setErrorWithFieldsClear,
  }
}
