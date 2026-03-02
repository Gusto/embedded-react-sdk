import { useState, useCallback } from 'react'
import type { EntityErrorObject } from '@gusto/embedded-api/models/components/entityerrorobject'
import { APIError } from '@gusto/embedded-api/models/errors/apierror'
import { GustoEmbeddedError } from '@gusto/embedded-api/models/errors/gustoembeddederror'
import { SDKValidationError } from '@gusto/embedded-api/models/errors/sdkvalidationerror'
import { UnprocessableEntityErrorObject } from '@gusto/embedded-api/models/errors/unprocessableentityerrorobject'
import type { KnownErrors } from './useBase'
import { useAsyncError } from '@/hooks/useAsyncError'
import { getFieldErrors } from '@/helpers/apiErrorToList'

type SubmitHandler<T> = (data: T) => Promise<void>

export const useBaseSubmit = () => {
  const [error, setError] = useState<KnownErrors | null>(null)
  const [fieldErrors, setFieldErrors] = useState<EntityErrorObject[] | null>(null)
  const throwError = useAsyncError()

  // Enhanced setError that also clears fieldErrors when error is cleared
  const setErrorWithFieldsClear = useCallback((error: KnownErrors | null) => {
    setError(error)
    if (!error) {
      setFieldErrors(null)
    }
  }, [])

  const processError = (error: KnownErrors) => {
    setError(error)
    //422	application/json - content relaited error
    if (error instanceof UnprocessableEntityErrorObject && Array.isArray(error.errors)) {
      setFieldErrors(error.errors.flatMap(err => getFieldErrors(err)))
    }
  }

  const baseSubmitHandler = useCallback(
    async <T>(data: T, componentHandler: SubmitHandler<T>) => {
      setError(null)
      setFieldErrors(null)
      try {
        await componentHandler(data)
      } catch (err) {
        if (
          err instanceof APIError ||
          err instanceof SDKValidationError ||
          err instanceof UnprocessableEntityErrorObject ||
          err instanceof GustoEmbeddedError
        ) {
          processError(err)
        } else throwError(err)
      }
    },
    [setError, throwError],
  )

  return {
    baseSubmitHandler,
    error,
    fieldErrors,
    setError: setErrorWithFieldsClear,
  }
}
