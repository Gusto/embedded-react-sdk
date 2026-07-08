import type { AnalyticsEvent } from '@site/types'

/**
 * Tracks a page view. `name` should be the page title.
 */
export class PageViewedEvent implements AnalyticsEvent<{ name: string }> {
  readonly eventCategory = 'Page'
  readonly eventName = 'Viewed'
  readonly data: { name: string }

  constructor(name: string) {
    this.data = { name }
  }
}
