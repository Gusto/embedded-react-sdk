import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GustoEmbeddedProvider } from '@gusto/embedded-api/react-query/_context'
import { GustoEmbeddedCore } from '@gusto/embedded-api/core'
import { SDKHooks as NativeSDKHooks } from '@gusto/embedded-api/hooks/hooks'
import { useMemo } from 'react'
import type { SDKHooks } from '@/types/hooks'

export interface ApiProviderProps {
  url: string
  headers?: HeadersInit
  hooks?: SDKHooks
  children: React.ReactNode
}

export function ApiProvider({ url, headers, hooks, children }: ApiProviderProps) {
  const gustoClient = useMemo(() => {
    // Create native SDKHooks instance and register user hooks
    const sdkHooks = new NativeSDKHooks()

    // Register user hooks with native SDK
    hooks?.beforeCreateRequest?.forEach(hook => {
      sdkHooks.registerBeforeCreateRequestHook(hook)
    })
    hooks?.beforeRequest?.forEach(hook => {
      sdkHooks.registerBeforeRequestHook(hook)
    })
    hooks?.afterSuccess?.forEach(hook => {
      sdkHooks.registerAfterSuccessHook(hook)
    })
    hooks?.afterError?.forEach(hook => {
      sdkHooks.registerAfterErrorHook(hook)
    })

    // Create GustoEmbeddedCore with SDK options
    const client = new GustoEmbeddedCore({
      serverURL: url,
    })

    // Register hooks with the client
    client._options.hooks = sdkHooks

    return client
  }, [url, hooks])

  const queryClient = useMemo(() => {
    const client = new QueryClient()

    const onSettled = async () => {
      await client.invalidateQueries()
    }
    client.setQueryDefaults(['@gusto/embedded-api'], { retry: false })
    client.setMutationDefaults(['@gusto/embedded-api'], { onSettled, retry: false })

    return client
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <GustoEmbeddedProvider client={gustoClient}>{children}</GustoEmbeddedProvider>
    </QueryClientProvider>
  )
}
