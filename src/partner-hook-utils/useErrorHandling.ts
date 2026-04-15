import type { UseQueryResult } from '@tanstack/react-query'
import { collectErrors } from './collectErrors'
import type { HookErrorHandling } from './types'
import type { SDKError } from '@/types/sdkError'

type QueryWithRefetch = Pick<UseQueryResult, 'error' | 'refetch'>

export function useErrorHandling(
  queries: QueryWithRefetch[],
  submitState: { error: SDKError | null; setError: (error: SDKError | null) => void },
): HookErrorHandling {
  const errors = collectErrors(queries, submitState.error)

  const retryQueries = () => {
    queries.filter(q => q.error != null).forEach(q => void q.refetch())
  }

  const clearSubmitError = () => {
    submitState.setError(null)
  }

  return { errors, retryQueries, clearSubmitError }
}
