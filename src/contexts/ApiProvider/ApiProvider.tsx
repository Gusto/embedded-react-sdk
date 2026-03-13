import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GustoEmbeddedProvider } from '@gusto/embedded-api/react-query/_context'
import { GustoEmbeddedCore } from '@gusto/embedded-api/core'
import { SDKHooks as NativeSDKHooks } from '@gusto/embedded-api/hooks/hooks'
import { useMemo } from 'react'
import { apiVersionHook } from './apiVersionHook'
import type { SDKHooks, BeforeRequestHook, AfterSuccessHook } from '@/types/hooks'

// TODO(EMBPAY-591): Remove once @gusto/embedded-api handles nullable `final_payout_unused_hours_input`
const PAYROLL_OPERATION_IDS = new Set([
  'get-v1-companies-company_id-payrolls-payroll_id',
  'put-v1-companies-company_id-payrolls-payroll_id-prepare',
])

const payrollResponseFixHook: AfterSuccessHook = {
  afterSuccess: async (context, response) => {
    if (!PAYROLL_OPERATION_IDS.has(context.operationID)) return response

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) return response

    const text = await response.text()
    if (!text.includes('final_payout_unused_hours_input')) return new Response(text, response)

    const fixed = text.replace(
      /"final_payout_unused_hours_input"\s*:\s*null/g,
      '"final_payout_unused_hours_input":"0"',
    )
    return new Response(fixed, response)
  },
}

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
    sdkHooks.registerAfterSuccessHook(payrollResponseFixHook)

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
    if (queryClientFromProps) {
      return queryClientFromProps
    }

    const client = new QueryClient()

    const onSuccess = async () => {
      await client.invalidateQueries({ queryKey: ['@gusto/embedded-api'] })
    }
    client.setQueryDefaults(['@gusto/embedded-api'], { retry: false })
    client.setMutationDefaults(['@gusto/embedded-api'], { onSuccess, retry: false })

    return client
  }, [queryClientFromProps])

  return (
    <QueryClientProvider client={queryClient}>
      <GustoEmbeddedProvider client={gustoClient}>{children}</GustoEmbeddedProvider>
    </QueryClientProvider>
  )
}
