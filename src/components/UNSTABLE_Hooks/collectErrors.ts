import { type SDKError, normalizeToSDKError } from '@/types/sdkError'

interface QueryWithError {
  error: Error | null
}

export function collectErrors(queries: QueryWithError[], submitError: SDKError | null): SDKError[] {
  const queryErrors = queries
    .filter((q): q is QueryWithError & { error: Error } => q.error != null)
    .map(q => normalizeToSDKError(q.error))

  if (submitError) {
    queryErrors.push(submitError)
  }

  return queryErrors
}
