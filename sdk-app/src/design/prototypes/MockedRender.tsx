import { useMockHandlers } from '../../mocks/useMockHandlers'
import { useResolvedTheme } from '../../useThemeModeContext'
import { darkTheme } from '../../darkTheme'
import type { PrototypeConfiguration } from './prototypeTypes'
import { GustoProvider } from '@/contexts/GustoProvider/GustoProvider'

/**
 * Renders a single component-state configuration with mocked data.
 *
 * **Design-first convention:** components built for the design app
 * should start life as pure presentational components — accept data via
 * props, dispatch user actions via callbacks, no `useNavigate`, no
 * mutation hooks, no outlet-context lookups. Wiring those concerns up
 * is a *later* step that lives in a container component (the one that
 * eventually backs the live prototype route).
 *
 * Under that convention, most state demos don't need MSW at all: the
 * `render` function just instantiates the presentational component with
 * mock props. The MSW + nested-GustoProvider machinery below is kept
 * because some legacy components are still container-shaped and reach
 * into the SDK directly. For those, MSW intercepts API calls at the
 * service-worker level; the nested GustoProvider points the SDK at
 * `https://api.gusto.com/` (the origin the shared handlers are bound
 * to), so no cross-origin request ever leaves the browser.
 */
const MOCK_BASE_URL = 'https://api.gusto.com/'

export function MockedRender({ configuration }: { configuration: PrototypeConfiguration }) {
  const ready = useMockHandlers(configuration.handlers)
  const resolvedTheme = useResolvedTheme()

  // Don't mount the SDK provider until MSW is actually intercepting,
  // otherwise the first query fires before the service worker is ready
  // and returns "Failed to fetch". When handlers is empty, ready flips
  // true after a single tick — fine.
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
