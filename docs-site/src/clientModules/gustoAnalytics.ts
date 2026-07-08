import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'
import { installAnalyticsStub } from '../analytics/loadAnalytics'
import { routeChangeListener } from '../analytics/listeners'
import { hasPerformanceConsent } from '../cookieConsent'

// OneTrust re-invokes OptanonWrapper several times per load, so the landing page view is
// guarded to fire once; SPA navigations go through onRouteDidUpdate.
let landingPageViewSent = false

function handleConsent(): void {
  if (landingPageViewSent || !hasPerformanceConsent()) return
  landingPageViewSent = true
  routeChangeListener()
}

if (ExecutionEnvironment.canUseDOM) {
  installAnalyticsStub()

  // Bridge OneTrust consent into analytics. OneTrust re-invokes OptanonWrapper on load
  // and on every consent change; the trailing catch-up call covers the case where
  // consent had already resolved before this module ran.
  window.OptanonWrapper = handleConsent
  handleConsent()
}

// react-helmet-async flushes the new <title> on an animation frame after the route
// renders, so document.title still holds the previous page's title when onRouteDidUpdate
// fires. Wait (a few frames, capped) for it to change before emitting, so the view isn't
// attributed to the prior page.
function emitPageViewAfterTitleUpdate(previousTitle: string, framesRemaining: number): void {
  if (document.title !== previousTitle || framesRemaining === 0) {
    routeChangeListener()
    return
  }
  requestAnimationFrame(() => emitPageViewAfterTitleUpdate(previousTitle, framesRemaining - 1))
}

// Docusaurus client-module lifecycle: fires after every client-side route change.
// - Skips the initial load (previousLocation is null); that page view is sent once
//   consent resolves, via OptanonWrapper.
// - Skips same-pathname updates (in-page anchors, query changes) to avoid double-counting.
export function onRouteDidUpdate({
  previousLocation,
  location,
}: {
  previousLocation: { pathname: string } | null
  location: { pathname: string }
}): void {
  if (!previousLocation || location.pathname === previousLocation.pathname) return
  emitPageViewAfterTitleUpdate(document.title, 10)
}
