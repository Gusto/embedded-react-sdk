import type { HttpRequestEventMap, Interceptor } from '@mswjs/interceptors'
import { FetchInterceptor } from '@mswjs/interceptors/fetch/web'
import { defineNetwork, InterceptorSource } from 'msw/experimental'

// TODO: drop the cast once the node and web builds of @mswjs/interceptors share one Interceptor.
const fetchInterceptor = new FetchInterceptor() as unknown as Interceptor<HttpRequestEventMap>

/**
 * Test network that patches `globalThis.fetch` instead of intercepting sockets, so a request
 * aborted on unmount can't leave an idle socket that passes through to the real host.
 *
 * @see https://github.com/mswjs/interceptors/issues/881
 */
export const server = defineNetwork({
  sources: [new InterceptorSource({ interceptors: [fetchInterceptor] })],
  onUnhandledFrame: 'warn',
  context: { quiet: true },
})
