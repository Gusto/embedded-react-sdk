import type { UseQueryResult } from '@tanstack/react-query'
import { collectErrors } from './collectErrors'
import type { HookErrorHandling } from './types'
import type { SDKError } from '@/types/sdkError'

type QueryWithRefetch = Pick<UseQueryResult, 'error' | 'refetch'>

/**
 * Submit-side error state to merge with query errors. From `useBaseSubmit`, destructure
 * `{ error: submitError, setError: setSubmitError }` and pass `{ submitError, setSubmitError }`.
 */
export type SubmitStateForErrorHandling = {
  submitError: SDKError | null
  setSubmitError: (error: SDKError | null) => void
}

export type MixedErrorSource = QueryWithRefetch | { errorHandling: HookErrorHandling }

function isHookResultWithErrorHandling(
  source: MixedErrorSource,
): source is { errorHandling: HookErrorHandling } {
  return 'errorHandling' in source
}

/**
 * Composes `HookErrorHandling` from React Query results, optional submit state from `useBaseSubmit`,
 * and/or nested SDK hook results that expose `errorHandling`.
 *
 * Pairs with `composeSubmitHandler` by name: this composes **error state and recovery**; it is not a
 * submit callback.
 */
export function composeErrorHandler(
  sources: MixedErrorSource[],
  submitState?: SubmitStateForErrorHandling,
): HookErrorHandling {
  const queries: QueryWithRefetch[] = []
  const errorHandlingsFromNestedHooks: HookErrorHandling[] = []

  for (const source of sources) {
    if (isHookResultWithErrorHandling(source)) {
      errorHandlingsFromNestedHooks.push(source.errorHandling)
    } else {
      queries.push(source)
    }
  }

  const nestedErrors = errorHandlingsFromNestedHooks.flatMap(handling => handling.errors)

  let errors: SDKError[]
  if (errorHandlingsFromNestedHooks.length === 0) {
    errors = collectErrors(queries, submitState?.submitError ?? null)
  } else {
    const standaloneQueryErrors = collectErrors(queries, null)
    errors = [...nestedErrors, ...standaloneQueryErrors]
    if (submitState?.submitError) {
      errors.push(submitState.submitError)
    }
  }

  const retryQueries = () => {
    for (const handling of errorHandlingsFromNestedHooks) {
      handling.retryQueries()
    }
    queries.filter(q => q.error != null).forEach(q => void q.refetch())
  }

  const clearSubmitError = () => {
    for (const handling of errorHandlingsFromNestedHooks) {
      handling.clearSubmitError()
    }
    submitState?.setSubmitError(null)
  }

  return { errors, retryQueries, clearSubmitError }
}
