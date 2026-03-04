import { useState, useCallback } from 'react'
import type { EntityErrorObject } from '@gusto/embedded-api/models/components/entityerrorobject'
import { APIError } from '@gusto/embedded-api/models/errors/apierror'
import { GustoEmbeddedError } from '@gusto/embedded-api/models/errors/gustoembeddederror'
import { SDKValidationError } from '@gusto/embedded-api/models/errors/sdkvalidationerror'
import { UnprocessableEntityErrorObject } from '@gusto/embedded-api/models/errors/unprocessableentityerrorobject'
import { getFieldErrors } from '@/helpers/apiErrorToList'

export type SubmitError = GustoEmbeddedError | SDKValidationError | Error

export const useHookSubmit = () => {
  const [error, setError] = useState<SubmitError | null>(null)
  const [fieldErrors, setFieldErrors] = useState<EntityErrorObject[] | null>(null)

  const setErrorWithFieldsClear = useCallback((newError: SubmitError | null) => {
    setError(newError)
    if (!newError) {
      setFieldErrors(null)
    }
  }, [])

  const processError = (caughtError: SubmitError) => {
    setError(caughtError)
    if (
      caughtError instanceof UnprocessableEntityErrorObject &&
      Array.isArray(caughtError.errors)
    ) {
      const parsed = caughtError.errors.flatMap(err => getFieldErrors(err))
      if (parsed.length > 0) {
        setFieldErrors(parsed)
      } else {
        const fallbackErrors: EntityErrorObject[] = caughtError.errors
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
  }

  const submitHandler = useCallback(
    async <T, R>(data: T, handler: (data: T) => Promise<R>): Promise<R | null> => {
      setError(null)
      setFieldErrors(null)
      try {
        return await handler(data)
      } catch (err) {
        if (
          err instanceof APIError ||
          err instanceof SDKValidationError ||
          err instanceof UnprocessableEntityErrorObject ||
          err instanceof GustoEmbeddedError
        ) {
          processError(err)
        } else {
          setError(err instanceof Error ? err : new Error('An unexpected error occurred'))
        }
        return null
      }
    },
    [],
  )

  return {
    submitHandler,
    error,
    fieldErrors,
    setError: setErrorWithFieldsClear,
  }
}
