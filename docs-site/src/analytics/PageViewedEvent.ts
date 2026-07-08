import type { AnalyticsEvent } from '@site/types'

/**
 * Tracks a page view.
 */
export class PageViewedEvent implements AnalyticsEvent {
  readonly eventCategory = 'Page'
  readonly eventName = 'Viewed'
}
