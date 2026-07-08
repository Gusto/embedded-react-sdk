import type { AnalyticsEvent } from '@site/types'
import { hasPerformanceConsent } from '../cookieConsent'
import { ensureAnalyticsLoaded } from './loadAnalytics'

/**
 * Single entry point for emitting analytics. Consent is enforced here so no call site
 * can emit before the reader opts in.
 *
 * CDN bundle is loaded lazily on the first consented event.
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (!hasPerformanceConsent()) return
  ensureAnalyticsLoaded()
  window.GustoAnalytics?.track({
    eventCategory: event.eventCategory,
    eventName: event.eventName,
    data: event.data,
  })
}
