import { hasPerformanceConsent } from '../cookieConsent'
import { ensureAnalyticsLoaded } from './loadAnalytics'
import type { PageViewedEvent } from './PageViewedEvent'

// Single entry point for emitting analytics. Consent is enforced here so no call site can
// emit before the reader opts in; the CDN bundle is loaded lazily on the first consented
// event.
export function trackEvent(event: PageViewedEvent): void {
  if (!hasPerformanceConsent()) return
  ensureAnalyticsLoaded()
  // Queued by the preload stub if the bundle is still loading; fired live once it has.
  window.GustoAnalytics?.page({ name: event.name })
}
