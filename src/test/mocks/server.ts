import { FetchInterceptor } from '@mswjs/interceptors/fetch/web'
import { defineNetwork, InterceptorSource } from 'msw/experimental'

/**
 * Test network that patches `globalThis.fetch` instead of intercepting sockets, so a request
 * aborted on unmount can't leave an idle socket that passes through to the real host.
 *
 * The web `FetchInterceptor` is typed against the browser build of `@mswjs/interceptors`.
 * `customConditions: ["browser"]` in `tsconfig.json` makes `InterceptorSource` resolve the same
 * build, so the two `Interceptor` types match.
 *
 * @see https://github.com/mswjs/interceptors/issues/881
 */
export const server = defineNetwork({
  sources: [new InterceptorSource({ interceptors: [new FetchInterceptor()] })],
  onUnhandledFrame: 'warn',
  context: { quiet: true },
})
