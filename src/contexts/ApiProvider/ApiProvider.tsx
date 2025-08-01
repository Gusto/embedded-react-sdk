import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GustoEmbeddedProvider } from '@gusto/embedded-api/react-query/_context'
import { GustoEmbeddedCore } from '@gusto/embedded-api/core'
import { SDKHooks as NativeSDKHooks } from '@gusto/embedded-api/hooks/hooks'
import { useMemo } from 'react'
import type { SDKHooks, BeforeRequestHook } from '@/types/hooks'

export interface ApiProviderProps {
  url: string
  headers?: HeadersInit
  hooks?: SDKHooks
  children: React.ReactNode
}

export function ApiProvider({ url, headers, hooks, children }: ApiProviderProps) {
  const gustoClient = useMemo(() => {
    // Create GustoEmbeddedCore first to access its existing hooks instance
    const client = new GustoEmbeddedCore({
      serverURL: url,
    })

    // Use the client's existing hooks instance or create new one
    const sdkHooks = client._options.hooks || new NativeSDKHooks()

    // Create default header hook if headers are provided
    if (headers) {
      const defaultHeaderHook: BeforeRequestHook = {
        beforeRequest: (context, request) => {
          const headersInstance = new Headers(headers)
          headersInstance.forEach((headerValue, headerName) => {
            if (headerValue) {
              request.headers.set(headerName, headerValue)
            }
          })
          return request
        },
      }
      sdkHooks.registerBeforeRequestHook(defaultHeaderHook)
    }

    // Register user hooks with native SDK
    if (hooks?.beforeCreateRequest) {
      hooks.beforeCreateRequest.forEach(hook => {
        sdkHooks.registerBeforeCreateRequestHook(hook)
      })
    }

    if (hooks?.beforeRequest) {
      hooks.beforeRequest.forEach(hook => {
        sdkHooks.registerBeforeRequestHook(hook)
      })
    }

    if (hooks?.afterSuccess) {
      hooks.afterSuccess.forEach(hook => {
        sdkHooks.registerAfterSuccessHook(hook)
      })
    }

    if (hooks?.afterError) {
      hooks.afterError.forEach(hook => {
        sdkHooks.registerAfterErrorHook(hook)
      })
    }

    // Ensure hooks are set on the client (should already be there if we used existing instance)
    if (!client._options.hooks) {
      client._options.hooks = sdkHooks
    }

    return client
  }, [url, headers, hooks])

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
