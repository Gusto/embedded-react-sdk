import { QueryClient } from '@tanstack/react-query'
import { API_QUERY_NAMESPACE } from './apiVersion'

/**
 * Creates a `QueryClient` pre-configured with the SDK's defaults for queries and mutations under the {@link API_QUERY_NAMESPACE} key.
 *
 * @remarks
 * Defaults applied:
 * - `retry: false` on both queries and mutations.
 * - `networkMode: 'always'` on both queries and mutations, so requests made while the browser reports offline fail with an error instead of
 *   staying paused (and showing an indefinite loading state) until connectivity returns.
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
  client.setQueryDefaults([API_QUERY_NAMESPACE], { retry: false, networkMode: 'always' })
  client.setMutationDefaults([API_QUERY_NAMESPACE], {
    retry: false,
    networkMode: 'always',
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: [API_QUERY_NAMESPACE] })
    },
  })
  return client
}
