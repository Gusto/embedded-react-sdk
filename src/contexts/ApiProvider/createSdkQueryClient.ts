import { QueryClient } from '@tanstack/react-query'
import { GustoEmbeddedError } from '@gusto/embedded-api/models/errors/gustoembeddederror'
import { API_QUERY_NAMESPACE } from './apiVersion'

const HTTP_UNAUTHORIZED = 401

const isUnauthorizedError = (error: unknown) =>
  error instanceof GustoEmbeddedError && error.httpMeta.response.status === HTTP_UNAUTHORIZED

/**
 * Creates a `QueryClient` pre-configured with the SDK's defaults for queries and mutations under the {@link API_QUERY_NAMESPACE} key.
 *
 * @remarks
 * Defaults applied:
 * - `retry: false` on both queries and mutations.
 * - `networkMode: 'always'` on both queries and mutations, so requests made while the browser reports offline fail with an error instead of
 *   staying paused (and showing an indefinite loading state) until connectivity returns.
 * - `refetchOnWindowFocus` is skipped for a query whose last fetch failed with HTTP 401, so an expired session doesn't re-request the same
 *   data every time the tab becomes visible. The query fetches again on remount, an error-boundary reset, or invalidation; once a fetch
 *   succeeds, refetching on tab return resumes.
 * - On any successful mutation, every SDK query under the namespace is invalidated so the next read refetches fresh data.
 *
 * {@link ApiProvider} uses this when no `queryClient` prop is supplied, and `GustoTestProvider` uses it so tests faithfully replicate production
 * mutation/refetch behavior. Partners who supply their own `QueryClient` to {@link ApiProvider} are responsible for configuring equivalent
 * defaults if they want mutations to invalidate cached reads.
 *
 * @returns A new `QueryClient` with the SDK's query and mutation defaults applied.
 * @internal
 */
export function createSdkQueryClient(): QueryClient {
  const client = new QueryClient()
  client.setQueryDefaults([API_QUERY_NAMESPACE], {
    retry: false,
    networkMode: 'always',
    refetchOnWindowFocus: query => !isUnauthorizedError(query.state.error),
  })
  client.setMutationDefaults([API_QUERY_NAMESPACE], {
    retry: false,
    networkMode: 'always',
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: [API_QUERY_NAMESPACE] })
    },
  })
  return client
}
