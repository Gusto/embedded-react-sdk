import { QueryClient } from '@tanstack/react-query'

/**
 * Creates a `QueryClient` pre-configured with the SDK's defaults for queries and mutations under the `['@gusto/embedded-api-v-2026-06-15']` key.
 *
 * @remarks
 * Defaults applied:
 * - `retry: false` on both queries and mutations.
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
  client.setQueryDefaults(['@gusto/embedded-api-v-2026-06-15'], { retry: false })
  client.setMutationDefaults(['@gusto/embedded-api-v-2026-06-15'], {
    retry: false,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['@gusto/embedded-api-v-2026-06-15'] })
    },
  })
  return client
}
