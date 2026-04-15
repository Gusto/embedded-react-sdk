import type { UseQueryResult } from '@tanstack/react-query'
import type { HookErrorHandling } from './types'
import { normalizeToSDKError } from '@/types/sdkError'

type QueryWithRefetch = Pick<UseQueryResult, 'error' | 'refetch'>

/**
 * Builds error handling for read-only queries (no submit state).
 *
 * Used by dashboard-style components that only fetch data and don't have
 * form submissions or mutations.
 *
 * @param queries - Array of React Query query objects with error and refetch
 * @returns HookErrorHandling object with normalized errors and retry function
 *
 * @example
 * ```typescript
 * const employeeQuery = useEmployeesGetSuspense({ employeeId })
 * const addressesQuery = useEmployeeAddressesGetSuspense({ employeeId })
 *
 * const errorHandling = buildQueryErrorHandling([employeeQuery, addressesQuery])
 * ```
 */
export function buildQueryErrorHandling(queries: QueryWithRefetch[]): HookErrorHandling {
  const errors = queries.filter(q => q.error != null).map(q => normalizeToSDKError(q.error))

  const retryQueries = () => {
    queries.filter(q => q.error != null).forEach(q => void q.refetch())
  }

  const clearSubmitError = () => {
    // No-op for read-only queries (no submit state to clear)
  }

  return { errors, retryQueries, clearSubmitError }
}
