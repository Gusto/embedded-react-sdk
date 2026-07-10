import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { GustoEmbeddedProvider } from '@gusto/embedded-api/react-query/_context'
import { GustoEmbeddedCore } from '@gusto/embedded-api/core'
import { SDKHooks as NativeSDKHooks } from '@gusto/embedded-api/hooks/hooks'
import { useMemo } from 'react'
import { apiVersionHook } from './apiVersionHook'
import { createSdkQueryClient } from './createSdkQueryClient'
import type { SDKHooks, BeforeRequestHook } from '@/types/hooks'

/**
 * Props for {@link ApiProvider}.
 *
 * @internal
 */
export interface ApiProviderProps {
  /** Base URL the SDK uses for all `@gusto/embedded-api-v-2026-06-15` requests. */
  url: string
  /** Default headers applied to every SDK request, in addition to the `X-Gusto-API-Version` header set automatically. */
  headers?: HeadersInit
  /** Lifecycle hooks for intercepting and modifying SDK requests and responses. */
  hooks?: SDKHooks
  /** Subtree that renders inside the API + React Query providers. */
  children: React.ReactNode
  /** Optional React Query client. When omitted, a client is created with the SDK's defaults (auto-invalidation on mutation success). */
  queryClient?: QueryClient
}

/**
 * Wires the `@gusto/embedded-api-v-2026-06-15` client and a React Query client into the React tree.
 *
 * @remarks
 * Registers the SDK's `X-Gusto-API-Version` header on every request, applies any default `headers`,
 * and registers user-supplied lifecycle hooks (`beforeCreateRequest`, `beforeRequest`, `afterSuccess`,
 * `afterError`). When no `queryClient` is supplied, one is created with the SDK's defaults so
 * successful mutations under the `['@gusto/embedded-api-v-2026-06-15']` key invalidate every SDK
 * query automatically. Partners who supply their own `QueryClient` are responsible for matching that
 * contract.
 *
 * Typically wrapped by {@link GustoProvider}; use directly only when composing the provider stack
 * manually.
 *
 * @param props - See {@link ApiProviderProps}.
 * @returns A React subtree wrapped in `QueryClientProvider` and the embedded API context.
 * @internal
 */
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
