import type { UseQueryResult } from '@tanstack/react-query'
import { collectErrors } from './collectErrors'
import type { HookErrorHandling } from './types'
import type { SDKError } from '@/types/sdkError'

type QueryWithRefetch = Pick<UseQueryResult, 'error' | 'refetch'>

/**
 * Submit-side error state to merge into a composed {@link HookErrorHandling}.
 *
 * @remarks
 * Pass to {@link composeErrorHandler} when a screen has its own submit state outside of
 * any SDK form hook, so submit errors appear in the same error surface as query errors
 * and can be cleared together with `clearSubmitError`.
 *
 * @public
 */
export type SubmitStateForErrorHandling = {
  /** The current submit error, or `null` when cleared. */
  submitError: SDKError | null
  /** Sets or clears the submit error. */
  setSubmitError: (error: SDKError | null) => void
}

/**
 * Accepted input shape for {@link composeErrorHandler}: either a React Query result
 * (anything with `error` and `refetch`) or another SDK hook result that exposes
 * an `errorHandling` object.
 *
 * @public
 */
export type MixedErrorSource = QueryWithRefetch | { errorHandling: HookErrorHandling }

function isHookResultWithErrorHandling(
  source: MixedErrorSource,
): source is { errorHandling: HookErrorHandling } {
  return 'errorHandling' in source
}

/**
 * Merges multiple error sources into a single {@link HookErrorHandling}.
 *
 * @remarks
 * Accepts any mix of `@gusto/embedded-api-v-2026-06-15` React Query results and SDK hook
 * results that already expose an `errorHandling` object (including the value returned by
 * {@link composeSubmitHandler}). Query errors are normalized to `SDKError`, nested hook
 * errors are flattened in, and an optional submit-state argument adds a submit error to
 * the same list.
 *
 * The returned `retryQueries` refetches every failed query and delegates into each nested
 * hook so their retries fire too. `clearSubmitError` clears the optional submit state and
 * delegates into each nested hook.
 *
 * Pairs with {@link composeSubmitHandler} by name only — this composes error state and
 * recovery, not a submit callback.
 *
 * @param sources - Error sources to merge. Each entry is either a React Query result or
 *   an object with an `errorHandling` property.
 * @param submitState - Optional screen-level submit state to fold into the result.
 * @returns A single `HookErrorHandling` covering every source.
 * @public
 *
 * @example
 * ```tsx
 * import { composeErrorHandler, useEmployeeDetailsForm } from '@gusto/embedded-react-sdk'
 * import { useEmployeeFormsList } from '@gusto/embedded-api-v-2026-06-15/react-query/employeeFormsList'
 *
 * function EmployeeProfileView({ companyId, employeeId }: { companyId: string; employeeId: string }) {
 *   const employeeDetails = useEmployeeDetailsForm({ companyId, employeeId })
 *   const formsListQuery = useEmployeeFormsList({ employeeId })
 *
 *   const errorHandling = composeErrorHandler([employeeDetails, formsListQuery])
 *
 *   if (errorHandling.errors.length > 0) {
 *     return (
 *       <div role="alert">
 *         {errorHandling.errors.map((error, i) => (
 *           <p key={i}>{error.message}</p>
 *         ))}
 *         <button onClick={errorHandling.retryQueries}>Retry</button>
 *       </div>
 *     )
 *   }
 *
 *   return null
 * }
 * ```
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
