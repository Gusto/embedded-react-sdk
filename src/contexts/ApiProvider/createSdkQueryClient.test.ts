import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryObserver, type QueryClient } from '@tanstack/react-query'
import { APIError } from '@gusto/embedded-api/models/errors/apierror'
import { API_QUERY_NAMESPACE } from './apiVersion'
import { createSdkQueryClient } from './createSdkQueryClient'

function createApiError(status: number) {
  return new APIError('API error occurred', {
    response: new Response('', { status }),
    request: new Request('https://api.gusto.com/v1/test'),
    body: '',
  })
}

function returnToTab() {
  window.dispatchEvent(new Event('visibilitychange'))
}

describe('createSdkQueryClient', () => {
  it('configures queries and mutations to run regardless of network state', () => {
    const client = createSdkQueryClient()

    expect(client.getQueryDefaults([API_QUERY_NAMESPACE])).toMatchObject({
      retry: false,
      networkMode: 'always',
    })
    expect(client.getMutationDefaults([API_QUERY_NAMESPACE])).toMatchObject({
      retry: false,
      networkMode: 'always',
    })
  })

  describe('refetching on tab return', () => {
    let client: QueryClient
    const unsubscribers: Array<() => void> = []

    const observe = (name: string, queryFn: () => Promise<string>) => {
      const observer = new QueryObserver(client, {
        queryKey: [API_QUERY_NAMESPACE, name],
        queryFn,
      })
      unsubscribers.push(observer.subscribe(() => {}))
      return observer
    }

    beforeEach(() => {
      client = createSdkQueryClient()
      client.mount()
    })

    afterEach(() => {
      unsubscribers.splice(0).forEach(unsubscribe => {
        unsubscribe()
      })
      client.clear()
      client.unmount()
    })

    it('skips a query whose last fetch returned 401', async () => {
      const unauthorizedFetch = vi
        .fn<() => Promise<string>>()
        .mockRejectedValue(createApiError(401))
      const healthyFetch = vi.fn<() => Promise<string>>().mockResolvedValue('ok')
      const unauthorized = observe('unauthorized', unauthorizedFetch)
      const healthy = observe('healthy', healthyFetch)
      await vi.waitFor(() => {
        expect(unauthorized.getCurrentResult().status).toBe('error')
        expect(healthy.getCurrentResult().status).toBe('success')
      })

      returnToTab()

      await vi.waitFor(() => {
        expect(healthyFetch).toHaveBeenCalledTimes(2)
      })
      expect(unauthorizedFetch).toHaveBeenCalledTimes(1)
    })

    it('still refetches a query whose last fetch failed with another error', async () => {
      const serverErrorFetch = vi.fn<() => Promise<string>>().mockRejectedValue(createApiError(500))
      const serverError = observe('server-error', serverErrorFetch)
      await vi.waitFor(() => {
        expect(serverError.getCurrentResult().status).toBe('error')
      })

      returnToTab()

      await vi.waitFor(() => {
        expect(serverErrorFetch).toHaveBeenCalledTimes(2)
      })
    })

    it('resumes refetching once a later fetch succeeds', async () => {
      const recoveringFetch = vi
        .fn<() => Promise<string>>()
        .mockRejectedValueOnce(createApiError(401))
        .mockResolvedValue('ok')
      const recovering = observe('recovering', recoveringFetch)
      await vi.waitFor(() => {
        expect(recovering.getCurrentResult().status).toBe('error')
      })

      await recovering.refetch()
      expect(recovering.getCurrentResult().status).toBe('success')
      returnToTab()

      await vi.waitFor(() => {
        expect(recoveringFetch).toHaveBeenCalledTimes(3)
      })
    })
  })
})
