import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { GustoEmbeddedProvider } from '@gusto/embedded-api-v-2025-11-15/react-query/_context'
import { GustoEmbeddedCore } from '@gusto/embedded-api-v-2025-11-15/core'
import { SDKHooks as NativeSDKHooks } from '@gusto/embedded-api-v-2025-11-15/hooks/hooks'
import { useMemo } from 'react'
import { apiVersionHook } from './apiVersionHook'
import { createSdkQueryClient } from './createSdkQueryClient'
import type { SDKHooks, BeforeRequestHook } from '@/types/hooks'

export interface ApiProviderProps {
  url: string
  headers?: HeadersInit
  hooks?: SDKHooks
  children: React.ReactNode
  queryClient?: QueryClient
}

export function ApiProvider({
  url,
  headers,
  hooks,
  children,
  queryClient: queryClientFromProps,
}: ApiProviderProps) {
  const gustoClient = useMemo(() => {
    const client = new GustoEmbeddedCore({
      serverURL: url,
    })

    const sdkHooks = client._options.hooks || new NativeSDKHooks()

    sdkHooks.registerBeforeRequestHook(apiVersionHook)

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

    if (!client._options.hooks) {
      client._options.hooks = sdkHooks
    }

    return client
  }, [url, headers, hooks])

  const queryClient = useMemo(() => {
    return queryClientFromProps ?? createSdkQueryClient()
  }, [queryClientFromProps])

  return (
    <QueryClientProvider client={queryClient}>
      <GustoEmbeddedProvider client={gustoClient}>{children}</GustoEmbeddedProvider>
    </QueryClientProvider>
  )
}
