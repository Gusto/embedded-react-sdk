import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GustoEmbeddedProvider } from '@gusto/embedded-api/react-query/_context'
import { GustoEmbeddedCore } from '@gusto/embedded-api/core'
import { HTTPClient } from '@gusto/embedded-api/lib/http'

export function ApiProvider({
  url,
  headers,
  children,
}: {
  url: string
  headers?: Headers
  children: React.ReactNode
}) {
  const httpClientWithHeaders = new HTTPClient({
    fetcher: async request => {
      if (request instanceof Request && headers) {
        headers.forEach((headerValue, headerName) => {
          if (headerValue) {
            request.headers.set(headerName, headerValue)
          }
        })
      }

      return fetch(request)
    },
  })

  const queryClient = new QueryClient()
  const gustoClient = new GustoEmbeddedCore({
    serverURL: url,
    httpClient: httpClientWithHeaders,
  })
  queryClient.setQueryDefaults(['@gusto/embedded-api'], { retry: false })
  queryClient.setMutationDefaults(['@gusto/embedded-api'], { retry: false })
  return (
    <QueryClientProvider client={queryClient}>
      <GustoEmbeddedProvider client={gustoClient}>{children}</GustoEmbeddedProvider>
    </QueryClientProvider>
  )
}
