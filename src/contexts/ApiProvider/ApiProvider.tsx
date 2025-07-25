import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GustoEmbeddedProvider } from '@gusto/embedded-api/react-query/_context'
import { GustoEmbeddedCore } from '@gusto/embedded-api/core'
import { HTTPClient } from '@gusto/embedded-api/lib/http'
import { useMemo } from 'react'

export function ApiProvider({
  url,
  headers,
  children,
}: {
  url: string
  headers?: HeadersInit
  children: React.ReactNode
}) {
  const httpClientWithHeaders = useMemo(
    () =>
      new HTTPClient({
        fetcher: async request => {
          if (request instanceof Request && headers) {
            const headersInstance = new Headers(headers)
            headersInstance.forEach((headerValue, headerName) => {
              if (headerValue) {
                request.headers.set(headerName, headerValue)
              }
            })
          }

          return fetch(request)
        },
      }),
    [headers],
  )

  const gustoClient = useMemo(
    () =>
      new GustoEmbeddedCore({
        serverURL: url,
        httpClient: httpClientWithHeaders,
      }),
    [httpClientWithHeaders, url],
  )

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
