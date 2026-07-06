import { PageViewedEvent } from './PageViewedEvent'
import { trackEvent } from './trackEvent'

// Emits a page view for the current document. Mirrors gusto-analytics' standard-analytics
// `routeChangeListener`: the wrapper exposes it, the host wires it to its router (here,
// Docusaurus' onRouteDidUpdate and the OneTrust consent bridge in ../clientModules).
export function routeChangeListener(): void {
  trackEvent(new PageViewedEvent(document.title || window.location.pathname))
}
