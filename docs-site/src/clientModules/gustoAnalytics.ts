import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'
import { installAnalyticsStub } from '../analytics/loadAnalytics'
import { routeChangeListener } from '../analytics/listeners'
import { hasPerformanceConsent } from '../cookieConsent'

// OneTrust re-invokes OptanonWrapper on every consent change, so the landing page view is
// guarded to fire once; SPA navigations go through onRouteDidUpdate.
let landingPageViewSent = false

function handleConsent(): void {
  if (landingPageViewSent || !hasPerformanceConsent()) return
  landingPageViewSent = true
  routeChangeListener()
}

// OneTrust loads asynchronously and can finish after this module hydrates, so its
// on-load OptanonWrapper invocation may fire before we assign our handler (and it does
// not re-fire on a reload where consent is unchanged). Poll until OneTrust publishes its
// groups, then evaluate consent once — otherwise the landing view is lost on reload and
// only actual consent changes emit. ~5s budget (25 × 200ms); OneTrust is normally ready
// well within it, and if it never loads we simply stop.
const CONSENT_POLL_INTERVAL_MS = 200
const CONSENT_POLL_ATTEMPTS = 25

function emitLandingViewWhenConsentResolves(attemptsRemaining: number): void {
  if (landingPageViewSent) return
  // A groups string means OneTrust has resolved consent (granted or not) — evaluate now.
  // If not yet granted, a later OptanonWrapper consent-change call emits the view instead.
  if (typeof window.OnetrustActiveGroups === 'string') {
    handleConsent()
    return
  }
  if (attemptsRemaining <= 0) return
  window.setTimeout(
    () => emitLandingViewWhenConsentResolves(attemptsRemaining - 1),
    CONSENT_POLL_INTERVAL_MS,
  )
}

if (ExecutionEnvironment.canUseDOM) {
  installAnalyticsStub()

  // Bridge OneTrust consent into analytics: OptanonWrapper handles later consent changes,
  // and the poll handles the landing view on load/reload (see note above).
  window.OptanonWrapper = handleConsent
  emitLandingViewWhenConsentResolves(CONSENT_POLL_ATTEMPTS)
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
