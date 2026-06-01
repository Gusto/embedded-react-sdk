import { QueryClient } from '@tanstack/react-query'

/**
 * Creates a QueryClient pre-configured with the SDK's defaults for queries and
 * mutations under the `['@gusto/embedded-api-v-2025-11-15']` key:
 *
 * - `retry: false` on both queries and mutations.
 * - On any successful mutation, all SDK queries are invalidated so the next
 *   read sees fresh data.
 *
 * `ApiProvider` uses this when no `queryClient` prop is supplied. `GustoTestProvider`
 * uses it so tests faithfully replicate production mutation/refetch behavior.
 *
 * Partners who supply their own `QueryClient` to `ApiProvider` are responsible
 * for configuring equivalent defaults if they want mutations to invalidate
 * cached reads.
 */
export function createSdkQueryClient(): QueryClient {
  const client = new QueryClient()
  client.setQueryDefaults(['@gusto/embedded-api-v-2025-11-15'], { retry: false })
  client.setMutationDefaults(['@gusto/embedded-api-v-2025-11-15'], {
    retry: false,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['@gusto/embedded-api-v-2025-11-15'] })
    },
  })
  return client
}
