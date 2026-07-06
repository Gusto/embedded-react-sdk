import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'
import type { GustoAnalyticsClient } from '@site/types'
import { CONFIG } from '../config'
import { hasPerformanceConsent } from '../cookieConsent'

// Page-view-only analytics for sdk.gusto.com via the shared gusto-analytics client
// (routes to Snowplow, inherits Gusto's CPRA/GDPR handling), gated on OneTrust consent.
//
// The OneTrust consent platform is loaded at the application level, in
// docusaurus.config.ts `headTags`; the consent check lives in ./onetrustConsent. This
// module loads gusto-analytics and emits page views only once the reader opts in.
//
// Loading follows the gusto-analytics "static site / client-side only" integration:
// publish `window.gustoAC` config, install a preload stub that queues page() calls,
// then load the CDN bundle — which replays the queue and swaps in the real singleton.
// See gusto-analytics/documentation/WALKTHROUGH.md (§3).
//
// The bundle itself is only injected after Performance-Cookies consent, so Snowplow
// initializes no trackers or cookies before the reader opts in.

// OneTrust may invoke OptanonWrapper several times per page load, so the landing
// page view is guarded to fire only once; SPA navigations go through onRouteDidUpdate.
let landingPageViewSent = false

// The CDN bundle is injected at most once, on first consented page view.
let analyticsScriptInjected = false

// Publishes config and installs the preload stub. The stub is a Proxy over an array:
// any method call (e.g. page()) is queued until the CDN bundle loads and replaces
// window.GustoAnalytics with the real singleton, which then replays the queue.
function installAnalyticsStub(): void {
  // gusto-analytics reads this config when it runs; set it before the bundle loads.
  window.gustoAC = {
    snowplowEnabled: true,
    snowplowAppId: CONFIG.ANALYTICS.SNOWPLOW_APP_ID,
    snowplowTrackerName: CONFIG.ANALYTICS.SNOWPLOW_TRACKER_NAME,
    snowplowTrackingUrl: CONFIG.ANALYTICS.SNOWPLOW_TRACKING_URL,
    snowplowCollectorMode: 'dual_send',
    // Docs routes aren't recognized by the client's auto page-name resolver, so we
    // fire page views manually on each route change instead.
    autoPageEvent: false,
  }

  const queue: unknown[] = []
  window.GustoAnalytics = new Proxy(queue, {
    get(target, prop, receiver) {
      if (prop in target) return Reflect.get(target, prop, receiver)
      return (...args: unknown[]) => {
        target.push([prop, ...args])
        return window.GustoAnalytics
      }
    },
  }) as unknown as GustoAnalyticsClient
}

// Deferred until consent so Snowplow sets no trackers or cookies before the reader
// opts in; idempotent so repeated page views inject the bundle only once.
function ensureAnalyticsLoaded(): void {
  if (analyticsScriptInjected) return
  analyticsScriptInjected = true

  const script = document.createElement('script')
  script.src = CONFIG.ANALYTICS.SCRIPT_URL
  script.defer = true
  document.head.appendChild(script)
}

function sendPageView(): void {
  if (!hasPerformanceConsent()) return
  ensureAnalyticsLoaded()
  // Queued by the stub if the bundle is still loading; fired live once it has.
  window.GustoAnalytics?.page({ name: document.title || window.location.pathname })
}

function handleConsent(): void {
  if (landingPageViewSent || !hasPerformanceConsent()) return
  landingPageViewSent = true
  sendPageView()
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
// renders, so document.title still holds the previous page's title when
// onRouteDidUpdate fires. Wait (a few frames, capped) for it to change before reading
// it for the page name, so the view isn't attributed to the prior page.
function sendPageViewAfterTitleUpdate(previousTitle: string, framesRemaining: number): void {
  if (document.title !== previousTitle || framesRemaining === 0) {
    sendPageView()
    return
  }
  requestAnimationFrame(() => sendPageViewAfterTitleUpdate(previousTitle, framesRemaining - 1))
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
  sendPageViewAfterTitleUpdate(document.title, 10)
}
