import type { AnalyticsEvent } from '@site/types'
import { CONFIG } from '../config'

/**
 * Loads the Gusto Analytics client for this client-side-only docs site and emits events
 * through it.
 *
 * The CDN bundle is a UMD build. Loaded via a plain `<script>`, its wrapper runs
 * `window.GustoAnalytics = {}` the instant it executes, clobbering anything we put there —
 * so the library's documented preload-stub queue is never drained (its own drain reads the
 * empty object the wrapper installed). Rather than fight that, we don't install a stub: we
 * buffer events fired before the bundle loads and replay them ourselves once it does.
 * Direct calls on the loaded client are what reliably emit.
 */

/** Whether the CDN bundle has been injected. Injection happens once, on the first consented event. */
let analyticsScriptInjected = false

/** Whether the bundle load has resolved (loaded or failed). Until then, events are buffered. */
let bundleSettled = false

/** Events fired before the bundle settled, replayed in order once it does. */
const pendingEvents: AnalyticsEvent[] = []

/**
 * Publishes the client configuration on `window.gustoAC`. The bundle reads this when it
 * loads, so this must run before {@link trackWhenReady} injects the bundle.
 */
export function configureAnalytics(): void {
  window.gustoAC = {
    snowplowEnabled: true,
    snowplowAppId: CONFIG.ANALYTICS.SNOWPLOW_APP_ID,
    snowplowTrackerName: CONFIG.ANALYTICS.SNOWPLOW_TRACKER_NAME,
    snowplowTrackingUrl: CONFIG.ANALYTICS.SNOWPLOW_TRACKING_URL,
    snowplowCollectorMode: 'dual_send',
    serverSideEligibleProviders: ['amplitude'],
    /** Emits legacy view on initial page load only */
    autoPageEvent: false,
  }
}

/** Sends one event to the loaded client; a no-op if the bundle failed to load. */
function emit(event: AnalyticsEvent): void {
  window.GustoAnalytics?.track({
    eventCategory: event.eventCategory,
    eventName: event.eventName,
    data: event.data,
  })
}

/**
 * Emits an analytics event, injecting the CDN bundle on first use. Events fired before the
 * bundle finishes loading are buffered and replayed once it settles.
 */
export function trackWhenReady(event: AnalyticsEvent): void {
  ensureAnalyticsLoaded()
  if (bundleSettled) {
    emit(event)
  } else {
    pendingEvents.push(event)
  }
}

/**
 * Injects the CDN bundle exactly once. Reached only after the consent gate in
 * `trackEvent`, so no trackers or cookies are set before the reader opts in. The
 * buffer is flushed whether the bundle loads or fails, so it never grows unbounded.
 */
function ensureAnalyticsLoaded(): void {
  if (analyticsScriptInjected) return
  analyticsScriptInjected = true

  const settle = (): void => {
    bundleSettled = true
    for (const event of pendingEvents.splice(0)) emit(event)
  }

  const script = document.createElement('script')
  script.src = CONFIG.ANALYTICS.SCRIPT_URL
  script.defer = true
  script.onload = settle
  script.onerror = settle
  document.head.appendChild(script)
}
