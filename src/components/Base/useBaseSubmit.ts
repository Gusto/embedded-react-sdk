import { useState } from 'react'
import type { EntityErrorObject } from '@gusto/embedded-api/models/components/entityerrorobject'
import { APIError } from '@gusto/embedded-api/models/errors/apierror'
import { GustoEmbeddedError } from '@gusto/embedded-api/models/errors/gustoembeddederror'
import { SDKValidationError } from '@gusto/embedded-api/models/errors/sdkvalidationerror'
import { UnprocessableEntityErrorObject } from '@gusto/embedded-api/models/errors/unprocessableentityerrorobject'
import type { KnownErrors } from './useBase'
import { useAsyncError } from '@/hooks/useAsyncError'
import { getFieldErrors } from '@/helpers/apiErrorToList'

export const useBaseSubmit = () => {
  const [error, setError] = useState<KnownErrors | null>(null)
  const [fieldErrors, setFieldErrors] = useState<EntityErrorObject[] | null>(null)
  const throwError = useAsyncError()

  const setErrorWithFieldsClear = (error: KnownErrors | null) => {
    setError(error)
    if (!error) {
      setFieldErrors(null)
    }
  }

  const processError = (error: KnownErrors) => {
    setError(error)
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
  }

  const baseSubmitHandler = async <T, R>(
    data: T,
    componentHandler: (data: T) => Promise<R>,
  ): Promise<R | undefined> => {
    setError(null)
    setFieldErrors(null)
    try {
      return await componentHandler(data)
    } catch (err) {
      if (
        err instanceof APIError ||
        err instanceof SDKValidationError ||
        err instanceof UnprocessableEntityErrorObject ||
        err instanceof GustoEmbeddedError
      ) {
        processError(err)
        return undefined
      } else {
        throwError(err)
        return undefined
      }
    }
  }

  return {
    baseSubmitHandler,
    error,
    fieldErrors,
    setError: setErrorWithFieldsClear,
  }
}
