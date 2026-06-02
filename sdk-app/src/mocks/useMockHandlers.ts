import { useEffect, useState } from 'react'
import type { RequestHandler } from 'msw'
import { worker } from './browser'

let workerStarted = false
let startPromise: Promise<void> | null = null

async function ensureWorkerStarted() {
  if (workerStarted) return
  if (!startPromise) {
    startPromise = worker
      .start({
        onUnhandledRequest: 'bypass',
        serviceWorker: { url: '/mockServiceWorker.js' },
        quiet: true,
      })
      .then(() => {
        workerStarted = true
      })
  }
  await startPromise
}

/**
 * Install a set of MSW request handlers for the lifetime of the calling
 * component. Returns `true` once the service worker is registered and
 * the handlers are active — gate any rendering that fires API calls
 * (e.g. SDK components inside a `GustoProvider`) on this flag, otherwise
 * the first request goes out before MSW can intercept and you get
 * "Failed to fetch".
 *
 * On unmount or handler-set change, the worker resets so subsequent
 * navigations aren't affected. Anything not explicitly mocked passes
 * through to the real network (`onUnhandledRequest: 'bypass'`).
 */
export function useMockHandlers(handlers: readonly RequestHandler[]): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    setReady(false)
    void ensureWorkerStarted().then(() => {
      if (cancelled) return
      worker.use(...handlers)
      setReady(true)
    })
    return () => {
      cancelled = true
      worker.resetHandlers()
    }
  }, [handlers])

  return ready
}
