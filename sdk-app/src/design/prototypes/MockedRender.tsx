import { useMockHandlers } from '../../mocks/useMockHandlers'
import { useResolvedTheme } from '../../useThemeModeContext'
import { darkTheme } from '../../darkTheme'
import type { PrototypeConfiguration } from './prototypeTypes'
import { GustoProvider } from '@/contexts/GustoProvider/GustoProvider'

/**
 * The shared MSW handlers in `src/test/mocks/apis/*` are bound to
 * `https://api.gusto.com/v1/...`. The dev DesignLayout's GustoProvider
 * points the SDK at `${origin}/api/` so live calls flow through Vite's
 * dev proxy. To get the request URL to match the handlers without
 * forking 20+ handlers, mock mode re-renders inside a nested
 * GustoProvider whose baseUrl matches the handler origin. MSW intercepts
 * those fetches at the service-worker level; no cross-origin request
 * ever leaves the browser.
 */
const MOCK_BASE_URL = 'https://api.gusto.com/'

export function MockedRender({ configuration }: { configuration: PrototypeConfiguration }) {
  const ready = useMockHandlers(configuration.handlers)
  const resolvedTheme = useResolvedTheme()

  // Don't mount the SDK provider until MSW is actually intercepting,
  // otherwise the first query fires before the service worker is ready
  // and returns "Failed to fetch".
  if (!ready) return null

  return (
    <GustoProvider
      config={{ baseUrl: MOCK_BASE_URL }}
      theme={resolvedTheme === 'dark' ? darkTheme : undefined}
    >
      {configuration.render()}
    </GustoProvider>
  )
}
