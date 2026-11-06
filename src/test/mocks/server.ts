import { FetchInterceptor } from '@mswjs/interceptors/fetch/web'
import { defineNetwork, InterceptorSource } from 'msw/experimental'

/**
 * The mock server for tests. It only mocks `fetch`.
 *
 * Why not MSW's normal `setupServer()`: in MSW 3, `setupServer()` mocks at the network
 * connection level. When a test cancels a request (for example, a component unmounts while
 * loading), MSW can let a real connection to the API host slip through. A later mocked request
 * can land on that real connection and fail. Tests see this as a random `fetch failed` error.
 *
 * Mocking `fetch` itself means tests never open a real connection, so this can't happen. The
 * SDK calls the API only through `fetch`. Requests made any other way (like XHR) are not mocked.
 *
 * This uses `msw/experimental`, so check it when upgrading MSW. Once MSW fixes the bug below,
 * we can go back to `setupServer()`.
 *
 * `customConditions: ["browser"]` in `tsconfig.json` is what lets this type-check without a cast.
 *
 * @see https://github.com/mswjs/interceptors/issues/881
 * @see https://github.com/mswjs/msw/issues/2811
 */
export const server = defineNetwork({
  sources: [new InterceptorSource({ interceptors: [new FetchInterceptor()] })],
  onUnhandledFrame: 'warn',
  context: { quiet: true },
})
