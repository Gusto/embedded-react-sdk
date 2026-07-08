import { PageViewedEvent } from './PageViewedEvent'
import { trackEvent } from './trackEvent'

/**
 * Emits a page view for the current document; should be called whenever the
 * top-level page changes.
 */
export function routeChangeListener(): void {
  trackEvent(new PageViewedEvent(document.title || window.location.pathname))
}
