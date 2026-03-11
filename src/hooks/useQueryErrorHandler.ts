import { useCallback, useEffect } from 'react'
import { GustoEmbeddedError } from '@gusto/embedded-api/models/errors/gustoembeddederror'
import { SDKValidationError } from '@gusto/embedded-api/models/errors/sdkvalidationerror'
import type { KnownErrors } from '@/components/Base/useBase'
import { useAsyncError } from '@/hooks/useAsyncError'

type QueryError = Error | null | undefined

export function useQueryErrorHandler(
  errors: QueryError | QueryError[],
  setError: (error: KnownErrors | null) => void,
) {
  const throwError = useAsyncError()

  const processError = useCallback(
    (error: Error) => {
      if (error instanceof GustoEmbeddedError || error instanceof SDKValidationError) {
        setError(error)
      } else {
        throwError(error)
      }
    },
    [setError, throwError],
  )

  useEffect(() => {
    const errorList = Array.isArray(errors) ? errors : [errors]
    for (const error of errorList) {
      if (error) {
        processError(error)
      }
    }
  }, [errors, processError])
}
