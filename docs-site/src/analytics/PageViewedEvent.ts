import type { AnalyticsEvent } from '@site/types'

/**
 * Tracks a page view. GustoAnalytics enriches all events with page
 * context (url, path, and title) automatically so no additional data
 * is required.
 */
export class PageViewedEvent implements AnalyticsEvent {
  readonly eventCategory = 'Page'
  readonly eventName = 'Viewed'
}
