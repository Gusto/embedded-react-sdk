import type { AnalyticsEvent } from '@site/types'
import { hasPerformanceConsent } from '../cookieConsent'
import { trackWhenReady } from './loadAnalytics'

/**
 * Single entry point for emitting analytics. Consent is enforced here so no call site
 * can emit before the reader opts in.
 *
 * CDN bundle is loaded lazily on the first consented event.
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (!hasPerformanceConsent()) return
  trackWhenReady(event)
}
