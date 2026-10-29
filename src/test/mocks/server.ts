import { FetchInterceptor } from '@mswjs/interceptors/fetch/web'
import { defineNetwork, HttpNetworkFrame, NetworkSource } from 'msw/experimental'

class FetchNetworkFrame extends HttpNetworkFrame {
  readonly #respond: (response: Response) => void

  constructor(id: string, request: Request, respond: (response: Response) => void) {
    super({ id, request })
    this.#respond = respond
  }

  passthrough() {}

  respondWith(response?: Response) {
    if (response) this.#respond(response)
  }

  errorWith(reason?: unknown) {
    if (reason instanceof Response) {
      this.respondWith(reason)
      return
    }
    throw reason
  }
}

class FetchNetworkSource extends NetworkSource<FetchNetworkFrame> {
  readonly #interceptor = new FetchInterceptor()

  enable() {
    this.#interceptor.apply()
    this.#interceptor.on('request', ({ requestId, request, controller }) =>
      this.queue(
        new FetchNetworkFrame(requestId, request, response => {
          controller.respondWith(response)
        }),
      ),
    )
  }

  disable() {
    void super.disable()
    this.#interceptor.dispose()
  }
}

/**
 * Test network that patches `globalThis.fetch` instead of intercepting sockets, so a request
 * aborted on unmount can't leave an idle socket that passes through to the real host.
 *
 * @see https://github.com/mswjs/interceptors/issues/881
 */
export const server = defineNetwork({
  sources: [new FetchNetworkSource()],
  onUnhandledFrame: 'warn',
  context: { quiet: true },
})
