import type { GustoAnalyticsClient } from '@site/types'
import { CONFIG } from '../config'

// Loading for the gusto-analytics client, following the "static site / client-side only"
// integration (gusto-analytics WALKTHROUGH.md §3): publish window.gustoAC config, install
// a preload stub that queues calls, then inject the CDN bundle — which replays the queue
// and swaps in the real singleton. Kept separate from the event wrapper (./trackEvent)
// so the wrapper only ever emits; how the client gets on the page is a distinct concern.

// The CDN bundle is injected at most once, on first consented page view.
let analyticsScriptInjected = false

// Publishes config and installs the preload stub. The stub is a Proxy over an array:
// any method call (e.g. page()) is queued until the CDN bundle loads and replaces
// window.GustoAnalytics with the real singleton, which then replays the queue.
export function installAnalyticsStub(): void {
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

// Deferred until consent so Snowplow sets no trackers or cookies before the reader opts
// in; idempotent so repeated page views inject the bundle only once.
export function ensureAnalyticsLoaded(): void {
  if (analyticsScriptInjected) return
  analyticsScriptInjected = true

  const script = document.createElement('script')
  script.src = CONFIG.ANALYTICS.SCRIPT_URL
  script.defer = true
  document.head.appendChild(script)
}
